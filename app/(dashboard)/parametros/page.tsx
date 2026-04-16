'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, ArrowRight, CheckCircle, Download, Sparkles, SlidersHorizontal, Info,
} from 'lucide-react'
import {
  SYRINGES, MACHINES, calcEPerMm,
  type MachineId,
} from '@/lib/parametros/extrusion'

const ShapePreview = dynamic(
  () => import('@/components/parametros/ShapePreview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[280px] text-xs text-[#58413c]">Carregando...</div> },
)

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

type Passo = 'formato' | 'tamanho' | 'preenchimento' | 'equipamento' | 'ponteira' | 'definicao' | 'resultado'
const PASSOS: Passo[] = ['formato', 'tamanho', 'preenchimento', 'equipamento', 'ponteira', 'definicao', 'resultado']
const PASSO_LABEL: Record<Passo, string> = {
  formato: 'Formato', tamanho: 'Tamanho', preenchimento: 'Preenchimento',
  equipamento: 'Equipamento', ponteira: 'Ponteira', definicao: 'Definição', resultado: 'Resultado',
}

const FORMATOS = [
  { id: 'cilindro',    label: 'Cilindro',       stl: null              },
  { id: 'cubo',        label: 'Cubo',           stl: null              },
  { id: 'coracao',     label: 'Coração',        stl: '/stl/coracao.stl'     },
  { id: 'estrela',     label: 'Estrela',        stl: '/stl/estrela.stl'     },
  { id: 'tilapia',     label: 'Filé de Tilápia', stl: '/stl/tilapia.stl'    },
  { id: 'flor-lotus',  label: 'Flor de Lótus', stl: '/stl/flor-lotus.stl'  },
  { id: 'mandala',     label: 'Mandala',        stl: '/stl/mandala.stl'     },
  { id: 'arabesco',    label: 'Arabesco',       stl: '/stl/arabesco.stl'    },
  { id: 'croissant',   label: 'Croissant',      stl: '/stl/croissant.stl'   },
  { id: 'cogumelo',    label: 'Cogumelo',       stl: '/stl/cogumelo.stl'    },
  { id: 'snoopy',      label: 'Snoopy',         stl: '/stl/snoopy.stl'      },
  { id: 'stitch',      label: 'Stitch',         stl: '/stl/stitch.stl'      },
  { id: 'pacman',      label: 'Pac-Man',        stl: '/stl/pacman.stl'      },
  { id: 'gatinho',     label: 'Gatinho',        stl: '/stl/gatinho.stl'     },
  { id: 'boneco-neve', label: 'Boneco de Neve', stl: '/stl/boneco-neve.stl' },
  { id: 'crocodilo',   label: 'Crocodilo',      stl: '/stl/crocodilo.stl'   },
  { id: 'mandala2',    label: 'Mandala II',     stl: '/stl/mandala2.stl'    },
] as const

const PREENCHIMENTOS = [
  { id: 'concentrico', label: 'Concêntrico',  desc: 'Anéis do exterior para o centro. Ideal para formas redondas.' },
  { id: 'retilineo',   label: 'Retilíneo',    desc: 'Linhas alternadas 0° e 90°. Bom para formas angulares.' },
  { id: 'favo',        label: 'Favo de mel',  desc: 'Padrão hexagonal. Boa resistência e leveza estrutural.' },
]

const PONTEIRAS = [
  { value: 0.6, label: '0,6 mm', cor: 'bg-pink-400',    corLabel: 'Rosa'           },
  { value: 0.8, label: '0,8 mm', cor: 'bg-emerald-400', corLabel: 'Verde-esmeralda' },
  { value: 1.2, label: '1,2 mm', cor: 'bg-gray-400',    corLabel: 'Cinza'          },
  { value: 1.6, label: '1,6 mm', cor: 'bg-green-500',   corLabel: 'Verde'          },
  { value: 3.0, label: '3,0 mm', cor: 'bg-green-300',   corLabel: 'Verde claro'    },
  { value: 3.2, label: '3,2 mm', cor: 'bg-gray-200',    corLabel: '—'              },
]

const QUALIDADES = [
  { id: 'detalhado',  label: 'Detalhado',  desc: 'Máximo detalhe. Velocidade lenta.',      fator: 0.4,  vel: 8  },
  { id: 'balanceado', label: 'Balanceado', desc: 'Bom detalhe. Velocidade equilibrada.',    fator: 0.5,  vel: 15 },
  { id: 'otimizado',  label: 'Otimizado',  desc: 'Menos detalhe. Produção mais rápida.',   fator: 0.65, vel: 22 },
]

interface Formulacao { id: string; nome: string }

// ---------------------------------------------------------------------------
// Previews de preenchimento (SVG)
// ---------------------------------------------------------------------------

function FillPreview({ id, size = 90 }: { id: string; size?: number }) {
  const s = size
  if (id === 'concentrico') {
    const radii = [s * 0.46, s * 0.34, s * 0.22, s * 0.10]
    return (
      <svg viewBox={`0 0 ${s} ${s * 0.76}`} className="w-full h-full">
        {radii.map((r, i) => (
          <ellipse key={r} cx={s / 2} cy={s * 0.38} rx={r} ry={r * 0.72}
            fill="none" stroke="#003223" strokeWidth="1.5" opacity={0.9 - i * 0.18} />
        ))}
      </svg>
    )
  }
  if (id === 'retilineo') {
    const hLines = [12, 22, 32, 42, 52, 62]
    const vLines = [10, 20, 30, 40, 50, 60, 70, 80]
    return (
      <svg viewBox="0 0 90 68" className="w-full h-full">
        {hLines.map(y => <line key={`h${y}`} x1={6} y1={y} x2={84} y2={y} stroke="#003223" strokeWidth="1.5" opacity="0.7" />)}
        {vLines.map(x => <line key={`v${x}`} x1={x} y1={6} x2={x} y2={62} stroke="#7c9b8e" strokeWidth="1.5" opacity="0.45" />)}
      </svg>
    )
  }
  // favo
  const hexes: [number, number][] = [[22,16],[46,16],[70,16],[10,38],[34,38],[58,38],[82,38],[22,60],[46,60],[70,60]]
  const r = 13
  function hex(cx: number, cy: number) {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    })
    return `M ${pts.join(' L ')} Z`
  }
  return (
    <svg viewBox="0 0 90 76" className="w-full h-full" style={{ overflow: 'hidden' }}>
      {hexes.map(([cx, cy]) => (
        <path key={`${cx}-${cy}`} d={hex(cx, cy)} fill="none" stroke="#003223" strokeWidth="1.5" opacity="0.65" />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function ParametrosPage() {
  const [passo, setPasso] = useState<Passo>('formato')

  const [formato, setFormato] = useState('cilindro')
  const [largura, setLargura] = useState('40')
  const [altura, setAltura] = useState('40')
  const [stlScale, setStlScale] = useState(1.0)
  const [preenchimento, setPreenchimento] = useState('concentrico')
  const [machine, setMachine] = useState<MachineId>('bioender_pro')
  const [seringa, setSeringa] = useState<10 | 60>(10)
  const [formulacaoId, setFormulacaoId] = useState('')
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [ponteira, setPonteira] = useState(0.8)
  const [sugestaoPonteira, setSugestaoPonteira] = useState('')
  const [loadingSugestao, setLoadingSugestao] = useState(false)
  const [qualidade, setQualidade] = useState('balanceado')
  const [temperatura, setTemperatura] = useState('')

  const sugestaoRef = useRef(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
  }, [])

  // ---------------------------------------------------------------------------
  // Cálculos
  // ---------------------------------------------------------------------------

  const isStl = FORMATOS.find(f => f.id === formato)?.stl != null
  const larguraN = parseFloat(largura) || 40
  const alturaN = parseFloat(altura) || 40
  const syringeSpec = SYRINGES.find(s => s.volume_ml === seringa)!
  const qualSpec = QUALIDADES.find(q => q.id === qualidade)!
  const layerHeight = parseFloat((ponteira * qualSpec.fator).toFixed(2))
  const printSpeed = qualSpec.vel
  const ePerMm = calcEPerMm(ponteira, syringeSpec.diameter_mm)
  const formulacaoNome = formulacoes.find(f => f.id === formulacaoId)?.nome ?? ''
  const formatoSpec = FORMATOS.find(f => f.id === formato)
  const passoIdx = PASSOS.indexOf(passo)

  // ---------------------------------------------------------------------------
  // Sugestão de ponteira via MIA
  // ---------------------------------------------------------------------------

  async function gerarSugestaoPonteira(formulacaoIdParam: string) {
    const form = formulacoes.find(f => f.id === formulacaoIdParam)
    if (!form) return
    setLoadingSugestao(true)
    setSugestaoPonteira('')
    sugestaoRef.current = true
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Para a formulação "${form.nome}" de impressão 3D de alimentos com extrusora de seringa por deslocamento positivo, qual tamanho de ponteira você recomenda entre 0,6mm / 0,8mm / 1,2mm / 1,6mm / 3,0mm? Justifique brevemente (2-3 frases) considerando viscosidade esperada, ingredientes pelo nome, e risco de entupimento. Seja direto e técnico.`
          }]
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let texto = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n')) {
            if (line.startsWith('0:')) { try { texto += JSON.parse(line.slice(2)) } catch { /* skip */ } }
          }
        }
        if (sugestaoRef.current) setSugestaoPonteira(texto)
      }
    } catch { /* ignore */ }
    setLoadingSugestao(false)
  }

  function handleFormulacaoChange(id: string) {
    setFormulacaoId(id)
    if (id) gerarSugestaoPonteira(id)
  }

  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------

  function avancar() {
    setPasso(PASSOS[passoIdx + 1])
    window.scrollTo(0, 0)
  }
  function voltar() {
    if (passoIdx > 0) { setPasso(PASSOS[passoIdx - 1]); window.scrollTo(0, 0) }
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
  }

  async function abrirNoPrusaSlicer() {
    let blobUrl: string
    let filename: string
    if (formatoSpec?.stl) {
      const resp = await fetch(formatoSpec.stl)
      const buf = await resp.arrayBuffer()
      blobUrl = URL.createObjectURL(new Blob([buf], { type: 'model/stl' }))
      filename = `${formato}.stl`
    } else {
      const { generateCylinderSTL, generateCubeSTL, stlToObjectUrl } = await import('@/lib/parametros/stl-gen')
      const buffer = formato === 'cubo'
        ? generateCubeSTL(larguraN)
        : generateCylinderSTL(larguraN, alturaN)
      blobUrl = stlToObjectUrl(buffer)
      filename = `mia_${formato}_${larguraN}x${alturaN}.stl`
    }
    const a = document.createElement('a')
    a.href = blobUrl; a.download = filename
    document.body.appendChild(a); a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(blobUrl) }, 100)
    setTimeout(() => { window.location.href = 'prusaslicer://' }, 800)
  }

  function exportarIni() {
    const fillMap: Record<string, string> = {
      concentrico: 'concentric',
      retilineo: 'rectilinear',
      favo: 'honeycomb',
    }
    const ini = [
      `[print]`,
      `layer_height = ${layerHeight}`,
      `perimeters = 2`,
      `infill_density = 100%`,
      `fill_pattern = ${fillMap[preenchimento] ?? 'concentric'}`,
      `perimeter_speed = ${printSpeed}`,
      `infill_speed = ${printSpeed}`,
      `travel_speed = 50`,
      `first_layer_speed = ${Math.round(printSpeed * 0.5)}`,
      ``,
      `[printer]`,
      `nozzle_diameter = ${ponteira}`,
      temperatura ? `temperature = ${temperatura}` : `; temperature = ambiente`,
      ``,
      `; MIA — BioedTech`,
      `; Formulação: ${formulacaoNome || 'não informada'}`,
      `; Máquina: ${MACHINES.find(m => m.id === machine)?.label}`,
      `; Seringa: ${seringa}mL | E/mm: ${ePerMm.toFixed(6)}`,
      `; Preenchimento: ${preenchimento}`,
    ].join('\n')
    download(ini, `mia_${(formulacaoNome || formato).replace(/\s+/g, '_')}.ini`)
  }

  // ---------------------------------------------------------------------------
  // Progress bar
  // ---------------------------------------------------------------------------

  const progressSteps = PASSOS.filter(p => p !== 'resultado')

  function ProgressBar() {
    if (passo === 'resultado') return null
    return (
      <div className="flex items-center mb-8">
        {progressSteps.map((p, i) => {
          const done = passoIdx > i
          const active = passo === p
          return (
            <div key={p} className="flex items-center flex-1">
              {i > 0 && <div className={`h-px flex-1 mx-1 ${done ? 'bg-[#003223]' : 'bg-[#e5d9c1]'}`} />}
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${done || active ? 'bg-[#003223] text-white' : 'bg-[#e5d9c1] text-[#bfc9c2]'}`}>
                  {done ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span className={`text-[9px] font-medium hidden sm:block ${active ? 'text-[#003223]' : 'text-[#bfc9c2]'}`}>{PASSO_LABEL[p]}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function NavButtons({ disableNext = false }: { disableNext?: boolean }) {
    return (
      <div className="flex justify-between mt-8">
        <button onClick={voltar} disabled={passoIdx === 0}
          className="flex items-center gap-2 text-sm text-[#58413c] hover:text-[#211b0c] disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg border border-[#e5d9c1] transition-colors">
          <ArrowLeft size={14} /> Voltar
        </button>
        <button onClick={avancar} disabled={disableNext}
          className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {passo === 'definicao' ? 'Ver resultado' : 'Próximo'} <ArrowRight size={14} />
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#003223]" /> Parâmetros de Impressão
        </h1>
        <p className="text-xs text-[#58413c] mt-0.5">Configure passo a passo e exporte para a impressora BioedTech.</p>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <ProgressBar />

        {/* ── 1. Formato ── */}
        {passo === 'formato' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual é o formato da peça?</h2>
            <p className="text-xs text-[#58413c] mb-5">Cilindro e Cubo são paramétricos. Os demais carregam modelos 3D.</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {FORMATOS.map(f => (
                <button key={f.id} onClick={() => setFormato(f.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${formato === f.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                  <p className="text-xs font-medium leading-snug">{f.label}</p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 2. Tamanho ── */}
        {passo === 'tamanho' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Dimensões da peça</h2>
            {isStl ? (
              <>
                <p className="text-xs text-[#58413c] mb-5">Ajuste a escala do modelo 3D.</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-medium text-[#211b0c]">Escala</label>
                      <span className="text-xs font-semibold text-[#003223]">{Math.round(stlScale * 100)}%</span>
                    </div>
                    <input type="range" min={0.25} max={3} step={0.05} value={stlScale}
                      onChange={e => setStlScale(parseFloat(e.target.value))}
                      className="w-full accent-[#003223]" />
                    <div className="flex justify-between text-[10px] text-[#bfc9c2] mt-0.5">
                      <span>25%</span><span>100%</span><span>300%</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#58413c] mb-5">
                  {formato === 'cubo' ? 'Defina o lado do cubo.' : 'Defina o diâmetro e a altura.'}
                </p>
                <div className="flex gap-4">
                  {formato === 'cubo' ? (
                    <Field label="Lado (mm)">
                      <NumInput value={largura} onChange={v => { setLargura(v); setAltura(v) }} min={5} />
                    </Field>
                  ) : (
                    <>
                      <Field label="Diâmetro (mm)">
                        <NumInput value={largura} onChange={setLargura} min={5} />
                      </Field>
                      <Field label="Altura (mm)">
                        <NumInput value={altura} onChange={setAltura} min={1} />
                      </Field>
                    </>
                  )}
                </div>
              </>
            )}
            <NavButtons />
          </div>
        )}

        {/* ── 3. Preenchimento ── */}
        {passo === 'preenchimento' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Padrão de preenchimento</h2>
            <p className="text-xs text-[#58413c] mb-5">Define como o material é depositado em cada camada.</p>
            <div className="grid grid-cols-3 gap-3">
              {PREENCHIMENTOS.map(p => (
                <button key={p.id} onClick={() => setPreenchimento(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${preenchimento === p.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                  <div className="w-full aspect-[4/3] mb-2 rounded-lg bg-[#fff8f1] border border-[#e5d9c1] flex items-center justify-center p-2">
                    <FillPreview id={p.id} />
                  </div>
                  <p className="text-xs font-medium">{p.label}</p>
                  <p className="text-[10px] text-[#58413c] mt-0.5 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 4. Equipamento ── */}
        {passo === 'equipamento' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Equipamento</h2>
            <p className="text-xs text-[#58413c] mb-5">Selecione a impressora BioedTech e a seringa montada.</p>

            <div className="mb-5">
              <p className="text-xs font-medium text-[#211b0c] mb-2">Impressora</p>
              <div className="grid grid-cols-2 gap-2">
                {MACHINES.map(m => (
                  <button key={m.id} onClick={() => setMachine(m.id as MachineId)}
                    className={`p-3 rounded-xl border text-left transition-all ${machine === m.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-[#58413c] mt-0.5">BioedTech</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#211b0c] mb-2">Seringa</p>
              <div className="grid grid-cols-2 gap-3">
                {SYRINGES.map(s => (
                  <button key={s.volume_ml} onClick={() => setSeringa(s.volume_ml as 10 | 60)}
                    className={`p-4 rounded-xl border text-left transition-all ${seringa === s.volume_ml ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <p className="text-2xl font-bold text-[#003223]">{s.volume_ml}<span className="text-sm font-normal ml-0.5">mL</span></p>
                  </button>
                ))}
              </div>
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 5. Ponteira ── */}
        {passo === 'ponteira' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Ponteira</h2>
            <p className="text-xs text-[#58413c] mb-5">As cores correspondem às tampas das seringas com luerlock.</p>

            {/* Sugestão da MIA via formulação */}
            <div className="mb-5 p-3 bg-[#003223]/5 border border-[#003223]/10 rounded-xl">
              <p className="text-xs font-semibold text-[#003223] mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Sugestão da MIA
              </p>
              <label className="text-xs text-[#58413c] block mb-1.5">Selecione sua formulação</label>
              <select value={formulacaoId} onChange={e => handleFormulacaoChange(e.target.value)}
                className="w-full bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-[#003223]/20">
                <option value="">Sem formulação / pular sugestão</option>
                {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
              {loadingSugestao && (
                <p className="text-xs text-[#58413c] italic">Analisando formulação...</p>
              )}
              {sugestaoPonteira && !loadingSugestao && (
                <div className="flex gap-1.5 mt-1">
                  <Info size={12} className="text-[#003223] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#003223] leading-relaxed">{sugestaoPonteira}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PONTEIRAS.map(p => (
                <button key={p.value} onClick={() => setPonteira(p.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${ponteira === p.value ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${p.cor}`} />
                  <p className="text-sm font-medium">{p.label} <span className="text-xs text-[#58413c] font-normal">· {p.corLabel}</span></p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 6. Definição ── */}
        {passo === 'definicao' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Definição de impressão</h2>
            <p className="text-xs text-[#58413c] mb-5">Determina o nível de detalhe e a velocidade.</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {QUALIDADES.map(q => (
                <button key={q.id} onClick={() => setQualidade(q.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${qualidade === q.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                  <p className="text-sm font-semibold">{q.label}</p>
                  <p className="text-xs text-[#58413c] mt-1 leading-snug">{q.desc}</p>
                </button>
              ))}
            </div>

            <Field label="Temperatura (opcional)">
              <div className="flex items-center gap-2">
                <input type="number" value={temperatura} onChange={e => setTemperatura(e.target.value)}
                  placeholder="ex: 60"
                  className="w-28 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
                <span className="text-xs text-[#58413c]">°C — vazio = ambiente</span>
              </div>
            </Field>

            <NavButtons />
          </div>
        )}

        {/* ── Resultado ── */}
        {passo === 'resultado' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">Configuração pronta</h2>
                <p className="text-xs text-[#58413c]">{formatoSpec?.label}{formulacaoNome ? ` · ${formulacaoNome}` : ''}</p>
              </div>
              <button onClick={() => setPasso('formato')}
                className="text-xs text-[#58413c] hover:text-[#211b0c] flex items-center gap-1 border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                <ArrowLeft size={11} /> Refazer
              </button>
            </div>

            {/* Viewer 3D */}
            <div className="mb-4 bg-white border border-[#e5d9c1] rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#e5d9c1] flex justify-between items-center">
                <span className="text-xs font-medium">{formatoSpec?.label}</span>
                <span className="text-xs text-[#58413c]">Arraste · Scroll</span>
              </div>
              <ShapePreview
                formato={formato as 'cilindro' | 'cubo'}
                diametro={larguraN}
                altura={alturaN}
                stlPath={formatoSpec?.stl ?? undefined}
                stlScale={isStl ? stlScale : 1}
              />
            </div>

            {/* Parâmetros */}
            <div className="bg-white border border-[#e5d9c1] rounded-2xl p-4 mb-4">
              <h3 className="text-xs font-semibold mb-3">Parâmetros</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  ['Ponteira', `${ponteira} mm`],
                  ['Altura de camada', `${layerHeight} mm`],
                  ['Preenchimento', PREENCHIMENTOS.find(p => p.id === preenchimento)?.label ?? preenchimento],
                  ['Definição', qualSpec.label],
                  ['Seringa', `${seringa} mL`],
                  ['Temperatura', temperatura ? `${temperatura}°C` : 'Ambiente'],
                  ...(formulacaoNome ? [['Formulação', formulacaoNome]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-2.5">
                    <p className="text-[#58413c] mb-0.5">{label}</p>
                    <p className="font-semibold text-[#003223]">{val}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={exportarIni}
                  className="flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={11} /> Config PrusaSlicer (.ini)
                </button>
                <button onClick={abrirNoPrusaSlicer}
                  className="flex items-center gap-1.5 text-xs bg-[#003223] hover:bg-[#004d35] text-white px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={11} /> STL + Abrir PrusaSlicer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#211b0c] block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function NumInput({ value, onChange, min, max, step }: {
  value: string
  onChange: (v: string) => void
  min?: number
  max?: number
  step?: string
}) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step ?? '1'}
      className="w-full bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
  )
}
