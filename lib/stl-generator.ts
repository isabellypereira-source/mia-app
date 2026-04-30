import { cuboid, cylinder, sphere } from '@jscad/modeling/src/primitives'
import { serialize } from '@jscad/io'

interface FormulaParams {
  nome: string
  aplicacao: string
  ingredientes: Array<{ nome: string; percentual: number }>
  densidade?: number // 0.5-1.5, afeta tamanho
  forma?: 'cilindro' | 'cubo' | 'esfera'
  altura_mm?: number
  diametro_mm?: number
}

interface STLOutput {
  stlBuffer: ArrayBuffer
  filename: string
  metadata: {
    volume_mm3: number
    peso_estimado_g: number
    tempo_impressao_estimado_min: number
    forma: string
  }
}

const SHAPES = {
  cilindro: 'cylinder',
  cubo: 'cube',
  esfera: 'sphere',
}

const DENSIDADE_DEFAULTS = {
  snacks: 0.7,
  massas: 0.85,
  proteinas: 0.9,
  laticinios: 0.75,
  nutraceuticos: 0.8,
  outros: 0.8,
}

const DIMENSOES_DEFAULTS = {
  snacks: { altura: 20, diametro: 12 },
  massas: { altura: 25, diametro: 15 },
  proteinas: { altura: 18, diametro: 14 },
  laticinios: { altura: 15, diametro: 16 },
  nutraceuticos: { altura: 12, diametro: 10 },
  outros: { altura: 20, diametro: 15 },
}

export async function generateSTLfromFormula(
  formula: FormulaParams
): Promise<STLOutput> {
  const aplicacao = formula.aplicacao as keyof typeof DIMENSOES_DEFAULTS
  const defaults = DIMENSOES_DEFAULTS[aplicacao] || DIMENSOES_DEFAULTS.outros
  const densidadeDefault = DENSIDADE_DEFAULTS[aplicacao as keyof typeof DENSIDADE_DEFAULTS] || 0.8

  const densidade = formula.densidade || densidadeDefault
  const forma = formula.forma || 'cilindro'
  const altura = formula.altura_mm || defaults.altura
  const diametro = formula.diametro_mm || defaults.diametro

  // Gerar geometria 3D
  let geometry
  const raio = diametro / 2

  switch (forma) {
    case 'cubo': {
      const lado = diametro
      geometry = cuboid({
        size: [lado, lado, altura],
        center: [0, 0, 0],
      })
      break
    }
    case 'esfera': {
      geometry = sphere({
        radius: raio,
        center: [0, 0, 0],
      })
      break
    }
    case 'cilindro':
    default: {
      geometry = cylinder({
        radius: raio,
        height: altura,
        center: [0, 0, 0],
      })
      break
    }
  }

  // Calcular volume (estimado em mm³)
  const volume_mm3 = calcularVolume(forma, altura, diametro)
  const peso_estimado_g = (volume_mm3 / 1000) * densidade // 1cm³ = 1g de referência
  const tempo_impressao_estimado_min = Math.round((peso_estimado_g / 10) * 15) // ~15min por 10g

  // Serializar para STL
  const stlData = serialize({ format: 'stl', unit: 'mm' }, [geometry])
  const stlBuffer = new TextEncoder().encode(stlData).buffer

  const filename = `mia_${formula.aplicacao}_${formula.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.stl`

  return {
    stlBuffer,
    filename,
    metadata: {
      volume_mm3: Math.round(volume_mm3),
      peso_estimado_g: Math.round(peso_estimado_g * 100) / 100,
      tempo_impressao_estimado_min,
      forma,
    },
  }
}

function calcularVolume(
  forma: string,
  altura: number,
  diametro: number
): number {
  const raio = diametro / 2

  switch (forma) {
    case 'cubo': {
      const lado = diametro
      return lado * lado * altura
    }
    case 'esfera': {
      // Volume da esfera: 4/3 * π * r³
      return (4 / 3) * Math.PI * Math.pow(raio, 3)
    }
    case 'cilindro':
    default: {
      // Volume do cilindro: π * r² * h
      return Math.PI * Math.pow(raio, 2) * altura
    }
  }
}
