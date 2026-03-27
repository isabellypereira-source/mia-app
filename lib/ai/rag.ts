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

export async function retrieveContext(query: string, limit = 5): Promise<string> {
  try {
    // Em produção: gerar embedding da query e buscar no pgvector
    // Por enquanto, retorna contexto vazio (RAG será ativado após indexação da KB)
    const supabase = await createClient()

    // TODO: gerar embedding via OpenAI text-embedding-3-small
    // const embedding = await generateEmbedding(query)
    // const { data } = await supabase.rpc('match_kb_embeddings', { query_embedding: embedding, match_count: limit })

    return '' // Sem contexto por enquanto
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
