// Fuzzy matching layer for ingredient names against foods_composition.
// Strategy: normalize -> exact -> prefix -> contains -> trigram similarity.

import type { SupabaseClient } from '@supabase/supabase-js'

export type FoodRow = {
  id: string
  nome: string
  categoria: string | null
  kcal: number
  proteina_g: number
  carboidrato_g: number
  gordura_g: number
  fibra_g: number
  umidade_g: number
  sodio_mg: number | null
  source: string
  funcao_sugerida?: string | null
}

export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function matchFood(
  supabase: SupabaseClient,
  rawName: string,
  userId: string | null,
): Promise<FoodRow | null> {
  const norm = normalizeName(rawName)
  if (!norm) return null

  // Priority 1: exact match in name or sinonimos, prefer user override > MORPHE > TACO
  const { data: exact } = await supabase
    .from('foods_composition')
    .select('id, nome, categoria, kcal, proteina_g, carboidrato_g, gordura_g, fibra_g, umidade_g, sodio_mg, source, user_id, sinonimos, nome_normalized')
    .or(`nome_normalized.eq.${norm},sinonimos.cs.{${rawName}}`)
    .limit(20)

  if (exact && exact.length > 0) {
    return pickBest(exact, userId)
  }

  // Priority 2: trigram similarity using pg_trgm
  const { data: fuzzy } = await supabase
    .rpc('match_food_trgm', { q: norm, lim: 5 })

  if (fuzzy && fuzzy.length > 0) {
    const best = fuzzy[0]
    if (best.similarity >= 0.35) {
      return best as FoodRow
    }
  }

  return null
}

function pickBest(rows: { user_id: string | null; source: string }[], userId: string | null) {
  // user override > Morphê > TACO
  const sorted = [...rows].sort((a, b) => {
    const ua = a.user_id === userId ? 0 : a.source === 'MORPHE' ? 1 : 2
    const ub = b.user_id === userId ? 0 : b.source === 'MORPHE' ? 1 : 2
    return ua - ub
  })
  return sorted[0] as unknown as FoodRow
}

export type Ingrediente = {
  nome: string
  percentual: number | string
  funcao?: string
}

export type MatchedIngrediente = {
  nome: string
  percentual: number
  matched: FoodRow | null
}

export async function matchAllIngredients(
  supabase: SupabaseClient,
  ingredientes: Ingrediente[],
  userId: string | null,
): Promise<MatchedIngrediente[]> {
  const results: MatchedIngrediente[] = []
  for (const ing of ingredientes) {
    const matched = await matchFood(supabase, ing.nome, userId)
    results.push({
      nome: ing.nome,
      percentual: Number(ing.percentual) || 0,
      matched,
    })
  }
  return results
}

export type WeightedNutri = {
  kcal: number
  proteina_g: number
  carboidrato_g: number
  gordura_g: number
  fibra_g: number
  umidade_g: number
  sodio_mg: number
}

export function computeWeightedNutri(matches: MatchedIngrediente[]): WeightedNutri & { missing: string[] } {
  let kcal = 0, prot = 0, carb = 0, gord = 0, fib = 0, umid = 0, sod = 0
  const missing: string[] = []
  for (const m of matches) {
    if (!m.matched) {
      missing.push(m.nome)
      continue
    }
    const frac = (m.percentual || 0) / 100
    kcal += frac * Number(m.matched.kcal || 0)
    prot += frac * Number(m.matched.proteina_g || 0)
    carb += frac * Number(m.matched.carboidrato_g || 0)
    gord += frac * Number(m.matched.gordura_g || 0)
    fib += frac * Number(m.matched.fibra_g || 0)
    umid += frac * Number(m.matched.umidade_g || 0)
    sod += frac * Number(m.matched.sodio_mg || 0)
  }
  return {
    kcal: Math.round(kcal),
    proteina_g: Number(prot.toFixed(2)),
    carboidrato_g: Number(carb.toFixed(2)),
    gordura_g: Number(gord.toFixed(2)),
    fibra_g: Number(fib.toFixed(2)),
    umidade_g: Number(umid.toFixed(2)),
    sodio_mg: Math.round(sod),
    missing,
  }
}
