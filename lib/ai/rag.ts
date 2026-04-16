import { createClient } from '@/lib/supabase/server'

export interface KBChunk {
  content: string
  metadata: {
    fonte: string
    categoria: string
    tags: string[]
  }
  similarity: number
}

// Palavras-chave que indicam consulta nutricional → busca direto na TACO
const TACO_KEYWORDS = [
  'proteína', 'proteina', 'carboidrato', 'gordura', 'lipídio', 'lipidio',
  'fibra', 'calorias', 'kcal', 'sódio', 'sodio', 'cálcio', 'calcio',
  'ferro', 'vitamina', 'aminoácido', 'aminoacido', 'ácido graxo', 'acido graxo',
  'nutricional', 'composição', 'composicao', 'taco', 'valor nutricional',
  'por 100g', 'tabela', 'nutriente',
]

function queryIsTacoRelated(query: string): boolean {
  const q = query.toLowerCase()
  return TACO_KEYWORDS.some(kw => q.includes(kw))
}

/**
 * Busca alimentos na TACO por nome usando full-text search.
 * Retorna contexto formatado com os valores nutricionais encontrados.
 */
async function retrieveTacoContext(query: string, limit = 5): Promise<string> {
  const supabase = await createClient()

  // Extrai termos candidatos a nome de alimento (palavras com 3+ chars, não stopwords)
  const stopwords = new Set(['com', 'sem', 'para', 'qual', 'quanto', 'tem', 'tem', 'uma', 'um', 'de', 'do', 'da', 'no', 'na', 'os', 'as', 'e', 'o', 'a'])
  const terms = query
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõúüç\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !stopwords.has(t))

  if (terms.length === 0) return ''

  const searchQuery = terms.join(' & ')

  const { data, error } = await supabase
    .from('taco_alimentos')
    .select(`
      descricao, categoria,
      energia_kcal, proteina_g, carboidrato_g, lipidios_g, fibra_g,
      sodio_mg, calcio_mg, ferro_mg, vitamina_c_mg,
      saturados_g, monoinsaturados_g, polinsaturados_g,
      triptofano_g, leucina_g, lisina_g
    `)
    .textSearch('descricao', searchQuery, { config: 'portuguese' })
    .limit(limit)

  if (error || !data || data.length === 0) return ''

  const rows = data.map(a => {
    const campos = [
      `**${a.descricao}** (${a.categoria ?? '—'})`,
      `  Energia: ${a.energia_kcal ?? '—'} kcal | Proteína: ${a.proteina_g ?? '—'} g | Carboidrato: ${a.carboidrato_g ?? '—'} g | Lipídios: ${a.lipidios_g ?? '—'} g | Fibra: ${a.fibra_g ?? '—'} g`,
      `  Sódio: ${a.sodio_mg ?? '—'} mg | Cálcio: ${a.calcio_mg ?? '—'} mg | Ferro: ${a.ferro_mg ?? '—'} mg | Vit C: ${a.vitamina_c_mg ?? '—'} mg`,
    ]
    if (a.saturados_g != null) {
      campos.push(`  AG Saturados: ${a.saturados_g} g | Monoinsaturados: ${a.monoinsaturados_g ?? '—'} g | Polinsaturados: ${a.polinsaturados_g ?? '—'} g`)
    }
    if (a.leucina_g != null) {
      campos.push(`  Leucina: ${a.leucina_g} g | Lisina: ${a.lisina_g ?? '—'} g | Triptofano: ${a.triptofano_g ?? '—'} g`)
    }
    return campos.join('\n')
  })

  return `## Dados TACO (por 100g de parte comestível)\n\n${rows.join('\n\n')}`
}

export async function retrieveContext(query: string, limit = 5): Promise<string> {
  try {
    const supabase = await createClient()
    const parts: string[] = []

    // Busca TACO se a query parecer nutricional
    if (queryIsTacoRelated(query)) {
      const tacoCtx = await retrieveTacoContext(query, limit)
      if (tacoCtx) parts.push(tacoCtx)
    }

    // Busca semântica na KB via pgvector
    const embedding = await generateEmbedding(query)
    const { data: kbData } = await supabase.rpc('match_kb_embeddings', {
      query_embedding: embedding,
      match_count: limit,
    })
    if (kbData && kbData.length > 0) {
      const kbCtx = kbData
        .filter((c: { similarity: number }) => c.similarity > 0.3)
        .map((c: { content: string; metadata: { fonte?: string } }) =>
          `[Fonte: ${c.metadata?.fonte ?? '—'}]\n${c.content}`
        )
        .join('\n\n')
      if (kbCtx) parts.push(`## Base de Conhecimento MIA\n\n${kbCtx}`)
    }

    return parts.join('\n\n---\n\n')
  } catch {
    return ''
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  })
  const data = await response.json()
  return data.data[0].embedding
}
