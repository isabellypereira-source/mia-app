import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { normalizeName } from '@/lib/ai/food-match'

// POST: cria um override de usuário (ingrediente custom com valores informados)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as {
    nome?: string
    kcal?: number
    proteina_g?: number
    carboidrato_g?: number
    gordura_g?: number
    fibra_g?: number
    umidade_g?: number
    sodio_mg?: number
  } | null
  if (!body?.nome?.trim()) return NextResponse.json({ error: 'missing_nome' }, { status: 400 })

  const { data, error } = await supabase
    .from('foods_composition')
    .insert({
      user_id: user.id,
      nome: body.nome.trim(),
      nome_normalized: normalizeName(body.nome.trim()),
      sinonimos: [],
      categoria: 'Custom',
      kcal: Number(body.kcal) || 0,
      proteina_g: Number(body.proteina_g) || 0,
      carboidrato_g: Number(body.carboidrato_g) || 0,
      gordura_g: Number(body.gordura_g) || 0,
      fibra_g: Number(body.fibra_g) || 0,
      umidade_g: Number(body.umidade_g) || 0,
      sodio_mg: Number(body.sodio_mg) || 0,
      source: 'USER',
    })
    .select()
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, food: data })
}
