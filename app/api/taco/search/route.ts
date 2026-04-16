import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const supabase = await createClient()

  // ilike para autocomplete (busca por prefixo/substring)
  const { data, error } = await supabase
    .from('taco_alimentos')
    .select(`
      id, descricao, categoria,
      energia_kcal, proteina_g, carboidrato_g, lipidios_g, fibra_g,
      sodio_mg, calcio_mg, ferro_mg, vitamina_c_mg, vitamina_a_ug,
      magnesio_mg, fosforo_mg, potassio_mg, zinco_mg, cobre_mg,
      saturados_g, monoinsaturados_g, polinsaturados_g, trans_g, colesterol_mg,
      triptofano_g, treonina_g, isoleucina_g, leucina_g, lisina_g,
      metionina_g, fenilalanina_g, valina_g, histidina_g, arginina_g
    `)
    .ilike('descricao', `%${q}%`)
    .limit(10)

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data ?? [])
}
