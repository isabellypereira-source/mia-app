'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, ArrowRight, CheckCircle, Copy, CheckCheck,
  Download, Sparkles, SlidersHorizontal, Info,
} from 'lucide-react'
import {
  SYRINGES, MACHINES, calcEPerMm, massToVolumeMm3, caloriesToMassG,
  cylinderDimsFromVolume, cubeSideFromVolume, type MachineId,
} from '@/lib/parametros/extrusion'
import { generateGCode, type GCodeConfig } from '@/lib/parametros/gcode'

const ShapePreview = dynamic(
  () => import('@/components/parametros/ShapePreview'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[280px] text-xs text-[#58413c]">Carregando…</div> },
)

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

type Passo = 'formato' | 'tamanho' | 'seringa' | 'ponteira' | 'qualidade' | 'ajustes' | 'resultado'
const PASSOS: Passo[] = ['formato', 'tamanho', 'seringa', 'ponteira', 'qualidade', 'ajustes', 'resultado']
const PASSO_LABEL: Record<Passo, string> = {
  formato: 'Formato', tamanho: 'Tamanho', seringa: 'Seringa',
  ponteira: 'Ponteira', qualidade: 'Qualidade', ajustes: 'Ajustes', resultado: 'Resultado',
}

const FORMATOS = [
  { id: 'cilindro',    label: 'Cilindro',        emoji: '🟤', desc: 'Teste padrão de extrusão',        pago: false, stl: null          },
  { id: 'cubo',        label: 'Cubo',             emoji: '🟫', desc: 'Teste de estabilidade estrutural', pago: false, stl: null          },
  { id: 'coracao',     label: 'Coração',          emoji: '🩷', desc: 'Clássico, para produtos especiais', pago: true, preco: 'R$ 9,90',  stl: '/stl/coracao.stl'     },
  { id: 'estrela',     label: 'Estrela',          emoji: '⭐', desc: 'Decorativo e festivo',             pago: true, preco: 'R$ 9,90',  stl: '/stl/estrela.stl'     },
  { id: 'tilapia',     label: 'Filé de Tilápia',  emoji: '🐟', desc: 'Análogo de peixe estruturado',    pago: true, preco: 'R$ 14,90', stl: '/stl/tilapia.stl'     },
  { id: 'flor-lotus',  label: 'Flor de Lótus',   emoji: '🌸', desc: 'Alta resolução, look premium',     pago: true, preco: 'R$ 12,90', stl: '/stl/flor-lotus.stl'  },
  { id: 'mandala',     label: 'Mandala',          emoji: '🔮', desc: 'Detalhe fino, ideal para cookies', pago: true, preco: 'R$ 12,90', stl: '/stl/mandala.stl'     },
  { id: 'arabesco',    label: 'Arabesco',         emoji: '🌀', desc: 'Padrão geométrico elegante',       pago: true, preco: 'R$ 12,90', stl: '/stl/arabesco.stl'    },
  { id: 'croissant',   label: 'Croissant',        emoji: '🥐', desc: 'Formato de panificação',           pago: true, preco: 'R$ 9,90',  stl: '/stl/croissant.stl'   },
  { id: 'cogumelo',    label: 'Cogumelo',         emoji: '🍄', desc: 'Formato temático fofo',            pago: true, preco: 'R$ 9,90',  stl: '/stl/cogumelo.stl'    },
  { id: 'snoopy',      label: 'Snoopy',           emoji: '🐾', desc: 'Personagem icônico',               pago: true, preco: 'R$ 9,90',  stl: '/stl/snoopy.stl'      },
  { id: 'stitch',      label: 'Stitch',           emoji: '💙', desc: 'Personagem favorito',              pago: true, preco: 'R$ 9,90',  stl: '/stl/stitch.stl'      },
  { id: 'pacman',      label: 'Pac-Man',          emoji: '🎮', desc: 'Clássico dos games',               pago: true, preco: 'R$ 9,90',  stl: '/stl/pacman.stl'      },
  { id: 'gatinho',     label: 'Gatinho',          emoji: '🐱', desc: 'Fofura garantida',                 pago: true, preco: 'R$ 9,90',  stl: '/stl/gatinho.stl'     },
  { id: 'boneco-neve', label: 'Boneco de Neve',   emoji: '⛄', desc: 'Temático natalino',                pago: true, preco: 'R$ 9,90',  stl: '/stl/boneco-neve.stl' },
  { id: 'crocodilo',   label: 'Crocodilo',        emoji: '🐊', desc: 'Detalhe de escamas',               pago: true, preco: 'R$ 12,90', stl: '/stl/crocodilo.stl'   },
  { id: 'mandala2',    label: 'Mandala II',       emoji: '🌐', desc: 'Variação de mandala mais densa',   pago: true, preco: 'R$ 12,90', stl: '/stl/mandala2.stl'    },
] as const

const PONTEIRAS = [
  { value: 0.6, label: '0,6 mm', cor: 'bg-pink-400',    corLabel: 'Rosa',          luerlock: true },
  { value: 0.8, label: '0,8 mm', cor: 'bg-emerald-400', corLabel: 'Verde-esmeralda', luerlock: true },
  { value: 1.2, label: '1,2 mm', cor: 'bg-gray-400',    corLabel: 'Cinza',         luerlock: true },
  { value: 1.6, label: '1,6 mm', cor: 'bg-green-500',   corLabel: 'Verde',         luerlock: true },
  { value: 3.0, label: '3,0 mm', cor: 'bg-green-300',   corLabel: 'Verde claro',   luerlock: true },
  { value: 3.2, label: '3,2 mm', cor: 'bg-gray-200',    corLabel: '—',             luerlock: false },
]

// Sugestão de ponteira por tipo de pasta
const TIPOS_PASTA = [
  { id: 'lisa',      label: 'Lisa / purê / gel',          ponteira: 0.8,  emoji: '✨', dica: 'Pasta lisa e homogênea — use 0,8 mm (verde-esmeralda) para boa resolução.' },
  { id: 'amido',     label: 'Com amido ou açúcar',         ponteira: 1.2,  emoji: '🌾', dica: 'Amido e açúcar podem cristalizar. Use 1,2 mm (cinza) para evitar entupimento.' },
  { id: 'fibras',    label: 'Com fibras ou farinha',       ponteira: 1.6,  emoji: '🌿', dica: 'Fibras e farinhas exigem abertura maior. Use 1,6 mm (verde).' },
  { id: 'densa',     label: 'Muito densa ou granulada',    ponteira: 3.0,  emoji: '🪨', dica: 'Pastas densas, fibrosas ou com pedaços visíveis. Use 3,0 mm (verde claro).' },
  { id: 'proteina',  label: 'Base proteica (carne/peixe)', ponteira: 1.6,  emoji: '🥩', dica: 'Análogos de proteína animal tendem a ter fibras. Use 1,6 mm (verde).' },
  { id: 'outro',     label: 'Não sei ainda',               ponteira: null, emoji: '🤔', dica: 'Faça um teste com 1,2 mm — é o ponto médio mais seguro.' },
]

const QUALIDADES = [
  { id: 'fina',    label: 'Fina',   desc: 'Máximo detalhe. Mais lenta.',        fator: 0.4,  velDesc: 'lenta'  },
  { id: 'normal',  label: 'Normal', desc: 'Bom detalhe. Velocidade equilibrada.', fator: 0.5,  velDesc: 'média'  },
  { id: 'rapida',  label: 'Rápida', desc: 'Menos detalhe. Mais produtiva.',      fator: 0.65, velDesc: 'rápida' },
]

interface Formulacao { id: string; nome: string }

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function ParametrosPage() {
  const [passo, setPasso] = useState<Passo>('formato')

  const [formato, setFormato] = useState('cilindro')
  const [tamanhoMode, setTamanhoMode] = useState<'massa' | 'calorias' | 'manual'>('massa')
  const [massa, setMassa] = useState('100')
  const [calorias, setCalorias] = useState('200')
  const [kcalPer100g, setKcalPer100g] = useState('200')
  const [densidade, setDensidade] = useState('1.0')
  const [manualDiam, setManualDiam] = useState('40')
  const [manualAltura, setManualAltura] = useState('40')
  const [manualLado, setManualLado] = useState('40')
  const [machine, setMachine] = useState<MachineId>('bioender_pro')
  const [seringa, setSeringa] = useState<10 | 60>(10)
  const [tipoPasta, setTipoPasta] = useState('')
  const [ponteira, setPonteira] = useState(0.8)
  const [qualidade, setQualidade] = useState('normal')
  const [formulacaoId, setFormulacaoId] = useState('')
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [temperatura, setTemperatura] = useState('')
  const [ajusteFluxo, setAjusteFluxo] = useState(0)   // -30 a +30, default 0

  const [gcode, setGcode] = useState('')
  const [showGcode, setShowGcode] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
  }, [])

  // Aplica sugestão de ponteira quando tipo de pasta é selecionado
  useEffect(() => {
    const tipo = TIPOS_PASTA.find(t => t.id === tipoPasta)
    if (tipo?.ponteira) setPonteira(tipo.ponteira)
  }, [tipoPasta])

  // ---------------------------------------------------------------------------
  // Cálculos
  // ---------------------------------------------------------------------------

  function getDims() {
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
  const qualSpec = QUALIDADES.find(q => q.id === qualidade)!
  const layerHeight = parseFloat((ponteira * qualSpec.fator).toFixed(2))
  const printSpeed = qualidade === 'fina' ? 8 : qualidade === 'normal' ? 15 : 22
  const fatorCalib = 100 + ajusteFluxo
  const ePerMm = calcEPerMm(ponteira, syringeSpec.diameter_mm) * (fatorCalib / 100)
  const formulacaoNome = formulacoes.find(f => f.id === formulacaoId)?.nome ?? 'Sem formulação'
  const formatoSpec = FORMATOS.find(f => f.id === formato)

  const passoIdx = PASSOS.indexOf(passo)

  // ---------------------------------------------------------------------------
  // Ações
  // ---------------------------------------------------------------------------

  function avancar() {
    if (passo === 'ajustes') { gerarResultado(); return }
    setPasso(PASSOS[passoIdx + 1])
    window.scrollTo(0, 0)
  }
  function voltar() {
    if (passoIdx > 0) { setPasso(PASSOS[passoIdx - 1]); window.scrollTo(0, 0) }
  }

  function gerarResultado() {
    const cfg: GCodeConfig = {
      formulacao_nome: formulacaoNome,
      formato: (formato === 'cilindro' || formato === 'cubo') ? formato : 'cilindro',
      seringa_ml: seringa,
      ponteira_mm: ponteira,
      layer_height_mm: layerHeight,
      print_speed_mm_s: printSpeed,
      fator_calibracao: fatorCalib,
      temperatura_c: temperatura ? parseFloat(temperatura) : null,
      diametro_mm: dims.diametro,
      altura_mm: dims.altura,
    }
    setGcode(generateGCode(cfg))
    setPasso('resultado')
    window.scrollTo(0, 0)
  }

  function download(content: string, filename: string, type = 'text/plain') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
  }

  function baixarGcode() { download(gcode, `mia_${formulacaoNome.replace(/\s+/g, '_')}_${formato}.gcode`) }

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
      `; MIA — Morphê Foods`,
      `; Formulação: ${formulacaoNome}`,
      `; Máquina: ${MACHINES.find(m => m.id === machine)?.label}`,
      `; Seringa: ${seringa}mL | E/mm: ${ePerMm.toFixed(6)}`,
    ].join('\n')
    download(ini, `mia_${formulacaoNome.replace(/\s+/g, '_')}.ini`)
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
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${done ? 'bg-[#003223] text-white' : active ? 'bg-[#003223] text-white' : 'bg-[#e5d9c1] text-[#bfc9c2]'}`}>
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
          {passo === 'ajustes' ? <><Sparkles size={14} /> Gerar</> : <>Próximo <ArrowRight size={14} /></>}
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

        {/* ── 1. Formato ── */}
        {passo === 'formato' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual é o formato da peça?</h2>
            <p className="text-xs text-[#58413c] mb-5">Escolha o formato da sua peça. Cilindro e Cubo são paramétricos; os demais carregam modelos 3D.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORMATOS.map(f => (
                <div key={f.id} className="relative">
                  <button onClick={() => setFormato(f.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all h-full ${formato === f.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <span className="text-xl mb-1.5 block">{f.emoji}</span>
                    <p className="text-xs font-medium leading-tight">{f.label}</p>
                    <p className="text-[10px] text-[#58413c] mt-0.5">{f.desc}</p>
                  </button>
                </div>
              ))}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 2. Tamanho ── */}
        {passo === 'tamanho' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual o tamanho da peça?</h2>
            <p className="text-xs text-[#58413c] mb-5">Você pode definir pelo peso, pelas calorias, ou inserir o tamanho diretamente.</p>

            <div className="flex gap-1 mb-5 p-1 bg-[#fff2da] rounded-xl w-fit">
              {(['massa', 'calorias', 'manual'] as const).map(m => (
                <button key={m} onClick={() => setTamanhoMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tamanhoMode === m ? 'bg-[#003223] text-white' : 'text-[#58413c] hover:bg-[#e5d9c1]/60'}`}>
                  {m === 'massa' ? 'Pelo peso' : m === 'calorias' ? 'Pelas calorias' : 'Tamanho direto'}
                </button>
              ))}
            </div>

            {tamanhoMode === 'massa' && (
              <div className="space-y-4">
                <Field label="Quanto pesa a peça? (gramas)">
                  <NumInput value={massa} onChange={setMassa} min={1} />
                </Field>
                <Field label="Densidade da pasta" hint="Maioria das pastas alimentares: deixe em 1,0.">
                  <div className="flex items-center gap-2">
                    <NumInput value={densidade} onChange={setDensidade} step="0.1" min={0.5} max={2} />
                    <span className="text-xs text-[#58413c]">g/cm³</span>
                  </div>
                </Field>
              </div>
            )}

            {tamanhoMode === 'calorias' && (
              <div className="space-y-4">
                <Field label="Quantas calorias deve ter a peça?">
                  <div className="flex items-center gap-2">
                    <NumInput value={calorias} onChange={setCalorias} min={10} />
                    <span className="text-xs text-[#58413c]">kcal</span>
                  </div>
                </Field>
                <Field label="Calorias da sua formulação (por 100g)" hint="Veja na tabela nutricional da formulação.">
                  <div className="flex items-center gap-2">
                    <NumInput value={kcalPer100g} onChange={setKcalPer100g} min={10} />
                    <span className="text-xs text-[#58413c]">kcal/100g</span>
                  </div>
                </Field>
                <Field label="Densidade da pasta">
                  <div className="flex items-center gap-2">
                    <NumInput value={densidade} onChange={setDensidade} step="0.1" min={0.5} />
                    <span className="text-xs text-[#58413c]">g/cm³</span>
                  </div>
                </Field>
              </div>
            )}

            {tamanhoMode === 'manual' && (
              <div className="space-y-4">
                {formato === 'cubo' ? (
                  <Field label="Tamanho do lado (mm)">
                    <NumInput value={manualLado} onChange={setManualLado} min={5} />
                  </Field>
                ) : (
                  <div className="flex gap-4">
                    <Field label="Largura (mm)">
                      <NumInput value={manualDiam} onChange={setManualDiam} min={5} />
                    </Field>
                    <Field label="Altura (mm)">
                      <NumInput value={manualAltura} onChange={setManualAltura} min={5} />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="mt-5 p-3 bg-[#003223]/5 border border-[#003223]/10 rounded-xl flex flex-wrap gap-5 text-sm">
              <Stat label={formato === 'cubo' ? 'Lado' : 'Largura'} val={`${dims.diametro} mm`} />
              {formato !== 'cubo' && <Stat label="Altura" val={`${dims.altura} mm`} />}
              <Stat label="Volume" val={`${(formato === 'cilindro' ? Math.PI * (dims.diametro / 2) ** 2 * dims.altura / 1000 : dims.diametro ** 3 / 1000).toFixed(1)} cm³`} />
              {tamanhoMode !== 'manual' && (
                <Stat label="Peso"
                  val={`${(tamanhoMode === 'massa' ? parseFloat(massa) : caloriesToMassG(parseFloat(calorias) || 200, parseFloat(kcalPer100g) || 200)).toFixed(1)} g`}
                />
              )}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 3. Seringa + Máquina ── */}
        {passo === 'seringa' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual o seu equipamento?</h2>
            <p className="text-xs text-[#58413c] mb-5">Selecione sua impressora e a seringa que está montada.</p>

            <div className="mb-5">
              <p className="text-xs font-medium text-[#211b0c] mb-2">Impressora</p>
              <div className="grid grid-cols-2 gap-2">
                {MACHINES.map(m => (
                  <button key={m.id} onClick={() => setMachine(m.id as MachineId)}
                    className={`p-3 rounded-xl border text-left transition-all ${machine === m.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-[#58413c] mt-0.5">Morphê Food Printer</p>
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
                    <p className="text-2xl font-bold text-[#003223] mb-1">{s.volume_ml}<span className="text-sm font-normal ml-0.5">mL</span></p>
                    <p className="text-xs text-[#58413c]">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 4. Ponteira ── */}
        {passo === 'ponteira' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual ponteira você vai usar?</h2>
            <p className="text-xs text-[#58413c] mb-5">As cores correspondem às tampas coloridas das seringas com luerlock.</p>

            {/* Sugestão da MIA */}
            <div className="mb-5 p-3 bg-[#003223]/5 border border-[#003223]/10 rounded-xl">
              <p className="text-xs font-semibold text-[#003223] mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Sugestão da MIA — como é sua pasta?
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TIPOS_PASTA.map(t => (
                  <button key={t.id} onClick={() => setTipoPasta(t.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${tipoPasta === t.id ? 'bg-[#003223] text-white' : 'bg-white border border-[#e5d9c1] text-[#58413c] hover:border-[#003223]/30'}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
              {tipoPasta && (
                <div className="flex gap-1.5 mt-2">
                  <Info size={12} className="text-[#003223] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#003223]">
                    {TIPOS_PASTA.find(t => t.id === tipoPasta)?.dica}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PONTEIRAS.map(p => {
                const sugerida = TIPOS_PASTA.find(t => t.id === tipoPasta)?.ponteira === p.value
                return (
                  <button key={p.value} onClick={() => setPonteira(p.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${ponteira === p.value ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${p.cor}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{p.label} <span className="text-xs text-[#58413c] font-normal">· {p.corLabel}</span></p>
                        {sugerida && <span className="text-[10px] bg-[#003223] text-white px-1.5 py-0.5 rounded-full">sugerida</span>}
                      </div>
                      {!p.luerlock && <p className="text-xs text-amber-600 mt-0.5">Sem luerlock</p>}
                    </div>
                  </button>
                )
              })}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 5. Qualidade ── */}
        {passo === 'qualidade' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Qual a qualidade de impressão?</h2>
            <p className="text-xs text-[#58413c] mb-5">Quanto mais fina, mais detalhada e mais lenta.</p>
            <div className="grid grid-cols-3 gap-3">
              {QUALIDADES.map(q => {
                const lh = parseFloat((ponteira * q.fator).toFixed(2))
                return (
                  <button key={q.id} onClick={() => setQualidade(q.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${qualidade === q.id ? 'border-[#003223] bg-[rgba(0,50,35,0.06)] ring-1 ring-[#003223]/20' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#003223]/30'}`}>
                    <p className="text-sm font-semibold">{q.label}</p>
                    <p className="text-xs text-[#58413c] mt-0.5 mb-2">{q.desc}</p>
                    <div className="border-t border-[#e5d9c1] pt-2 text-xs">
                      <p className="text-[#003223] font-medium">Camada: {lh} mm</p>
                      <p className="text-[#58413c]">Velocidade {q.velDesc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <NavButtons />
          </div>
        )}

        {/* ── 6. Ajustes finais ── */}
        {passo === 'ajustes' && (
          <div>
            <h2 className="text-base font-semibold mb-1">Ajustes finais</h2>
            <p className="text-xs text-[#58413c] mb-5">Opcionais — vincule sua formulação e ajuste conforme necessário.</p>

            <div className="mb-5">
              <label className="text-xs font-medium text-[#211b0c] block mb-1.5">Formulação (opcional)</label>
              <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
                className="w-full bg-white border border-[#e5d9c1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30">
                <option value="">Sem formulação (teste de parâmetros)</option>
                {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-[#211b0c] block mb-1.5">Temperatura (opcional)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={temperatura} onChange={e => setTemperatura(e.target.value)}
                  placeholder="ex: 60"
                  className="w-28 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
                <span className="text-xs text-[#58413c]">°C — vazio = temperatura ambiente</span>
              </div>
            </div>

            {/* Ajuste de fluxo — explicação simples */}
            <div className="mb-5 p-4 bg-white border border-[#e5d9c1] rounded-xl">
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#211b0c]">Ajuste de fluxo</label>
                <span className={`text-xs font-semibold ${ajusteFluxo === 0 ? 'text-[#58413c]' : ajusteFluxo < 0 ? 'text-amber-600' : 'text-[#003223]'}`}>
                  {ajusteFluxo === 0 ? 'Padrão' : ajusteFluxo > 0 ? `+${ajusteFluxo}% material` : `${ajusteFluxo}% material`}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-[#58413c] w-16 text-right">Menos</span>
                <input type="range" min={-30} max={30} step={5} value={ajusteFluxo}
                  onChange={e => setAjusteFluxo(parseInt(e.target.value))}
                  className="flex-1 accent-[#003223]" />
                <span className="text-[10px] text-[#58413c] w-12">Mais</span>
              </div>
              <p className="text-xs text-[#58413c] flex gap-1.5">
                <Info size={11} className="flex-shrink-0 mt-0.5" />
                A pasta saiu em excesso? Arraste para esquerda. Faltou material na peça? Arraste para direita. Dexe no centro para o cálculo padrão.
              </p>
            </div>

            {/* Resumo */}
            <div className="p-4 bg-white border border-[#e5d9c1] rounded-xl text-xs">
              <p className="font-semibold mb-2.5">Resumo antes de gerar</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  ['Formato', formatoSpec?.label ?? formato],
                  ['Dimensões', `${dims.diametro} × ${dims.altura} mm`],
                  ['Impressora', MACHINES.find(m => m.id === machine)?.label ?? '—'],
                  ['Seringa', `${seringa} mL`],
                  ['Ponteira', `${ponteira} mm`],
                  ['Camada', `${layerHeight} mm (${qualSpec.label})`],
                ].map(([k, v]) => (
                  <><span key={`k-${k}`} className="text-[#58413c]">{k}</span><span key={`v-${k}`} className="font-medium">{v}</span></>
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
                <h2 className="text-base font-semibold">Pronto! ✓</h2>
                <p className="text-xs text-[#58413c]">{formulacaoNome} · {formatoSpec?.label} {dims.diametro}×{dims.altura}mm</p>
              </div>
              <button onClick={() => setPasso('formato')}
                className="text-xs text-[#58413c] hover:text-[#211b0c] flex items-center gap-1 border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                <ArrowLeft size={11} /> Refazer
              </button>
            </div>

            {/* Viewer 3D */}
            <div className="mb-4 bg-white border border-[#e5d9c1] rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#e5d9c1] flex justify-between items-center">
                <span className="text-xs font-medium">Visualização 3D — {formatoSpec?.label}</span>
                <span className="text-xs text-[#58413c]">Arraste · Scroll</span>
              </div>
              <ShapePreview
                formato={formato as 'cilindro' | 'cubo'}
                diametro={dims.diametro}
                altura={dims.altura}
                stlPath={formatoSpec?.stl ?? undefined}
              />
            </div>

            {/* Parâmetros — só o que importa */}
            <div className="bg-white border border-[#e5d9c1] rounded-2xl p-4 mb-4">
              <h3 className="text-xs font-semibold mb-3">Parâmetros configurados</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  ['Ponteira', `${ponteira} mm`],
                  ['Altura de camada', `${layerHeight} mm`],
                  ['Total de camadas', `${Math.ceil(dims.altura / layerHeight)}`],
                  ['Velocidade', qualSpec.label],
                  ['Seringa', `${seringa} mL`],
                  ['Temperatura', temperatura ? `${temperatura}°C` : 'Ambiente'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-2.5">
                    <p className="text-[#58413c] mb-0.5">{label}</p>
                    <p className="font-semibold text-[#003223]">{val}</p>
                  </div>
                ))}
              </div>

              {ajusteFluxo !== 0 && (
                <p className="text-xs text-[#58413c] mt-3 flex gap-1.5">
                  <Info size={11} className="flex-shrink-0 mt-0.5" />
                  Ajuste de fluxo aplicado: {ajusteFluxo > 0 ? `+${ajusteFluxo}%` : `${ajusteFluxo}%`}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={exportarIni}
                  className="flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-3 py-1.5 rounded-lg transition-colors">
                  <Download size={11} /> Config PrusaSlicer (.ini)
                </button>
              </div>
            </div>

            {/* GCode */}
            <div className="bg-white border border-[#e5d9c1] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold">GCode gerado</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowGcode(v => !v)}
                    className="text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2.5 py-1.5 rounded-md transition-colors">
                    {showGcode ? 'Ocultar' : 'Ver código'}
                  </button>
                  <button onClick={copiarGcode}
                    className="flex items-center gap-1 text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2.5 py-1.5 rounded-md transition-colors">
                    {copiado ? <CheckCheck size={11} className="text-green-500" /> : <Copy size={11} />}
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button onClick={baixarGcode}
                    className="flex items-center gap-1 text-xs bg-[#003223] hover:bg-[#004d35] text-white px-3 py-1.5 rounded-md transition-colors">
                    <Download size={11} /> Baixar .gcode
                  </button>
                </div>
              </div>
              {showGcode ? (
                <pre className="text-xs text-[#58413c] bg-[#fff8f1] rounded-lg p-4 overflow-x-auto max-h-80 font-mono leading-relaxed">{gcode}</pre>
              ) : (
                <div className="text-xs text-[#58413c] bg-[#fff8f1] rounded-lg p-3 font-mono">
                  {gcode.split('\n').slice(0, 8).join('\n')}
                  <span className="text-[#bfc9c2] block mt-1">… {gcode.split('\n').length} linhas — clique "Ver código" para expandir</span>
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
// Helpers
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
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      className="w-36 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30"
    />
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
