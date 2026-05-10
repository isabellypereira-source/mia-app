import { NextRequest, NextResponse } from 'next/server'

export interface ArxivEntry {
  id: string
  title: string
  authors: string
  summary: string
  published: string
  link: string
  categories: string
  doi?: string
  journal?: string
  citacoes?: number
  source: 'openalex' | 'pubmed' | 'crossref'
}

// ─── Tradução PT→EN de termos comuns ────────────────────────────────
const TRADUCOES: Record<string, string> = {
  'pure de batata': 'mashed potato',
  'purê de batata': 'mashed potato',
  'batata doce': 'sweet potato',
  'batata-doce': 'sweet potato',
  'feijão': 'bean',
  'arroz': 'rice',
  'milho': 'corn maize',
  'mandioca': 'cassava',
  'farinha': 'flour',
  'amido': 'starch',
  'goma xantana': 'xanthan gum',
  'goma guar': 'guar gum',
  'gelatina': 'gelatin',
  'pectina': 'pectin',
  'carragena': 'carrageenan',
  'alginato': 'alginate',
  'metilcelulose': 'methylcellulose',
  'hidrocoloide': 'hydrocolloid',
  'hidrocolóide': 'hydrocolloid',
  'proteína': 'protein',
  'proteína de ervilha': 'pea protein',
  'proteína isolada': 'protein isolate',
  'proteina vegetal': 'plant protein',
  'reologia': 'rheology',
  'viscosidade': 'viscosity',
  'tensão de escoamento': 'yield stress',
  'extrusão': 'extrusion',
  'impressão 3d': '3D printing',
  'impressão tridimensional': '3D printing',
  'alimento': 'food',
  'alimentos': 'food',
  'alimentar': 'food',
  'estabilidade': 'stability',
  'textura': 'texture',
  'colapso': 'collapse',
  'sinérese': 'syneresis',
  'gelificação': 'gelation',
  'emulsão': 'emulsion',
  'fibras': 'fiber',
  'açúcar': 'sugar',
  'sódio': 'sodium',
  'sal': 'salt',
}

function traduzirQuery(q: string): string {
  let out = q.toLowerCase()
  const ordenado = Object.keys(TRADUCOES).sort((a, b) => b.length - a.length)
  for (const pt of ordenado) {
    if (out.includes(pt)) out = out.replace(pt, TRADUCOES[pt])
  }
  return out
}

// ─── OpenAlex ───────────────────────────────────────────────────────
interface OpenAlexAuthor { author?: { display_name?: string } }
interface OpenAlexConcept { display_name?: string; level?: number }
interface OpenAlexWork {
  id: string
  doi?: string | null
  title?: string | null
  display_name?: string | null
  publication_date?: string | null
  publication_year?: number
  cited_by_count?: number
  authorships?: OpenAlexAuthor[]
  abstract_inverted_index?: Record<string, number[]> | null
  primary_location?: { source?: { display_name?: string } | null } | null
  concepts?: OpenAlexConcept[]
}

function reconstructAbstract(inv?: Record<string, number[]> | null): string {
  if (!inv) return ''
  const positions: Array<[number, string]> = []
  for (const [word, idxs] of Object.entries(inv)) {
    for (const i of idxs) positions.push([i, word])
  }
  positions.sort((a, b) => a[0] - b[0])
  return positions.map(p => p[1]).join(' ')
}

async function buscarOpenAlex(query: string, max: number): Promise<ArxivEntry[]> {
  const url =
    'https://api.openalex.org/works' +
    `?search=${encodeURIComponent(query)}` +
    `&per-page=${max}` +
    `&sort=relevance_score:desc` +
    `&select=id,doi,title,display_name,publication_date,publication_year,cited_by_count,authorships,abstract_inverted_index,primary_location,concepts` +
    `&mailto=isabelly.pereira@bioedtech.com.br`

  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) return []
  const json = (await resp.json()) as { results?: OpenAlexWork[] }
  const works = json.results ?? []

  return works.map(w => {
    const title = w.title ?? w.display_name ?? '(sem título)'
    const abstract = reconstructAbstract(w.abstract_inverted_index ?? null)
    const authorsList = (w.authorships ?? []).slice(0, 3).map(a => a.author?.display_name ?? '').filter(Boolean)
    const authors = authorsList.join(', ') + ((w.authorships?.length ?? 0) > 3 ? ' et al.' : '')
    const published = w.publication_date || (w.publication_year ? String(w.publication_year) : '')
    const journal = w.primary_location?.source?.display_name ?? ''
    const doi = w.doi ? w.doi.replace('https://doi.org/', '') : undefined
    const link = doi ? `https://doi.org/${doi}` : w.id
    const topConcept = (w.concepts ?? [])
      .filter(c => (c.level ?? 99) <= 2)
      .slice(0, 1).map(c => c.display_name ?? '').filter(Boolean).join('')

    return {
      id: w.id,
      title,
      authors: authors || 'Autores não disponíveis',
      summary: abstract || 'Abstract não disponível.',
      published: published.slice(0, 10),
      link,
      categories: topConcept || journal,
      doi,
      journal,
      citacoes: w.cited_by_count ?? 0,
      source: 'openalex' as const,
    }
  })
}

// ─── PubMed (E-utilities) ───────────────────────────────────────────
interface PubmedSummary {
  uid?: string
  title?: string
  authors?: Array<{ name: string }>
  fulljournalname?: string
  pubdate?: string
  source?: string
  articleids?: Array<{ idtype: string; value: string }>
}

async function buscarPubmed(query: string, max: number): Promise<ArxivEntry[]> {
  // 1. ESearch: pega PMIDs
  const searchUrl =
    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi' +
    `?db=pubmed&term=${encodeURIComponent(query)}&retmax=${max}&retmode=json&sort=relevance`

  const sRes = await fetch(searchUrl, { next: { revalidate: 3600 } })
  if (!sRes.ok) return []
  const sData = await sRes.json() as { esearchresult?: { idlist?: string[] } }
  const ids = sData.esearchresult?.idlist ?? []
  if (ids.length === 0) return []

  // 2. ESummary: pega metadados
  const sumUrl =
    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi' +
    `?db=pubmed&id=${ids.join(',')}&retmode=json`

  const sumRes = await fetch(sumUrl, { next: { revalidate: 3600 } })
  if (!sumRes.ok) return []
  const sumData = await sumRes.json() as { result?: Record<string, PubmedSummary> & { uids?: string[] } }
  const result = sumData.result
  if (!result) return []

  const entries: ArxivEntry[] = []
  for (const id of ids) {
    const item = result[id]
    if (!item) continue
    const title = item.title ?? '(sem título)'
    const authorsList = (item.authors ?? []).slice(0, 3).map(a => a.name)
    const authors = authorsList.join(', ') + ((item.authors?.length ?? 0) > 3 ? ' et al.' : '')
    const journal = item.fulljournalname ?? item.source ?? ''
    const doi = item.articleids?.find(x => x.idtype === 'doi')?.value
    const link = doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${id}/`

    entries.push({
      id: `pubmed:${id}`,
      title,
      authors: authors || 'Autores não disponíveis',
      summary: '',
      published: item.pubdate ?? '',
      link,
      categories: 'PubMed',
      doi,
      journal,
      source: 'pubmed' as const,
    })
  }
  return entries
}

// ─── CrossRef ───────────────────────────────────────────────────────
interface CrossrefAuthor { given?: string; family?: string }
interface CrossrefItem {
  DOI?: string
  title?: string[]
  author?: CrossrefAuthor[]
  'container-title'?: string[]
  abstract?: string
  issued?: { 'date-parts'?: number[][] }
  'is-referenced-by-count'?: number
  URL?: string
}

async function buscarCrossref(query: string, max: number): Promise<ArxivEntry[]> {
  const url =
    'https://api.crossref.org/works' +
    `?query=${encodeURIComponent(query)}&rows=${max}&select=DOI,title,author,container-title,abstract,issued,is-referenced-by-count,URL`

  const resp = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'MIA-Morphe (mailto:isabelly.pereira@bioedtech.com.br)' },
  })
  if (!resp.ok) return []
  const json = await resp.json() as { message?: { items?: CrossrefItem[] } }
  const items = json.message?.items ?? []

  return items.map((it, i): ArxivEntry => {
    const title = it.title?.[0] ?? '(sem título)'
    const authorsList = (it.author ?? []).slice(0, 3).map(a => `${a.given ?? ''} ${a.family ?? ''}`.trim()).filter(Boolean)
    const authors = authorsList.join(', ') + ((it.author?.length ?? 0) > 3 ? ' et al.' : '')
    const journal = it.['container-title']?.[0] ?? ''
    const yearArr = it.issued?.['date-parts']?.[0]
    const published = yearArr ? yearArr.slice(0, 3).map(n => String(n).padStart(2, '0')).join('-') : ''
    const doi = it.DOI
    const link = doi ? `https://doi.org/${doi}` : (it.URL ?? '')
    const summary = (it.abstract ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

    return {
      id: `crossref:${doi ?? i}`,
      title,
      authors: authors || 'Autores não disponíveis',
      summary: summary || 'Abstract não disponível.',
      published,
      link,
      categories: 'CrossRef',
      doi,
      journal,
      citacoes: it['is-referenced-by-count'] ?? 0,
      source: 'crossref' as const,
    }
  })
}

// ─── Handler principal ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const qRaw = req.nextUrl.searchParams.get('q') ?? ''
  const max = Math.min(parseInt(req.nextUrl.searchParams.get('max') ?? '8'), 15)

  if (!qRaw.trim()) return NextResponse.json([])

  // Traduz e contextualiza
  const qTraduzido = traduzirQuery(qRaw)
  const temFood = /food|extrusion|printing|rheology|hydrocolloid|gel/.test(qTraduzido)
  const query = temFood ? qTraduzido : `${qTraduzido} food`

  // Busca em paralelo nas 3 fontes
  const [openalex, pubmed, crossref] = await Promise.all([
    buscarOpenAlex(query, max).catch(() => []),
    buscarPubmed(query, max).catch(() => []),
    buscarCrossref(query, max).catch(() => []),
  ])

  // Filtra áreas claramente irrelevantes
  const AREAS_BANIDAS = /astronom|astrophys|particle phys|quantum mechan|cosmolog|topology|category theory|number theory|cryptograph/i
  const limparEntry = (e: ArxivEntry): boolean => {
    const haystack = `${e.title} ${e.categories} ${e.journal ?? ''}`
    return !AREAS_BANIDAS.test(haystack)
  }

  const todos = [...openalex, ...pubmed, ...crossref].filter(limparEntry)

  // Deduplica por DOI
  const seen = new Set<string>()
  const unicos: ArxivEntry[] = []
  for (const e of todos) {
    const key = e.doi?.toLowerCase() ?? e.id
    if (seen.has(key)) continue
    seen.add(key)
    unicos.push(e)
  }

  // Ordena por relevância composta (citações + recência)
  unicos.sort((a, b) => {
    const yearA = parseInt(a.published.slice(0, 4)) || 0
    const yearB = parseInt(b.published.slice(0, 4)) || 0
    const scoreA = (a.citacoes ?? 0) * 0.5 + yearA * 0.3
    const scoreB = (b.citacoes ?? 0) * 0.5 + yearB * 0.3
    return scoreB - scoreA
  })

  return NextResponse.json(unicos.slice(0, 20))
}
