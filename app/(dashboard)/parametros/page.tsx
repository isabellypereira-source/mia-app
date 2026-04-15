'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, ArrowRight, CheckCircle, Copy, CheckCheck,
  Download, Lock, Info, SlidersHorizontal, Sparkles,
} from 'lucide-react'
import {
  SYRINGES, calcEPerMm, massToVolumeMm3, caloriesToMassG,
  cylinderDimsFromVolume, cubeSideFromVolume, flowRateMm3s, pistonSpeedMmS,
} from '@/lib/parametros/extrusion'
import { generateGCode, type GCodeConfig } from '@/lib/parametros/gcode'

// Viewer 3D leve (Three.js direto, sem react-three-fiber)
const ShapePreview = dynamic(
  () => import('@/components/parametros/ShapePreview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[280px] text-xs text-[#58413c]">Carregando viewer…</div> },
)

// ---------------------------------------------------------------------------
// Tipos e constantes
// ---------------------------------------------------------------------------

type Passo = 'formato' | 'tamanho' | 'seringa' | 'ponteira' | 'resolucao' | 'formulacao' | 'resultado'

const PASSOS: Passo[] = ['formato', 'tamanho', 'seringa', 'ponteira', 'resolucao', 'formulacao', 'resultado']
const PASSO_LABEL: Record<Passo, string> = {
  formato: 'Formato', tamanho: 'Tamanho', seringa: 'Seringa',
  ponteira: 'Ponteira', resolucao: 'Resolução', formulacao: 'Formulação', resultado: 'Resultado',
}

const FORMATOS = [
  { id: 'cilindro', label: 'Cilindro', emoji: '🟤', desc: 'Padrão para testes de extrusão e flow', pago: false },
  { id: 'cubo',     label: 'Cubo',     emoji: '🟫', desc: 'Avaliação de estabilidade estrutural',  pago: false },
  { id: 'capivara', label: 'Capivara', emoji: '🦫', desc: 'Cookie temático premium',               pago: true, preco: 'R$ 9,90' },
  { id: 'tilapia',  label: 'Tilápia',  emoji: '🐟', desc: 'Análogo de peixe estruturado',          pago: true, preco: 'R$ 14,90' },
  { id: 'coelho',   label: 'Coelho',   emoji: '🐰', desc: 'Formato festivo para produtos especiais', pago: true, preco: 'R$ 12,90' },
]

const PONTEIRAS = [
  { value: 0.6,  label: '0,6 mm', cor: 'bg-pink-400',    corLabel: 'Rosa',            desc: 'Alta resolução — pastas lisas',             luerlock: true },
  { value: 0.8,  label: '0,8 mm', cor: 'bg-emerald-400', corLabel: 'Verde-esmeralda', desc: 'Alta resolução — pastas lisas',             luerlock: true },
  { value: 1.2,  label: '1,2 mm', cor: 'bg-gray-400',    corLabel: 'Cinza',           desc: 'Boa resolução — baixa granulometria',       luerlock: true },
  { value: 1.6,  label: '1,6 mm', cor: 'bg-green-500',   corLabel: 'Verde',           desc: 'Uso geral — granulometria média',           luerlock: true },
  { value: 3.0,  label: '3,0 mm', cor: 'bg-green-300',   corLabel: 'Verde claro',     desc: 'Pastas densas, fibrosas, muito granuladas', luerlock: true },
  { value: 3.2,  label: '3,2 mm', cor: '',               corLabel: '—',               desc: 'Sem luerlock — similar à 3,0 mm',          luerlock: false },
]

const RESOLUCOES = [
  { id: 'alta',       label: 'Alta Definição', desc: 'Máximo detalhe, mais lento.',         fator: 0.4  },
  { id: 'balanceado', label: 'Balanceado',     desc: 'Equilíbrio detalhe/velocidade.',      fator: 0.5  },
  { id: 'otimizado',  label: 'Otimizado',      desc: 'Alta velocidade, menor definição.',   fator: 0.65 },
]

interface Formulacao { id: string; nome: string; ingredientes: { nome: string }[] }

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ParametrosPage() {
  const [passo, setPasso] = useState<Passo>('formato')

  // Wizard state
  const [formato, setFormato] = useState('cilindro')
  const [tamanhoMode, setTamanhoMode] = useState<'massa' | 'calorias' | 'manual'>('massa')
  const [massa, setMassa] = useState('100')
  const [calorias, setCalorias] = useState('200')
  const [kcalPer100g, setKcalPer100g] = useState('200')
  const [densidade, setDensidade] = useState('1.0')
  const [manualDiam, setManualDiam] = useState('40')
  const [manualAltura, setManualAltura] = useState('40')
  const [manualLado, setManualLado] = useState('40')
  const [seringa, setSeringa] = useState<10 | 60>(10)
  const [ponteira, setPonteira] = useState(0.8)
  const [resolucao, setResolucao] = useState('otimizado')
  const [formulacaoId, setFormulacaoId] = useState('')
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [fatorCalib, setFatorCalib] = useState(100)
  const [temperatura, setTemperatura] = useState('')

  // Resultado
  const [gcode, setGcode] = useState('')
  const [showGcode, setShowGcode] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
  }, [])

  // ---------------------------------------------------------------------------
  // Cálculos derivados
  // ---------------------------------------------------------------------------

  function getDims(): { diametro: number; altura: number } {
    if (tamanhoMode === 'manual') {
      if (formato === 'cubo') { const l = parseFloat(manualLado) || 40; return { diametro: l, altura: l } }
      return { diametro: parseFloat(manualDiam) || 40, altura: parseFloat(manualAltura) || 40 }
    }
    let massaG = parseFloat(massa) || 100
    if (tamanhoMode === 'calorias') {
      massaG = caloriesToMassG(parseFloat(calorias) || 200, parseFloat(kcalPer100g) || 200)
    }
    const vol = massToVolumeMm3(massaG, parseFloat(densidade) || 1.0)
    if (formato === 'cubo') { const s = cubeSideFromVolume(vol); return { diametro: s, altura: s } }
    const { diameter_mm, height_mm } = cylinderDimsFromVolume(vol)
    return { diametro: diameter_mm, altura: height_mm }
  }

  const dims = getDims()
  const syringeSpec = SYRINGES.find(s => s.volume_ml === seringa)!
  const resolucaoSpec = RESOLUCOES.find(r => r.id === resolucao)!
  const layerHeight = parseFloat((ponteira * resolucaoSpec.fator).toFixed(2))
  const printSpeed = resolucao === 'alta' ? 8 : resolucao === 'balanceado' ? 15 : 22
  const ePerMmTeorico = calcEPerMm(ponteira, syringeSpec.diameter_mm)
  const ePerMmEfetivo = ePerMmTeorico * (fatorCalib / 100)
  const formulacaoNome = formulacoes.find(f => f.id === formulacaoId)?.nome ?? 'Sem formulação'

  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------

  const passoIdx = PASSOS.indexOf(passo)

  function avancar() {
    if (passo === 'formulacao') {
      gerarResultado()
    } else {
      setPasso(PASSOS[passoIdx + 1])
      window.scrollTo(0, 0)
    }
  }

  function voltar() {
    if (passoIdx > 0) { setPasso(PASSOS[passoIdx - 1]); window.scrollTo(0, 0) }
  }

  function gerarResultado() {
    setGcode(buildGCode())
    setPasso('resultado')
    window.scrollTo(0, 0)
  }

  function buildGCode() {
    const cfg: GCodeConfig = {
      formulacao_nome: formulacaoNome,
      formato: formato as 'cilindro' | 'cubo',
      seringa_ml: seringa,
      ponteira_mm: ponteira,
      layer_height_mm: layerHeight,
      print_speed_mm_s: printSpeed,
      fator_calibracao: fatorCalib,
      temperatura_c: temperatura ? parseFloat(temperatura) : null,
      diametro_mm: dims.diametro,
      altura_mm: dims.altura,
    }
    return generateGCode(cfg)
  }

  function regenerarGCode() {
    setGcode(buildGCode())
  }

  async function baixarGcode() {
    const blob = new Blob([gcode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mia_${formulacaoNome.replace(/\s+/g, '_')}_${formato}.gcode`; a.click()
    URL.revokeObjectURL(url)
  }

  async function copiarGcode() {
    await navigator.clipboard.writeText(gcode)
    setCopiado(true); setTimeout(() => setCopiado(false), 2000)
  }

  function exportarIni() {
    const ini = [
      `[print]`,
      `layer_height = ${layerHeight}`,
      `perimeters = 2`,
      `infill_density = 100%`,
      `fill_pattern = concentric`,
      `perimeter_speed = ${printSpeed}`,
      `infill_speed = ${printSpeed}`,
      `travel_speed = 50`,
      `first_layer_speed = ${Math.round(printSpeed * 0.5)}`,
      ``,
      `[printer]`,
      `nozzle_diameter = ${ponteira}`,
      temperatura ? `temperature = ${temperatura}` : `; temperature = ambiente`,
      ``,
      `; Gerado por MIA — Morphê Foods`,
      `; Formulação: ${formulacaoNome}`,
      `; Seringa: ${seringa}mL — Ø${syringeSpec.diameter_mm}mm`,
      `; E/mm: ${ePerMmEfetivo.toFixed(6)} mm pistão/mm percurso`,
    ].join('\n')
    const blob = new Blob([ini], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mia_${formulacaoNome.replace(/\s+/g, '_')}.ini`; a.click()
    URL.revokeObjectURL(url)
  }

  // ---------------------------------------------------------------------------
  // Componentes internos
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
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                  done ? 'bg-[#003223] text-white' : active ? 'bg-[#003223] text-white' : 'bg-[#e5d9c1] text-[#bfc9c2]'
                }`}>
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
    const isLast = passo === 'formulacao'
    return (
      <div className="flex justify-between mt-8">
        <button onClick={voltar} disabled={passoIdx === 0}
          className="flex items-center gap-2 text-sm text-[#58413c] hover:text-[#211b0c] disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg border border-[#e5d9c1] transition-colors">
          <ArrowLeft size={14} /> Voltar
        </button>
        <button onClick={avancar} disabled={disableNext}
          className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          {isLast ? <><Sparkles size={14} /> Gerar resultado</> : <>Próximo <ArrowRight size={14} /></>}
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
        <p className="text-xs text-[#58413c] mt-0.5">Configure passo a passo e exporte o GCode para a Morphê.</p>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <ProgressBar />

        {/* ── Passo 1: Formato ── */}
        {passo === 'formato' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual é o formato da peça?</h2>
            <p className="text-xs text-[#58413c] mb-5">Gratuitos para testes. Formatos temáticos disponíveis como add-on.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FORMATOS.map(f => (
                <div key={f.id} className="relative">
                  {f.pago ? (
                    <div className="p-4 rounded-xl border border-[#e5d9c1] bg-[#fff2da] opacity-55 cursor-not-allowed select-none">
                      <Lock size={11} className="absolute top-2.5 right-2.5 text-[#58413c]" />
                      <span className="text-2xl mb-2 block">{f.emoji}</span>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-[#58413c] mt-0.5">{f.desc}</p>
                      <p className="text-xs text-[#003223] mt-1 font-medium">{f.preco}</p>
                    </div>
                  ) : (
                    <button onClick={() => setFormato(f.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        formato === f.id
                          ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20'
                          : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'
                      }`}>
                      <span className="text-2xl mb-2 block">{f.emoji}</span>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-[#58413c] mt-0.5">{f.desc}</p>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── Passo 2: Tamanho ── */}
        {passo === 'tamanho' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual o tamanho da peça?</h2>
            <p className="text-xs text-[#58413c] mb-5">Calcule a partir de propriedades nutricionais ou insira as dimensões manualmente.</p>

            <div className="flex gap-1 mb-6 p-1 bg-[#fff2da] rounded-xl w-fit">
              {(['massa', 'calorias', 'manual'] as const).map(m => (
                <button key={m} onClick={() => setTamanhoMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tamanhoMode === m ? 'bg-[#003223] text-white' : 'text-[#58413c] hover:bg-[#e5d9c1]/60'
                  }`}>
                  {m === 'massa' ? 'Por massa' : m === 'calorias' ? 'Por calorias' : 'Manual'}
                </button>
              ))}
            </div>

            {tamanhoMode === 'massa' && (
              <div className="space-y-4">
                <Field label="Massa desejada (g)">
                  <NumInput value={massa} onChange={setMassa} min={1} />
                </Field>
                <Field label="Densidade da pasta (g/cm³)" hint="Pastas alimentares: 0,8–1,2. Padrão 1,0.">
                  <NumInput value={densidade} onChange={setDensidade} step="0.1" min={0.5} max={2} />
                </Field>
              </div>
            )}

            {tamanhoMode === 'calorias' && (
              <div className="space-y-4">
                <Field label="Meta calórica (kcal)">
                  <NumInput value={calorias} onChange={setCalorias} min={10} />
                </Field>
                <Field label="Energia da formulação (kcal/100g)" hint="Veja na tabela nutricional da formulação.">
                  <NumInput value={kcalPer100g} onChange={setKcalPer100g} min={10} />
                </Field>
                <Field label="Densidade da pasta (g/cm³)">
                  <NumInput value={densidade} onChange={setDensidade} step="0.1" min={0.5} />
                </Field>
              </div>
            )}

            {tamanhoMode === 'manual' && (
              <div className="space-y-4">
                {formato === 'cubo' ? (
                  <Field label="Aresta do cubo (mm)">
                    <NumInput value={manualLado} onChange={setManualLado} min={5} />
                  </Field>
                ) : (
                  <div className="flex gap-4">
                    <Field label="Diâmetro (mm)">
                      <NumInput value={manualDiam} onChange={setManualDiam} min={5} />
                    </Field>
                    <Field label="Altura (mm)">
                      <NumInput value={manualAltura} onChange={setManualAltura} min={5} />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Preview das dimensões */}
            <DimPreview
              formato={formato}
              dims={dims}
              massaG={tamanhoMode === 'massa' ? parseFloat(massa) : tamanhoMode === 'calorias' ? caloriesToMassG(parseFloat(calorias)||200, parseFloat(kcalPer100g)||200) : null}
            />

            <NavButtons />
          </div>
        )}

        {/* ── Passo 3: Seringa ── */}
        {passo === 'seringa' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual seringa você está usando?</h2>
            <p className="text-xs text-[#58413c] mb-5">O diâmetro define o curso do pistão por mm de percurso impresso.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYRINGES.map(s => {
                const e = calcEPerMm(ponteira, s.diameter_mm)
                const pistao = pistonSpeedMmS(ponteira, s.diameter_mm, printSpeed)
                return (
                  <button key={s.volume_ml} onClick={() => setSeringa(s.volume_ml as 10 | 60)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      seringa === s.volume_ml
                        ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20'
                        : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'
                    }`}>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-[#58413c] mt-0.5">Ø{s.diameter_mm}mm · área {s.area_mm2.toFixed(0)} mm²</p>
                    <div className="mt-2.5 pt-2.5 border-t border-[#e5d9c1] space-y-1 text-xs">
                      <p>E/mm = <span className="font-mono font-semibold text-[#003223]">{e.toFixed(5)}</span> mm pistão/mm</p>
                      <p className="text-[#58413c]">Pistão a {printSpeed}mm/s → <span className="font-mono">{pistao.toFixed(4)}</span> mm/s</p>
                      <p className="text-[#58413c]">Fluxo = <span className="font-mono">{flowRateMm3s(ponteira, printSpeed).toFixed(2)}</span> mm³/s</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
              <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Seringa maior → pistão avança menos por mm → mais controle para pastas viscosas. Seringa menor → mais sensível → melhor para pastas fluidas.
              </p>
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── Passo 4: Ponteira ── */}
        {passo === 'ponteira' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual a ponteira (nozzle)?</h2>
            <p className="text-xs text-[#58413c] mb-5">Guia de cores para luerlock. A granulometria dos ingredientes define o mínimo recomendado.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PONTEIRAS.map(p => {
                const e = calcEPerMm(p.value, syringeSpec.diameter_mm)
                return (
                  <button key={p.value} onClick={() => setPonteira(p.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      ponteira === p.value
                        ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20'
                        : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'
                    }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 ${p.cor}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.label} <span className="text-xs text-[#58413c] font-normal">· {p.corLabel}</span></p>
                      <p className="text-xs text-[#58413c]">{p.desc}</p>
                      <p className="text-xs font-mono text-[#003223] mt-0.5">E/mm: {e.toFixed(5)}</p>
                      {!p.luerlock && <p className="text-xs text-amber-600">Sem luerlock</p>}
                    </div>
                  </button>
                )
              })}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── Passo 5: Resolução ── */}
        {passo === 'resolucao' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual a resolução de impressão?</h2>
            <p className="text-xs text-[#58413c] mb-5">Define a altura de camada (% do diâmetro da ponteira) e a velocidade de impressão.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RESOLUCOES.map(r => {
                const lh = parseFloat((ponteira * r.fator).toFixed(2))
                const spd = r.id === 'alta' ? 8 : r.id === 'balanceado' ? 15 : 22
                return (
                  <button key={r.id} onClick={() => setResolucao(r.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      resolucao === r.id
                        ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20'
                        : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'
                    }`}>
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-xs text-[#58413c] mt-0.5">{r.desc}</p>
                    <div className="mt-2.5 pt-2 border-t border-[#e5d9c1] text-xs space-y-0.5">
                      <p className="text-[#003223]">Camada: <span className="font-semibold">{lh} mm</span></p>
                      <p className="text-[#58413c]">Vel: {spd} mm/s</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── Passo 6: Formulação ── */}
        {passo === 'formulacao' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Formulação e ajustes finais</h2>
            <p className="text-xs text-[#58413c] mb-5">Vincule a formulação para rastreabilidade e ajuste a calibração e temperatura.</p>

            <div className="mb-5">
              <label className="text-xs font-medium text-[#211b0c] block mb-1.5">Formulação</label>
              <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
                className="w-full bg-white border border-[#e5d9c1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30">
                <option value="">Sem formulação (teste de parâmetros)</option>
                {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-[#211b0c] block mb-1.5">Temperatura de impressão (opcional)</label>
              <div className="flex items-center gap-2">
                <NumInput value={temperatura} onChange={setTemperatura} placeholder="ex: 60" />
                <span className="text-xs text-[#58413c]">°C — vazio = temperatura ambiente</span>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#211b0c]">Fator de calibração</label>
                <span className="text-xs font-mono font-semibold text-[#003223]">{fatorCalib}%</span>
              </div>
              <input type="range" min={70} max={130} value={fatorCalib} onChange={e => setFatorCalib(parseInt(e.target.value))}
                className="w-full accent-[#003223]" />
              <p className="text-xs text-[#58413c] mt-1">
                Padrão 100% = E calculado geometricamente ({ePerMmTeorico.toFixed(5)} mm/mm).
                Aumente se falta material; reduza se excessivo.
              </p>
            </div>

            {/* Resumo */}
            <div className="p-4 bg-white border border-[#e5d9c1] rounded-xl text-xs">
              <p className="font-semibold mb-2.5">Resumo</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  ['Formato', FORMATOS.find(f => f.id === formato)?.label ?? formato],
                  ['Dimensões', `${dims.diametro}mm × ${dims.altura}mm`],
                  ['Seringa', `${seringa}mL (Ø${syringeSpec.diameter_mm}mm)`],
                  ['Ponteira', `Ø${ponteira}mm`],
                  ['Camada', `${layerHeight}mm (${resolucaoSpec.label})`],
                  ['Velocidade', `${printSpeed} mm/s`],
                  ['E/mm efetivo', ePerMmEfetivo.toFixed(6)],
                ].map(([k, v]) => (
                  <>
                    <span key={`k-${k}`} className="text-[#58413c]">{k}</span>
                    <span key={`v-${k}`} className="font-medium font-mono text-[#211b0c]">{v}</span>
                  </>
                ))}
              </div>
            </div>

            <NavButtons />
          </div>
        )}

        {/* ── Resultado ── */}
        {passo === 'resultado' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">Parâmetros gerados ✓</h2>
                <p className="text-xs text-[#58413c]">{formulacaoNome} · {FORMATOS.find(f => f.id === formato)?.label} {dims.diametro}×{dims.altura}mm</p>
              </div>
              <button onClick={() => setPasso('formato')}
                className="text-xs text-[#58413c] hover:text-[#211b0c] flex items-center gap-1 border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                <ArrowLeft size={11} /> Refazer
              </button>
            </div>

            {/* 3D Viewer */}
            <div className="mb-4 bg-white border border-[#e5d9c1] rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#e5d9c1] flex justify-between items-center">
                <span className="text-xs font-medium">Visualização 3D — {FORMATOS.find(f => f.id === formato)?.label}</span>
                <span className="text-xs text-[#58413c]">Arraste · Scroll</span>
              </div>
              <ShapePreview
                formato={formato as 'cilindro' | 'cubo'}
                diametro={dims.diametro}
                altura={dims.altura}
              />
            </div>

            {/* Parâmetros */}
            <div className="bg-white border border-[#e5d9c1] rounded-2xl p-4 mb-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-[#003223]" /> Parâmetros
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                {[
                  ['Ponteira', `Ø${ponteira} mm`],
                  ['Camada', `${layerHeight} mm`],
                  ['Camadas', `${Math.ceil(dims.altura / layerHeight)}`],
                  ['Velocidade', `${printSpeed} mm/s`],
                  ['Seringa', `${seringa}mL Ø${syringeSpec.diameter_mm}mm`],
                  ['Temperatura', temperatura ? `${temperatura}°C` : 'Ambiente'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-2.5">
                    <p className="text-[#58413c] mb-0.5">{label}</p>
                    <p className="font-semibold text-[#003223]">{val}</p>
                  </div>
                ))}
              </div>

              {/* E breakdown */}
              <div className="p-3 bg-[#003223]/5 border border-[#003223]/10 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-[#211b0c] mb-1">Fator de extrusão — deslocamento positivo</p>
                <p className="font-mono text-[#58413c]">
                  E/mm = (Ø{ponteira} / Ø{syringeSpec.diameter_mm})² = <span className="text-[#003223] font-semibold">{ePerMmTeorico.toFixed(6)}</span>
                </p>
                <p className="font-mono text-[#58413c]">
                  × calibração {fatorCalib}% = <span className="text-[#003223] font-bold">{ePerMmEfetivo.toFixed(6)}</span> mm pistão/mm percurso
                </p>
                <p className="text-[#58413c]">
                  Vel. pistão a {printSpeed}mm/s: <span className="font-mono">{pistonSpeedMmS(ponteira, syringeSpec.diameter_mm, printSpeed).toFixed(4)}</span> mm/s
                </p>
              </div>

              {/* Calibração ajustável no resultado */}
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium">Ajustar calibração</span>
                  <span className="text-xs font-mono font-semibold text-[#003223]">{fatorCalib}%</span>
                </div>
                <input type="range" min={70} max={130} value={fatorCalib}
                  onChange={e => { setFatorCalib(parseInt(e.target.value)); regenerarGCode() }}
                  className="w-full accent-[#003223]" />
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={exportarIni}
                  className="flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={11} /> PrusaSlicer (.ini)
                </button>
              </div>
            </div>

            {/* GCode */}
            <div className="bg-white border border-[#e5d9c1] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold">GCode</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowGcode(v => !v)}
                    className="text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2.5 py-1.5 rounded-md transition-colors">
                    {showGcode ? 'Ocultar' : 'Ver código'}
                  </button>
                  <button onClick={copiarGcode}
                    className="flex items-center gap-1 text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2.5 py-1.5 rounded-md transition-colors">
                    {copiado ? <CheckCheck size={11} className="text-green-500" /> : <Copy size={11} />}
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                  <button onClick={baixarGcode}
                    className="flex items-center gap-1 text-xs bg-[#003223] hover:bg-[#004d35] text-white px-3 py-1.5 rounded-md transition-colors">
                    <Download size={11} /> .gcode
                  </button>
                </div>
              </div>
              {showGcode ? (
                <pre className="text-xs text-[#58413c] bg-[#fff8f1] rounded-lg p-4 overflow-x-auto max-h-80 leading-relaxed font-mono">{gcode}</pre>
              ) : (
                <div className="text-xs text-[#58413c] bg-[#fff8f1] rounded-lg p-3 font-mono">
                  {gcode.split('\n').slice(0, 12).join('\n')}
                  <span className="text-[#bfc9c2] block mt-1">… {gcode.split('\n').length} linhas</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers UI reutilizáveis
// ---------------------------------------------------------------------------

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#211b0c] block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#58413c] mt-1">{hint}</p>}
    </div>
  )
}

function NumInput({ value, onChange, min, max, step, placeholder }: {
  value: string; onChange: (v: string) => void
  min?: number; max?: number; step?: string; placeholder?: string
}) {
  return (
    <input
      type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      className="w-36 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30"
    />
  )
}

function DimPreview({ formato, dims, massaG }: {
  formato: string
  dims: { diametro: number; altura: number }
  massaG: number | null
}) {
  const volCm3 = formato === 'cilindro'
    ? Math.PI * (dims.diametro / 2) ** 2 * dims.altura / 1000
    : dims.diametro ** 3 / 1000
  return (
    <div className="mt-5 p-3 bg-[#003223]/5 border border-[#003223]/10 rounded-xl flex flex-wrap gap-5 text-sm">
      <Stat label={formato === 'cubo' ? 'Aresta' : 'Diâmetro'} val={`${dims.diametro} mm`} />
      {formato !== 'cubo' && <Stat label="Altura" val={`${dims.altura} mm`} />}
      <Stat label="Volume est." val={`${volCm3.toFixed(1)} cm³`} />
      {massaG !== null && <Stat label="Massa est." val={`${massaG.toFixed(1)} g`} />}
    </div>
  )
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <p className="text-xs text-[#58413c]">{label}</p>
      <p className="font-semibold text-[#003223]">{val}</p>
    </div>
  )
}
