import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  if (!q.trim()) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('match_food_trgm', { q: q.trim().toLowerCase(), lim: 10 })

  if (error) {
    console.error('foods/search rpc error', error)
    return NextResponse.json({ error: 'search_failed' }, { status: 500 })
  }
  return NextResponse.json({ results: data || [] })
}
