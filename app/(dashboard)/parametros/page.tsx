'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, ArrowRight, Check, Download, Sparkles, SlidersHorizontal, Info, Box, Square,
} from 'lucide-react'
import {
  SYRINGES, MACHINES, calcEPerMm,
  type MachineId,
} from '@/lib/parametros/extrusion'

const ShapePreview = dynamic(
  () => import('@/components/parametros/ShapePreview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[280px] text-xs" style={{ color: 'var(--text-faint)' }}>Carregando...</div> },
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
            fill="none" style={{ stroke: 'var(--text-main)' }} strokeWidth="1.5" opacity={0.9 - i * 0.18} />
        ))}
      </svg>
    )
  }
  if (id === 'retilineo') {
    const hLines = [12, 22, 32, 42, 52, 62]
    const vLines = [10, 20, 30, 40, 50, 60, 70, 80]
    return (
      <svg viewBox="0 0 90 68" className="w-full h-full">
        {hLines.map(y => <line key={`h${y}`} x1={6} y1={y} x2={84} y2={y} style={{ stroke: 'var(--text-main)' }} strokeWidth="1.5" opacity="0.7" />)}
        {vLines.map(x => <line key={`v${x}`} x1={x} y1={6} x2={x} y2={62} style={{ stroke: 'var(--text-muted)' }} strokeWidth="1.5" opacity="0.45" />)}
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
        <path key={`${cx}-${cy}`} d={hex(cx, cy)} fill="none" style={{ stroke: 'var(--text-main)' }} strokeWidth="1.5" opacity="0.65" />
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
      let texto = ''
      if (reader) {
        const { readStreamText } = await import('@/lib/ai/stream-utils')
        texto = await readStreamText(reader)
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
  // Step bar (padrão visual do /formular)
  // ---------------------------------------------------------------------------

  const progressSteps = PASSOS.filter(p => p !== 'resultado')

  function StepBar() {
    if (passo === 'resultado') return null
    return (
      <div className="param-steps">
        {progressSteps.map((p, i) => {
          const num = i + 1
          const done = passoIdx > i
          const active = passo === p
          return (
            <div key={p} className="param-step-wrap">
              <div className="param-step-col">
                <div className={`param-step-dot ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                  {done ? <Check size={14} strokeWidth={2.5} /> : num}
                </div>
                <span className={`param-step-label ${active ? 'active' : ''} ${done ? 'done' : ''}`}>{PASSO_LABEL[p]}</span>
              </div>
              {i < progressSteps.length - 1 && <div className={`param-step-line ${done ? 'done' : ''}`} />}
            </div>
          )
        })}
      </div>
    )
  }

  function NavButtons({ disableNext = false }: { disableNext?: boolean }) {
    return (
      <div className="param-footer">
        <button onClick={voltar} disabled={passoIdx === 0} className="param-back">
          <ArrowLeft size={14} /> Voltar
        </button>
        <button onClick={avancar} disabled={disableNext} className="param-next">
          {passo === 'definicao' ? 'Ver resultado' : 'Próximo'} <ArrowRight size={14} />
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-full overflow-y-auto param-page">
      <style>{PARAM_CSS}</style>

      <div className="param-header">
        <h1><SlidersHorizontal size={18} /> Parâmetros de Impressão</h1>
        <p>Configure passo a passo e exporte para a impressora BioedTech.</p>
      </div>

      <div className="param-root">
        <StepBar />

        {/* ── 1. Formato ── */}
        {passo === 'formato' && (
          <div>
            <div className="param-head">
              <h2>Qual é o <em>formato</em> da peça?</h2>
              <p>Cilindro e Cubo são paramétricos. Os demais carregam modelos 3D prontos.</p>
            </div>
            <div className="shape-grid">
              {FORMATOS.map(f => (
                <button key={f.id} onClick={() => setFormato(f.id)}
                  className={`shape-card ${formato === f.id ? 'active' : ''}`}>
                  {formato === f.id && <span className="shape-check"><Check size={13} strokeWidth={2.5} /></span>}
                  <div className="shape-box">
                    <div className="shape-box-inner">
                      {f.stl ? <Box size={20} /> : <Square size={20} />}
                    </div>
                  </div>
                  <p className="shape-label">{f.label}</p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 2. Tamanho ── */}
        {passo === 'tamanho' && (
          <div>
            <div className="param-head">
              <h2>Defina o <em>tamanho</em></h2>
              <p>{isStl ? 'Ajuste a escala do modelo 3D e veja o resultado abaixo.' : (formato === 'cubo' ? 'Defina o lado do cubo.' : 'Defina o diâmetro e a altura.')}</p>
            </div>

            <div className="param-size-layout">
              <div className="param-size-controls">
                {isStl ? (
                  <div>
                    <div className="param-field-row">
                      <label>Escala</label>
                      <span className="param-field-value">{Math.round(stlScale * 100)}%</span>
                    </div>
                    <input type="range" min={0.25} max={3} step={0.05} value={stlScale}
                      onChange={e => setStlScale(parseFloat(e.target.value))}
                      className="param-slider" />
                    <div className="param-slider-ticks">
                      <span>25%</span><span>100%</span><span>300%</span>
                    </div>
                  </div>
                ) : formato === 'cubo' ? (
                  <Field label="Lado (mm)">
                    <NumInput value={largura} onChange={v => { setLargura(v); setAltura(v) }} min={5} />
                  </Field>
                ) : (
                  <div className="param-field-pair">
                    <Field label="Diâmetro (mm)">
                      <NumInput value={largura} onChange={setLargura} min={5} />
                    </Field>
                    <Field label="Altura (mm)">
                      <NumInput value={altura} onChange={setAltura} min={1} />
                    </Field>
                  </div>
                )}
              </div>

              <div className="param-preview">
                <div className="param-preview-head">
                  <span>{formatoSpec?.label}</span>
                  <span className="param-preview-hint">Arraste · Scroll</span>
                </div>
                <ShapePreview
                  formato={formato as 'cilindro' | 'cubo'}
                  diametro={larguraN}
                  altura={alturaN}
                  stlPath={formatoSpec?.stl ?? undefined}
                  stlScale={isStl ? stlScale : 1}
                />
              </div>
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 3. Preenchimento ── */}
        {passo === 'preenchimento' && (
          <div>
            <div className="param-head">
              <h2>Padrão de <em>preenchimento</em></h2>
              <p>Define como o material é depositado em cada camada.</p>
            </div>
            <div className="param-fill-grid">
              {PREENCHIMENTOS.map(p => (
                <button key={p.id} onClick={() => setPreenchimento(p.id)}
                  className={`aplic-card ${preenchimento === p.id ? 'active' : ''}`}>
                  <div className="param-fill-preview">
                    <FillPreview id={p.id} />
                  </div>
                  <p className="aplic-nome">{p.label}</p>
                  <p className="aplic-desc">{p.desc}</p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 4. Equipamento ── */}
        {passo === 'equipamento' && (
          <div>
            <div className="param-head">
              <h2>Selecione o <em>equipamento</em></h2>
              <p>Escolha a impressora BioedTech e a seringa montada.</p>
            </div>

            <p className="param-subhead">Impressora</p>
            <div className="param-fill-grid" style={{ marginBottom: 28 }}>
              {MACHINES.map(m => (
                <button key={m.id} onClick={() => setMachine(m.id as MachineId)}
                  className={`aplic-card ${machine === m.id ? 'active' : ''}`}>
                  <p className="aplic-nome">{m.label}</p>
                  <p className="aplic-desc">BioedTech</p>
                </button>
              ))}
            </div>

            <p className="param-subhead">Seringa</p>
            <div className="param-fill-grid">
              {SYRINGES.map(s => (
                <button key={s.volume_ml} onClick={() => setSeringa(s.volume_ml as 10 | 60)}
                  className={`aplic-card ${seringa === s.volume_ml ? 'active' : ''}`}>
                  <p className="param-syringe-vol">{s.volume_ml}<span>mL</span></p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 5. Ponteira ── */}
        {passo === 'ponteira' && (
          <div>
            <div className="param-head">
              <h2>Escolha a <em>ponteira</em></h2>
              <p>As cores correspondem às tampas das seringas com luerlock.</p>
            </div>

            {/* Sugestão da MIA via formulação */}
            <div className="param-mia-box">
              <p className="param-mia-title"><Sparkles size={12} /> Sugestão da MIA</p>
              <label className="param-mia-label">Selecione sua formulação</label>
              <select value={formulacaoId} onChange={e => handleFormulacaoChange(e.target.value)} className="param-select">
                <option value="">Sem formulação / pular sugestão</option>
                {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
              {loadingSugestao && <p className="param-mia-loading">Analisando formulação...</p>}
              {sugestaoPonteira && !loadingSugestao && (
                <div className="param-mia-suggestion">
                  <Info size={12} />
                  <p>{sugestaoPonteira}</p>
                </div>
              )}
            </div>

            <div className="param-tip-grid">
              {PONTEIRAS.map(p => (
                <button key={p.value} onClick={() => setPonteira(p.value)}
                  className={`aplic-card param-tip-card ${ponteira === p.value ? 'active' : ''}`}>
                  <div className={`param-tip-dot ${p.cor}`} />
                  <p className="param-tip-label">{p.label} <span>· {p.corLabel}</span></p>
                </button>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 6. Definição ── */}
        {passo === 'definicao' && (
          <div>
            <div className="param-head">
              <h2>Nível de <em>definição</em></h2>
              <p>Determina o nível de detalhe e a velocidade de impressão.</p>
            </div>

            <div className="param-fill-grid" style={{ marginBottom: 28 }}>
              {QUALIDADES.map(q => (
                <button key={q.id} onClick={() => setQualidade(q.id)}
                  className={`aplic-card ${qualidade === q.id ? 'active' : ''}`}>
                  <p className="aplic-nome">{q.label}</p>
                  <p className="aplic-desc">{q.desc}</p>
                </button>
              ))}
            </div>

            <Field label="Temperatura (opcional)">
              <div className="param-temp-row">
                <input type="number" value={temperatura} onChange={e => setTemperatura(e.target.value)}
                  placeholder="ex: 60" className="param-input param-temp-input" />
                <span className="param-temp-hint">°C — vazio = ambiente</span>
              </div>
            </Field>

            <NavButtons />
          </div>
        )}

        {/* ── Resultado ── */}
        {passo === 'resultado' && (
          <div>
            <div className="param-result-head">
              <div>
                <h2>Configuração <em>pronta</em></h2>
                <p>{formatoSpec?.label}{formulacaoNome ? ` · ${formulacaoNome}` : ''}</p>
              </div>
              <button onClick={() => setPasso('formato')} className="param-back">
                <ArrowLeft size={13} /> Refazer
              </button>
            </div>

            {/* Viewer 3D */}
            <div className="param-card param-result-viewer">
              <div className="param-preview-head">
                <span>{formatoSpec?.label}</span>
                <span className="param-preview-hint">Arraste · Scroll</span>
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
            <div className="param-card">
              <h3 className="param-card-title">Parâmetros</h3>
              <div className="param-meta-grid">
                {[
                  ['Ponteira', `${ponteira} mm`],
                  ['Altura de camada', `${layerHeight} mm`],
                  ['Preenchimento', PREENCHIMENTOS.find(p => p.id === preenchimento)?.label ?? preenchimento],
                  ['Definição', qualSpec.label],
                  ['Seringa', `${seringa} mL`],
                  ['Temperatura', temperatura ? `${temperatura}°C` : 'Ambiente'],
                  ...(formulacaoNome ? [['Formulação', formulacaoNome]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="param-meta-item">
                    <p className="param-meta-label">{label}</p>
                    <p className="param-meta-value">{val}</p>
                  </div>
                ))}
              </div>

              <div className="param-result-actions">
                <button onClick={exportarIni} className="param-back">
                  <Download size={13} /> Config PrusaSlicer (.ini)
                </button>
                <button onClick={abrirNoPrusaSlicer} className="param-next">
                  <Download size={13} /> STL + Abrir PrusaSlicer
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
    <div className="param-field">
      <label>{label}</label>
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
      min={min} max={max} step={step ?? '1'} className="param-input" />
  )
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const PARAM_CSS = `
  .param-page{color:var(--text-main)}

  .param-header{
    border-bottom:1px solid var(--border-glass);
    padding:18px 32px;
  }
  .param-header h1{
    font-size:18px;font-weight:600;margin:0;
    display:flex;align-items:center;gap:8px;
    color:var(--text-main);
  }
  .param-header p{font-size:12.5px;color:var(--text-muted);margin:4px 0 0}

  .param-root{
    width:100%;max-width:1100px;margin:0 auto;
    padding:24px 32px 48px;
  }

  /* ── Step bar ─────────────────────────────────────── */
  .param-steps{
    display:flex;align-items:flex-start;
    padding:4px 8px 22px;
    border-bottom:1px solid var(--border-glass);
    margin-bottom:32px;
  }
  .param-step-wrap{display:flex;align-items:flex-start;flex:1;gap:10px}
  .param-step-col{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:90px}
  .param-step-dot{
    width:34px;height:34px;border-radius:50%;
    display:grid;place-items:center;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-muted);
    font-weight:600;font-size:13px;
    transition:.25s;backdrop-filter:blur(10px);
  }
  .param-step-dot.done{background:var(--accent-em);color:var(--accent-text-on);border-color:transparent}
  .param-step-dot.active{background:var(--accent);color:var(--accent-text-on);border-color:transparent;box-shadow:0 0 0 5px var(--icon-tint)}
  .param-step-label{font-size:12px;color:var(--text-faint);font-weight:500;letter-spacing:.01em}
  .param-step-label.active{color:var(--text-main);font-weight:600}
  .param-step-label.done{color:var(--text-muted)}
  .param-step-line{
    flex:1;height:1.5px;margin-top:17px;border-radius:2px;
    background:repeating-linear-gradient(90deg, var(--border-glass-strong) 0 6px, transparent 6px 12px);
  }
  .param-step-line.done{background:var(--accent-em)}

  /* ── Head ─────────────────────────────────────────── */
  .param-head{margin-bottom:26px;max-width:680px}
  .param-head h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(26px,3vw,38px);line-height:1.1;letter-spacing:-.015em;
    color:var(--text-main);margin:0 0 8px;
  }
  .param-head h2 em{font-style:italic;color:var(--accent-em);font-family:inherit}
  .param-head p{color:var(--text-muted);font-size:14.5px;line-height:1.55;margin:0}
  .param-subhead{font-size:12.5px;font-weight:600;color:var(--text-faint);text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px}

  /* ── Footer ───────────────────────────────────────── */
  .param-footer{
    display:flex;align-items:center;justify-content:space-between;
    padding-top:24px;border-top:1px solid var(--border-glass);
    margin-top:32px;
  }
  .param-back{
    display:inline-flex;align-items:center;gap:6px;
    background:transparent;border:1px solid var(--border-glass-strong);cursor:pointer;
    color:var(--text-muted);font-family:inherit;font-size:13px;font-weight:500;
    padding:9px 16px;border-radius:999px;transition:.15s;
  }
  .param-back:hover{background:var(--hover-tint);color:var(--text-main)}
  .param-back:disabled{opacity:.35;cursor:not-allowed}
  .param-next{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;
    padding:12px 26px;border-radius:999px;
    font-family:inherit;font-size:14px;font-weight:600;
    transition:transform .15s, box-shadow .25s;
  }
  .param-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 30px -10px var(--accent)}
  .param-next:disabled{opacity:.45;cursor:not-allowed}

  /* ── Shape grid (formato) — quadrados grandes com quadrado interno ── */
  .shape-grid{
    display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));
    gap:14px;
  }
  .shape-card{
    position:relative;
    display:flex;flex-direction:column;align-items:center;gap:10px;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;padding:16px 10px;
    cursor:pointer;transition:.2s;
    font-family:inherit;color:var(--text-main);
    backdrop-filter:blur(16px);
  }
  .shape-card:hover{transform:translateY(-3px);border-color:var(--accent-em);box-shadow:0 18px 38px -16px rgba(0,0,0,.28)}
  .shape-card.active{border-color:var(--accent);background:var(--icon-tint)}
  .shape-check{
    position:absolute;top:10px;right:10px;
    width:22px;height:22px;border-radius:50%;
    background:var(--accent);color:var(--accent-text-on);
    display:grid;place-items:center;
  }
  .shape-box{
    width:100%;aspect-ratio:1;
    border-radius:14px;
    background:var(--surface-glass);
    border:1.5px solid var(--border-glass);
    display:grid;place-items:center;
    transition:.2s;
  }
  .shape-card.active .shape-box{border-color:var(--accent-em);background:var(--icon-tint)}
  .shape-box-inner{
    width:56%;height:56%;
    border-radius:9px;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    display:grid;place-items:center;
    color:var(--accent-em);
    transition:.2s;
  }
  .shape-card.active .shape-box-inner{border-color:var(--accent);color:var(--accent)}
  .shape-label{margin:0;font-size:13px;font-weight:500;text-align:center;line-height:1.3}

  /* ── Tamanho / preview ────────────────────────────── */
  .param-size-layout{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
  .param-size-controls{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;padding:22px;
    backdrop-filter:blur(16px);
  }
  .param-field-row{display:flex;justify-content:space-between;margin-bottom:10px}
  .param-field-row label{font-size:13px;font-weight:500;color:var(--text-main)}
  .param-field-value{font-size:13px;font-weight:700;color:var(--accent-em)}
  .param-slider{width:100%;accent-color:var(--accent)}
  .param-slider-ticks{display:flex;justify-content:space-between;font-size:11px;color:var(--text-faint);margin-top:4px}
  .param-field-pair{display:flex;gap:16px}
  .param-field{flex:1}
  .param-field label{font-size:13px;font-weight:500;color:var(--text-main);display:block;margin-bottom:8px}

  .param-preview{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;overflow:hidden;
    backdrop-filter:blur(16px);
  }
  .param-preview-head{
    display:flex;justify-content:space-between;align-items:center;
    padding:12px 16px;border-bottom:1px solid var(--border-glass);
    font-size:12.5px;font-weight:500;color:var(--text-main);
  }
  .param-preview-hint{color:var(--text-faint);font-weight:400}

  /* ── Generic fill/equipment/quality grid ─────────────── */
  .param-fill-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .aplic-card{
    position:relative;text-align:left;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;padding:18px;
    cursor:pointer;transition:.2s;
    backdrop-filter:blur(16px);
    font-family:inherit;color:var(--text-main);
  }
  .aplic-card:hover{transform:translateY(-3px);border-color:var(--accent-em);box-shadow:0 18px 38px -16px rgba(0,0,0,.28)}
  .aplic-card.active{border-color:var(--accent);background:var(--icon-tint)}
  .aplic-nome{margin:0 0 4px;font-size:14.5px;font-weight:600;color:var(--text-main)}
  .aplic-desc{margin:0;font-size:12.5px;line-height:1.5;color:var(--text-muted)}
  .param-fill-preview{
    width:100%;aspect-ratio:4/3;margin-bottom:10px;border-radius:12px;
    background:var(--surface-glass);border:1px solid var(--border-glass);
    display:flex;align-items:center;justify-content:center;padding:8px;
  }
  .param-syringe-vol{margin:0;font-size:24px;font-weight:700;color:var(--accent-em)}
  .param-syringe-vol span{font-size:13px;font-weight:400;margin-left:3px;color:var(--text-muted)}

  /* ── MIA suggestion box ──────────────────────────── */
  .param-mia-box{
    margin-bottom:24px;padding:16px;border-radius:16px;
    background:var(--icon-tint);border:1px solid var(--border-glass-strong);
  }
  .param-mia-title{
    font-size:12.5px;font-weight:600;color:var(--accent-em);
    display:flex;align-items:center;gap:6px;margin:0 0 10px;
  }
  .param-mia-label{font-size:12.5px;color:var(--text-muted);display:block;margin-bottom:6px}
  .param-select{
    width:100%;background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);color:var(--text-main);
    border-radius:10px;padding:9px 12px;font-size:13.5px;margin-bottom:8px;
    font-family:inherit;
  }
  .param-mia-loading{font-size:12.5px;color:var(--text-muted);font-style:italic;margin:0}
  .param-mia-suggestion{display:flex;gap:6px;margin-top:4px}
  .param-mia-suggestion svg{color:var(--accent-em);flex-shrink:0;margin-top:2px}
  .param-mia-suggestion p{font-size:12.5px;color:var(--text-main);line-height:1.55;margin:0}

  /* ── Ponteira tips ──────────────────────────────────── */
  .param-tip-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .param-tip-card{display:flex;align-items:center;gap:12px}
  .param-tip-dot{width:16px;height:16px;border-radius:50%;flex-shrink:0}
  .param-tip-label{margin:0;font-size:14px;font-weight:500;color:var(--text-main)}
  .param-tip-label span{font-size:12.5px;color:var(--text-muted);font-weight:400}

  /* ── Inputs ─────────────────────────────────────────── */
  .param-input{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-main);border-radius:10px;
    padding:10px 14px;font-size:14px;font-family:inherit;
  }
  .param-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--icon-tint)}
  .param-temp-row{display:flex;align-items:center;gap:10px}
  .param-temp-input{width:110px}
  .param-temp-hint{font-size:12.5px;color:var(--text-muted)}

  /* ── Resultado ────────────────────────────────────── */
  .param-result-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
  .param-result-head h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(24px,2.6vw,32px);margin:0 0 4px;color:var(--text-main);
  }
  .param-result-head h2 em{color:var(--accent-em);font-style:italic;font-family:inherit}
  .param-result-head p{font-size:13px;color:var(--text-muted);margin:0}
  .param-card{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;padding:18px;margin-bottom:16px;
    backdrop-filter:blur(16px);
  }
  .param-result-viewer{padding:0;overflow:hidden}
  .param-card-title{font-size:13px;font-weight:600;margin:0 0 14px;color:var(--text-main)}
  .param-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:12.5px}
  .param-meta-item{
    background:var(--surface-glass);border:1px solid var(--border-glass);
    border-radius:12px;padding:10px 12px;
  }
  .param-meta-label{color:var(--text-faint);margin:0 0 4px}
  .param-meta-value{font-weight:600;color:var(--accent-em);margin:0}
  .param-result-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}

  @media (max-width:900px){
    .param-size-layout{grid-template-columns:1fr}
    .param-fill-grid{grid-template-columns:1fr 1fr}
    .param-meta-grid{grid-template-columns:1fr 1fr}
    .param-tip-grid{grid-template-columns:1fr}
  }
  @media (max-width:640px){
    .param-root{padding:18px 16px}
    .param-step-col{min-width:48px}
    .param-step-label{display:none}
    .shape-grid{grid-template-columns:repeat(3,1fr)}
    .param-fill-grid{grid-template-columns:1fr}
    .param-meta-grid{grid-template-columns:1fr 1fr}
  }
`
