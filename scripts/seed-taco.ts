/**
 * Importa a TACO completa (597 alimentos, 68 campos) do JSON para o Supabase.
 *
 * Fonte: github.com/marcelosanto/tabela_taco
 * JSON local: knowledge-base/taco-raw.json
 *
 * Uso:
 *   npx tsx scripts/seed-taco.ts
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente ou .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Carrega .env.local manualmente (sem dotenv)
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...val] = line.split('=')
    if (key?.trim() && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Converte "NA", "", "Tr" → null; número → float
function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '' || val === 'NA' || val === 'Tr') return null
  const n = parseFloat(String(val))
  return isNaN(n) ? null : n
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'knowledge-base', 'taco-raw.json')
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  console.log(`📦 ${raw.length} alimentos carregados do JSON`)

  const rows = raw.map((a: Record<string, unknown>) => ({
    id: a.id as number,
    descricao: a.description as string,
    categoria: a.category as string,

    umidade_pct: parseNum(a.humidity_percents),
    energia_kcal: parseNum(a.energy_kcal),
    energia_kj: parseNum(a.energy_kj),
    proteina_g: parseNum(a.protein_g),
    lipidios_g: parseNum(a.lipid_g),
    colesterol_mg: parseNum(a.cholesterol_mg),
    carboidrato_g: parseNum(a.carbohydrate_g),
    fibra_g: parseNum(a.fiber_g),
    cinzas_g: parseNum(a.ashes_g),

    calcio_mg: parseNum(a.calcium_mg),
    magnesio_mg: parseNum(a.magnesium_mg),
    manganes_mg: parseNum(a.manganese_mg),
    fosforo_mg: parseNum(a.phosphorus_mg),
    ferro_mg: parseNum(a.iron_mg),
    sodio_mg: parseNum(a.sodium_mg),
    potassio_mg: parseNum(a.potassium_mg),
    cobre_mg: parseNum(a.copper_mg),
    zinco_mg: parseNum(a.zinc_mg),

    retinol_mcg: parseNum(a.retinol_mcg),
    re_mcg: parseNum(a.re_mcg),
    rae_mcg: parseNum(a.rae_mcg),
    tiamina_mg: parseNum(a.thiamine_mg),
    riboflavina_mg: parseNum(a.riboflavin_mg),
    piridoxina_mg: parseNum(a.pyridoxine_mg),
    niacina_mg: parseNum(a.niacin_mg),
    vitamina_c_mg: parseNum(a.vitaminC_mg),

    saturados_g: parseNum(a.saturated_g),
    monoinsaturados_g: parseNum(a.monounsaturated_g),
    polinsaturados_g: parseNum(a.polyunsaturated_g),
    ag_12_0_g: parseNum(a['12:0_g']),
    ag_14_0_g: parseNum(a['14:0_g']),
    ag_16_0_g: parseNum(a['16:0_g']),
    ag_18_0_g: parseNum(a['18:0_g']),
    ag_20_0_g: parseNum(a['20:0_g']),
    ag_22_0_g: parseNum(a['22:0_g']),
    ag_24_0_g: parseNum(a['24:0_g']),
    ag_14_1_g: parseNum(a['14:1_g']),
    ag_16_1_g: parseNum(a['16:1_g']),
    ag_18_1_g: parseNum(a['18:1_g']),
    ag_20_1_g: parseNum(a['20:1_g']),
    ag_18_2n6_g: parseNum(a['18:2 n-6_g']),
    ag_18_3n3_g: parseNum(a['18:3 n-3_g']),
    ag_20_4_g: parseNum(a['20:4_g']),
    ag_20_5_g: parseNum(a['20:5_g']),
    ag_22_5_g: parseNum(a['22:5_g']),
    ag_22_6_g: parseNum(a['22:6_g']),
    ag_18_1t_g: parseNum(a['18:1t_g']),
    ag_18_2t_g: parseNum(a['18:2t_g']),

    triptofano_g: parseNum(a.tryptophan_g),
    treonina_g: parseNum(a.threonine_g),
    isoleucina_g: parseNum(a.isoleucine_g),
    leucina_g: parseNum(a.leucine_g),
    lisina_g: parseNum(a.lysine_g),
    metionina_g: parseNum(a.methionine_g),
    cistina_g: parseNum(a.cystine_g),
    fenilalanina_g: parseNum(a.phenylalanine_g),
    tirosina_g: parseNum(a.tyrosine_g),
    valina_g: parseNum(a.valine_g),
    arginina_g: parseNum(a.arginine_g),
    histidina_g: parseNum(a.histidine_g),
    alanina_g: parseNum(a.alanine_g),
    aspartato_g: parseNum(a.aspartic_g),
    glutamato_g: parseNum(a.glutamic_g),
    glicina_g: parseNum(a.glycine_g),
    prolina_g: parseNum(a.proline_g),
    serina_g: parseNum(a.serine_g),
  }))

  // Upsert em lotes de 100
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('taco_alimentos')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`❌ Erro no lote ${i}–${i + BATCH}:`, error.message)
      process.exit(1)
    }
    inserted += batch.length
    process.stdout.write(`\r✅ ${inserted}/${rows.length} inseridos...`)
  }

  console.log(`\n\n🎉 TACO importada com sucesso! ${rows.length} alimentos no Supabase.`)
}

main().catch(console.error)
