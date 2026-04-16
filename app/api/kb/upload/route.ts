import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/rag'

/** Divide texto em chunks de ~400 palavras com 50 palavras de sobreposição */
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
    const { title, content, source, category } = await req.json()

    if (!content || content.trim().length < 100) {
      return NextResponse.json({ error: 'Conteúdo muito curto (mínimo 100 caracteres).' }, { status: 400 })
    }

    const supabase = await createClient()
    const chunks = chunkText(content)
    const fonte = source?.trim() || title?.trim() || 'Sem fonte'
    const categoria = category?.trim() || 'artigo'

    const rows = []
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk)
      rows.push({
        content: chunk,
        embedding,
        metadata: { fonte, categoria, tags: [categoria, 'impressão-alimentar'] },
      })
    }

    const { error } = await supabase.from('kb_embeddings').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, chunks: rows.length, fonte, categoria })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
