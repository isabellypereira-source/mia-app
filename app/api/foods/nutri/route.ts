import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { matchAllIngredients, computeWeightedNutri } from '@/lib/ai/food-match'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    ingredientes?: { nome: string; percentual: number | string }[]
    peso_g?: number
  } | null
  if (!body?.ingredientes) {
    return NextResponse.json({ error: 'missing_ingredientes' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const matches = await matchAllIngredients(supabase, body.ingredientes, user?.id || null)
  const per100 = computeWeightedNutri(matches)
  const pesoG = Number(body.peso_g) || 100
  const scale = pesoG / 100

  return NextResponse.json({
    matches: matches.map(m => ({
      nome: m.nome,
      percentual: m.percentual,
      matched: m.matched ? {
        nome: m.matched.nome,
        kcal: m.matched.kcal,
        proteina_g: m.matched.proteina_g,
        carboidrato_g: m.matched.carboidrato_g,
        gordura_g: m.matched.gordura_g,
        fibra_g: m.matched.fibra_g,
        umidade_g: m.matched.umidade_g,
        sodio_mg: m.matched.sodio_mg,
      } : null,
    })),
    per_100g: per100,
    total: {
      kcal: Math.round(per100.kcal * scale),
      proteina_g: Number((per100.proteina_g * scale).toFixed(2)),
      carboidrato_g: Number((per100.carboidrato_g * scale).toFixed(2)),
      gordura_g: Number((per100.gordura_g * scale).toFixed(2)),
      fibra_g: Number((per100.fibra_g * scale).toFixed(2)),
      umidade_g: Number((per100.umidade_g * scale).toFixed(2)),
      sodio_mg: Math.round(per100.sodio_mg * scale),
    },
    missing: per100.missing,
    peso_g: pesoG,
  })
}
