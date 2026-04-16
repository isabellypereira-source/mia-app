import { NextRequest, NextResponse } from 'next/server'

export interface ArxivEntry {
  id: string
  title: string
  authors: string
  summary: string
  published: string
  link: string
  categories: string
}

/** Extrai texto de uma tag XML simples */
function getTag(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml)
  return m ? m[1].replace(/\s+/g, ' ').trim() : ''
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? 'food 3D printing positive displacement extrusion'
  const max = Math.min(parseInt(req.nextUrl.searchParams.get('max') ?? '12'), 30)

  const url =
    `https://export.arxiv.org/api/query` +
    `?search_query=all:${encodeURIComponent(q)}` +
    `&max_results=${max}` +
    `&sortBy=submittedDate&sortOrder=descending`

  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) return NextResponse.json({ error: 'arXiv indisponível' }, { status: 502 })

  const xml = await resp.text()

  const entries: ArxivEntry[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match
  while ((match = entryRegex.exec(xml)) !== null) {
    const e = match[1]
    const id = getTag(e, 'id')
    const title = getTag(e, 'title')
    const summary = getTag(e, 'summary')
    const published = getTag(e, 'published').slice(0, 10)

    const authorMatches = [...e.matchAll(/<name>(.*?)<\/name>/g)]
    const authors = authorMatches
      .slice(0, 3)
      .map(m => m[1].trim())
      .join(', ') + (authorMatches.length > 3 ? ' et al.' : '')

    const catMatch = e.match(/<category term="([^"]+)"/)
    const categories = catMatch ? catMatch[1] : ''

    if (id && title) {
      entries.push({ id, title, authors, summary, published, link: id, categories })
    }
  }

  return NextResponse.json(entries)
}
