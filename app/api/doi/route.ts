import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/rag'

function chunkText(text: string, maxWords = 400, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
    i += maxWords - overlap
  }
  return chunks.filter(c => c.trim().length > 80)
}

export async function POST(req: NextRequest) {
  try {
    const { doi } = await req.json()
    if (!doi?.trim()) return NextResponse.json({ error: 'DOI obrigatório.' }, { status: 400 })

    const cleanDoi = doi.trim().replace(/^https?:\/\/doi\.org\//i, '')

    // Busca metadados no Crossref
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`
    const crossrefRes = await fetch(crossrefUrl, {
      headers: { 'User-Agent': 'MIA-BioedTech/1.0 (mailto:contato@bioedtech.com)' },
    })

    if (!crossrefRes.ok) {
      return NextResponse.json({ error: 'DOI não encontrado no Crossref. Verifique se está correto.' }, { status: 404 })
    }

    const crossrefData = await crossrefRes.json()
    const work = crossrefData.message

    const title = Array.isArray(work.title) ? work.title[0] : (work.title ?? 'Sem título')
    const authors = (work.author ?? [])
      .slice(0, 5)
      .map((a: { given?: string; family?: string }) => `${a.given ?? ''} ${a.family ?? ''}`.trim())
      .join(', ')
    const journal = work['container-title']?.[0] ?? work.publisher ?? ''
    const year = work.issued?.['date-parts']?.[0]?.[0] ?? ''
    const abstract: string = work.abstract
      ? work.abstract.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : ''

    if (!abstract) {
      return NextResponse.json({
        ok: false,
        indexed: false,
        title,
        authors,
        journal,
        year,
        message: 'Metadados encontrados, mas este artigo não disponibiliza o abstract via Crossref. Tente colar o texto manualmente.',
      })
    }

    // Indexa na kb_embeddings
    const content = `${title}\n\nAutores: ${authors}\nPeriódico: ${journal} (${year})\nDOI: ${cleanDoi}\n\n${abstract}`
    const supabase = await createClient()
    const chunks = chunkText(content)

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk)
      await supabase.from('kb_embeddings').insert({
        content: chunk,
        embedding,
        metadata: { fonte: `doi:${cleanDoi}`, categoria: 'artigo-cientifico', tags: ['impressão-alimentar', '3dfp'] },
      })
    }

    return NextResponse.json({
      ok: true,
      indexed: true,
      title,
      authors,
      journal,
      year,
      chunks: chunks.length,
      abstract: abstract.slice(0, 400) + (abstract.length > 400 ? '…' : ''),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
