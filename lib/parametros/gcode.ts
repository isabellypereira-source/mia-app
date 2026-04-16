/**
 * Gerador de GCode para Morphê Foods — extrusora mecânica de seringa (deslocamento positivo).
 *
 * Modelo de extrusão:
 *   E (mm de curso do pistão) = Σ(segmento_mm × E_per_mm)
 *   E_per_mm = (d_ponteira / d_seringa)²
 *
 * O ajuste fino de fluxo é feito no host da BioedTech após a impressão.
 */

import { SYRINGES, calcEPerMm } from './extrusion'

export interface GCodeConfig {
  formulacao_nome: string
  formato: 'cilindro' | 'cubo'
  seringa_ml: number
  ponteira_mm: number
  layer_height_mm: number
  print_speed_mm_s: number
  temperatura_c: number | null
  // Dimensões da peça
  diametro_mm: number         // cilindro: diâmetro; cubo: aresta
  altura_mm: number
}

const SEGS = 64   // segmentos por círculo (toolpath do cilindro)
const BED_CX = 100 // centro da mesa X
const BED_CY = 100 // centro da mesa Y

export function generateGCode(cfg: GCodeConfig): string {
  const syringe = SYRINGES.find(s => s.volume_ml === cfg.seringa_ml)!
  const ePerMm = calcEPerMm(cfg.ponteira_mm, syringe.diameter_mm)
  const speedF = Math.round(cfg.print_speed_mm_s * 60)
  const lh = cfg.layer_height_mm
  const layers = Math.ceil(cfg.altura_mm / lh)

  const header = [
    `; ============================================================`,
    `; GCode gerado pela MIA — Morphê Foods`,
    `; Formulação  : ${cfg.formulacao_nome}`,
    `; Formato      : ${cfg.formato} ${cfg.formato === 'cilindro' ? `Ø${cfg.diametro_mm}mm × ${cfg.altura_mm}mm` : `${cfg.diametro_mm}mm³`}`,
    `; Seringa      : ${cfg.seringa_ml}mL (Ø${syringe.diameter_mm}mm | área=${syringe.area_mm2.toFixed(1)}mm²)`,
    `; Ponteira     : Ø${cfg.ponteira_mm}mm`,
    `; Camadas      : ${layers} × ${lh}mm`,
    `; Velocidade   : ${cfg.print_speed_mm_s} mm/s`,
    `; Temperatura  : ${cfg.temperatura_c ?? 'Ambiente'}°C`,
    `; ─────────────────────────────────────────`,
    `; E/mm          : (${cfg.ponteira_mm}/${syringe.diameter_mm})² = ${ePerMm.toFixed(6)} mm pistão / mm percurso`,
    `; ============================================================`,
    ``,
    `G28         ; Home all axes`,
    `G90         ; Coordenadas absolutas`,
    `M82         ; Extrusora em modo absoluto`,
    `G92 E0      ; Zera contador de extrusão`,
    `G1 Z5 F3000 ; Levanta Z para segurança`,
  ]

  if (cfg.temperatura_c) {
    header.push(`M104 S${cfg.temperatura_c} ; Set temperatura`)
    header.push(`M109 S${cfg.temperatura_c} ; Aguarda estabilizar temperatura`)
  }

  header.push(``, `; ===== INÍCIO DAS CAMADAS =====`)

  const body = cfg.formato === 'cilindro'
    ? cylinderLayers(cfg, ePerMm, speedF, lh, layers)
    : cubeLayers(cfg, ePerMm, speedF, lh, layers)

  const footer = [
    ``,
    `; ===== FIM =====`,
    `G1 Z${(layers * lh + 10).toFixed(2)} F3000 ; Levanta Z`,
    `G28 X Y     ; Home X e Y`,
    `G92 E0      ; Reseta extrusora`,
    `M84         ; Desliga motores`,
  ]

  return [...header, ...body, ...footer].join('\n')
}

// ---------------------------------------------------------------------------
// Cilindro — preenchimento concêntrico (da borda para o centro)
// ---------------------------------------------------------------------------
function cylinderLayers(
  cfg: GCodeConfig,
  ePerMm: number,
  speedF: number,
  lh: number,
  layers: number,
): string[] {
  const R = cfg.diametro_mm / 2
  const lines: string[] = []
  let E = 0

  for (let layer = 0; layer < layers; layer++) {
    const z = round3((layer + 1) * lh)
    lines.push(``, `; Camada ${layer + 1}/${layers}  z=${z}mm`)
    lines.push(`G1 Z${z} F800`)

    // Preenchimento concêntrico — círculos do exterior para o interior
    let r = R
    while (r > cfg.ponteira_mm * 0.5) {
      // Desloca até o ponto de início do círculo (sem extrusão)
      lines.push(`G1 X${round3(BED_CX + r)} Y${BED_CY} F3000`)

      for (let seg = 1; seg <= SEGS; seg++) {
        const angle = (seg / SEGS) * 2 * Math.PI
        const prevAngle = ((seg - 1) / SEGS) * 2 * Math.PI
        const x = BED_CX + r * Math.cos(angle)
        const y = BED_CY + r * Math.sin(angle)
        const px = BED_CX + r * Math.cos(prevAngle)
        const py = BED_CY + r * Math.sin(prevAngle)
        const segLen = Math.hypot(x - px, y - py)
        E += segLen * ePerMm
        lines.push(`G1 X${round3(x)} Y${round3(y)} E${round5(E)} F${speedF}`)
      }

      r -= cfg.ponteira_mm
    }
  }

  return lines
}

// ---------------------------------------------------------------------------
// Cubo — perímetro + preenchimento retilíneo alternado (0°/90° a cada camada)
// ---------------------------------------------------------------------------
function cubeLayers(
  cfg: GCodeConfig,
  ePerMm: number,
  speedF: number,
  lh: number,
  layers: number,
): string[] {
  const S = cfg.diametro_mm // aresta
  const OX = BED_CX - S / 2
  const OY = BED_CY - S / 2
  const spacing = cfg.ponteira_mm
  const lines: string[] = []
  let E = 0

  for (let layer = 0; layer < layers; layer++) {
    const z = round3((layer + 1) * lh)
    lines.push(``, `; Camada ${layer + 1}/${layers}  z=${z}mm`)
    lines.push(`G1 Z${z} F800`)

    // Perímetro
    const corners: [number, number][] = [
      [OX, OY], [OX + S, OY], [OX + S, OY + S], [OX, OY + S], [OX, OY],
    ]
    lines.push(`G1 X${round3(OX)} Y${round3(OY)} F3000`)
    for (let i = 1; i < corners.length; i++) {
      const [x, y] = corners[i]
      const [px, py] = corners[i - 1]
      E += Math.hypot(x - px, y - py) * ePerMm
      lines.push(`G1 X${round3(x)} Y${round3(y)} E${round5(E)} F${speedF}`)
    }

    // Preenchimento retilíneo (direção alterna por camada)
    if (layer % 2 === 0) {
      // Linhas paralelas ao X
      let y = OY + spacing
      let fwd = true
      while (y < OY + S - spacing * 0.5) {
        const x1 = fwd ? OX : OX + S
        const x2 = fwd ? OX + S : OX
        lines.push(`G1 X${round3(x1)} Y${round3(y)} F3000`)
        E += S * ePerMm
        lines.push(`G1 X${round3(x2)} Y${round3(y)} E${round5(E)} F${speedF}`)
        y += spacing
        fwd = !fwd
      }
    } else {
      // Linhas paralelas ao Y
      let x = OX + spacing
      let fwd = true
      while (x < OX + S - spacing * 0.5) {
        const y1 = fwd ? OY : OY + S
        const y2 = fwd ? OY + S : OY
        lines.push(`G1 X${round3(x)} Y${round3(y1)} F3000`)
        E += S * ePerMm
        lines.push(`G1 X${round3(x)} Y${round3(y2)} E${round5(E)} F${speedF}`)
        x += spacing
        fwd = !fwd
      }
    }
  }

  return lines
}

function round3(n: number) { return Math.round(n * 1000) / 1000 }
function round5(n: number) { return Math.round(n * 100000) / 100000 }
