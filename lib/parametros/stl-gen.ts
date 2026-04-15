/**
 * Gerador de STL binário paramétrico para cilindro e cubo.
 * Formato binário STL:
 *   80 bytes header | 4 bytes uint32 (nº triângulos) | N × 50 bytes (triângulo)
 *   Cada triângulo: 3×float32 normal + 3×(3×float32) vértice + 2 bytes atributo
 */

type Vec3 = [number, number, number]

interface Tri {
  n: Vec3
  v1: Vec3
  v2: Vec3
  v3: Vec3
}

function buildSTL(tris: Tri[]): Uint8Array {
  const buf = new ArrayBuffer(84 + tris.length * 50)
  const view = new DataView(buf)
  view.setUint32(80, tris.length, true)
  let o = 84
  for (const t of tris) {
    for (const vec of [t.n, t.v1, t.v2, t.v3]) {
      for (const val of vec) { view.setFloat32(o, val, true); o += 4 }
    }
    view.setUint16(o, 0, true); o += 2
  }
  return new Uint8Array(buf)
}

/**
 * Gera STL de um cilindro centrado em (0,0) com base em z=0.
 * @param diameter_mm Diâmetro do cilindro
 * @param height_mm   Altura do cilindro
 * @param segments    Número de segmentos laterais (resolução circular, default 48)
 */
export function generateCylinderSTL(diameter_mm: number, height_mm: number, segments = 48): Uint8Array {
  const r = diameter_mm / 2
  const h = height_mm
  const tris: Tri[] = []

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * 2 * Math.PI
    const a1 = ((i + 1) / segments) * 2 * Math.PI
    const c0 = Math.cos(a0), s0 = Math.sin(a0)
    const c1 = Math.cos(a1), s1 = Math.sin(a1)
    const x0 = r * c0, y0 = r * s0
    const x1 = r * c1, y1 = r * s1
    const nAngle = (a0 + a1) / 2
    const nx = Math.cos(nAngle), ny = Math.sin(nAngle)

    // Tampa inferior (z=0, normal -Z, winding CCW visto de baixo)
    tris.push({ n: [0, 0, -1], v1: [0, 0, 0], v2: [x1, y1, 0], v3: [x0, y0, 0] })
    // Tampa superior (z=h, normal +Z)
    tris.push({ n: [0, 0, 1], v1: [0, 0, h], v2: [x0, y0, h], v3: [x1, y1, h] })
    // Lateral — triângulo inferior
    tris.push({ n: [nx, ny, 0], v1: [x0, y0, 0], v2: [x1, y1, 0], v3: [x1, y1, h] })
    // Lateral — triângulo superior
    tris.push({ n: [nx, ny, 0], v1: [x0, y0, 0], v2: [x1, y1, h], v3: [x0, y0, h] })
  }

  return buildSTL(tris)
}

/**
 * Gera STL de um cubo com origem em (0,0,0).
 * @param side_mm Aresta do cubo
 */
export function generateCubeSTL(side_mm: number): Uint8Array {
  const s = side_mm
  const tris: Tri[] = [
    // Inferior  (z=0, normal -Z)
    { n: [0, 0, -1], v1: [0, 0, 0], v2: [s, s, 0], v3: [s, 0, 0] },
    { n: [0, 0, -1], v1: [0, 0, 0], v2: [0, s, 0], v3: [s, s, 0] },
    // Superior  (z=s, normal +Z)
    { n: [0, 0, 1],  v1: [0, 0, s], v2: [s, 0, s], v3: [s, s, s] },
    { n: [0, 0, 1],  v1: [0, 0, s], v2: [s, s, s], v3: [0, s, s] },
    // Frente    (y=0, normal -Y)
    { n: [0, -1, 0], v1: [0, 0, 0], v2: [s, 0, s], v3: [0, 0, s] },
    { n: [0, -1, 0], v1: [0, 0, 0], v2: [s, 0, 0], v3: [s, 0, s] },
    // Fundo     (y=s, normal +Y)
    { n: [0, 1, 0],  v1: [0, s, 0], v2: [0, s, s], v3: [s, s, s] },
    { n: [0, 1, 0],  v1: [0, s, 0], v2: [s, s, s], v3: [s, s, 0] },
    // Esquerda  (x=0, normal -X)
    { n: [-1, 0, 0], v1: [0, 0, 0], v2: [0, 0, s], v3: [0, s, s] },
    { n: [-1, 0, 0], v1: [0, 0, 0], v2: [0, s, s], v3: [0, s, 0] },
    // Direita   (x=s, normal +X)
    { n: [1, 0, 0],  v1: [s, 0, 0], v2: [s, s, s], v3: [s, 0, s] },
    { n: [1, 0, 0],  v1: [s, 0, 0], v2: [s, s, 0], v3: [s, s, s] },
  ]
  return buildSTL(tris)
}

/** Cria um object URL a partir do buffer STL (para usar com react-stl-viewer) */
export function stlToObjectUrl(buffer: Uint8Array): string {
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/octet-stream' })
  return URL.createObjectURL(blob)
}
