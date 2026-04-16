/**
 * Cálculos de extrusão para impressora Morphê — seringa por deslocamento positivo.
 *
 * Princípio: o pistão da seringa empurra material pela ponteira.
 * E (mm de curso do pistão) = volume_a_extrudar / área_seccional_seringa
 *
 * Volume por mm de percurso = π × (d_ponteira/2)² × 1mm
 * E por mm = volume_por_mm / área_seringa = (d_ponteira / d_seringa)²
 */

export const SYRINGES = [
  {
    label: '10 mL',
    desc: 'Para pastas fluidas e formulações com pouco volume',
    volume_ml: 10,
    diameter_mm: 15,
    radius_mm: 7.5,
    area_mm2: Math.PI * 7.5 * 7.5,
  },
  {
    label: '60 mL',
    desc: 'Para pastas densas e produções com maior volume',
    volume_ml: 60,
    diameter_mm: 30,
    radius_mm: 15,
    area_mm2: Math.PI * 15 * 15,
  },
] as const

export type SyringeVolume = (typeof SYRINGES)[number]['volume_ml']

/**
 * Impressoras Morphê disponíveis.
 * steps_per_mm: configuração de firmware do eixo E (pistão).
 * O GCode em si usa E em mm — o firmware converte para passos.
 */
export const MACHINES = [
  {
    id: 'bioender_pro',
    label: 'Bioender PRO',
    steps_per_mm: 930,
  },
  {
    id: 'vitalink',
    label: 'Vitalink',
    steps_per_mm: 93,
  },
] as const

export type MachineId = (typeof MACHINES)[number]['id']

/**
 * E por mm de percurso de impressão (curso do pistão em mm).
 * Resultado independe da velocidade — é puramente geométrico.
 *
 * Exemplo:
 *   ponteira 0,8 mm + seringa 10 mL (Ø15 mm) → E/mm = (0,8/15)² ≈ 0,00284 mm/mm
 *   → a cada 10 mm de percurso, o pistão avança 0,028 mm.
 */
export function calcEPerMm(nozzle_mm: number, syringe_diameter_mm: number): number {
  return (nozzle_mm / syringe_diameter_mm) ** 2
}

/**
 * Converte massa → volume (mm³) usando densidade da pasta.
 * Pastas alimentares: 0,8–1,2 g/cm³. Default 1,0 g/cm³.
 */
export function massToVolumeMm3(mass_g: number, density_g_cm3 = 1.0): number {
  return (mass_g / density_g_cm3) * 1000
}

/**
 * Converte meta calórica → massa (g), dado kcal/100g da formulação.
 */
export function caloriesToMassG(kcal_target: number, kcal_per_100g: number): number {
  return (kcal_target / kcal_per_100g) * 100
}

/**
 * Calcula dimensões de um cilindro a partir do volume.
 * Relação de aspecto: altura = diâmetro (proporção 1:1, tipo "puck").
 *
 * V = π × r² × h = π × r² × 2r = 2π × r³  →  r = ∛(V / 2π)
 */
export function cylinderDimsFromVolume(volume_mm3: number) {
  const r = Math.pow(volume_mm3 / (2 * Math.PI), 1 / 3)
  const diameter = Math.round(r * 2 * 10) / 10
  return { diameter_mm: diameter, height_mm: diameter }
}

/**
 * Calcula a aresta de um cubo a partir do volume.
 */
export function cubeSideFromVolume(volume_mm3: number): number {
  return Math.round(Math.pow(volume_mm3, 1 / 3) * 10) / 10
}

/** Fluxo volumétrico em mm³/s para um dado percurso */
export function flowRateMm3s(nozzle_mm: number, speed_mm_s: number): number {
  return Math.PI * (nozzle_mm / 2) ** 2 * speed_mm_s
}

/** Velocidade de avanço do pistão em mm/s */
export function pistonSpeedMmS(nozzle_mm: number, syringe_diameter_mm: number, print_speed_mm_s: number): number {
  return calcEPerMm(nozzle_mm, syringe_diameter_mm) * print_speed_mm_s
}
