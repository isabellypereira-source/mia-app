'use client'
import { useEffect, useState } from 'react'
import { SlidersHorizontal, Sparkles, Download, Copy, CheckCheck, Lock, Info } from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
  ingredientes: Array<{ nome: string; percentual: number; funcao: string }>
}

interface Parametros {
  velocidade_extrusao: string
  velocidade_impressao: string
  temperatura: string
  pressao: string
  altura_camada: string
  retraction: string
  flow_rate: string
  observacoes: string
}

const PONTEIRAS = [
  { value: '0.6', label: '0,6 mm', cor: 'bg-pink-400', corLabel: 'Rosa', desc: 'Alta resolução, ideal para pastas lisas sem granulometria', luerlock: true },
  { value: '0.8', label: '0,8 mm', cor: 'bg-emerald-400', corLabel: 'Verde esmeralda', desc: 'Alta resolução, ideal para pasta lisa sem granulometria', luerlock: true },
  { value: '1.2', label: '1,2 mm', cor: 'bg-gray-400', corLabel: 'Cinza', desc: 'Boa resolução, ideal para pastas lisas com baixa granulometria', luerlock: true },
  { value: '1.6', label: '1,6 mm', cor: 'bg-green-500', corLabel: 'Verde', desc: 'Uso geral, ideal para pastas lisas com granulometria média', luerlock: true },
  { value: '3.0', label: '3,0 mm', cor: 'bg-green-300', corLabel: 'Verde claro', desc: 'Ideal para pastas densas, fibrosas e muito granuladas', luerlock: true },
  { value: '3.2', label: '3,2 mm', cor: '', corLabel: '', desc: 'Ideal para pastas densas e fibrosas sem luerlock, similar à 3 mm', luerlock: false },
]

const RESOLUCOES = [
  { value: 'alta', label: 'Alta Definição', desc: 'Máximo detalhe e impressão mais lenta.', fator: 0.4 },
  { value: 'balanceado', label: 'Balanceado', desc: 'Equilíbrio entre detalhe e velocidade, recomendado para maioria.', fator: 0.5 },
  { value: 'otimizado', label: 'Otimizado', desc: 'Alta velocidade, menor definição.', fator: 0.65 },
]

const FORMATOS = [
  { value: 'cilindro', label: 'Cilindro', emoji: '🟤', desc: 'Formato padrão para testes de extrusão', pago: false, imagem: '/formatos/cilindro.png' },
  { value: 'cubo', label: 'Cubo', emoji: '🟫', desc: 'Ideal para avaliar estabilidade estrutural', pago: false, imagem: '/formatos/cubo.png' },
  { value: 'capivara', label: 'Capivara (Cookie)', emoji: '🦫', desc: 'Formato temático premium para cookies', pago: true, preco: 'R$ 9,90', imagem: '/formatos/capivara.png' },
  { value: 'tilapia', label: 'Filé de Tilápia', emoji: '🐟', desc: 'Análogo de peixe com textura estruturada', pago: true, preco: 'R$ 14,90', imagem: '/formatos/tilapia.png' },
  { value: 'coelho', label: 'Coelho', emoji: '🐰', desc: 'Formato festivo para produtos especiais', pago: true, preco: 'R$ 12,90', imagem: '/formatos/coelho.png' },
]

function calcularAlturaCamada(ponteira: string, resolucao: string): string {
  const p = parseFloat(ponteira)
  const res = RESOLUCOES.find(r => r.value === resolucao)
  const fator = res?.fator ?? 0.5
  return (p * fator).toFixed(2)
}

function analisarGranulometria(ingredientes: Array<{ nome: string }>, ponteira: string): { aviso: string | null; minNozzle: string } {
  if (!ingredientes || ingredientes.length === 0) return { aviso: null, minNozzle: '0.6' }
  const nomes = ingredientes.map(i => i.nome.toLowerCase())
  const temAcucar = nomes.some(n => n.includes('açúcar') || n.includes('acucar') || n.includes('sacarose') || n.includes('glucose'))
  const temGranulado = nomes.some(n => n.includes('granulado') || n.includes('integral') || n.includes('sementes') || n.includes('grão') || n.includes('fibra') || n.includes('farelo'))
  const temFarinha = nomes.some(n => n.includes('farinha') && !n.includes('fina'))

  if (temGranulado) return { aviso: 'Ingredientes com granulometria alta detectados. Recomendado ponteira ≥ 1,6 mm. Com boa solubilização, pode usar 1,2 mm.', minNozzle: '1.6' }
  if (temAcucar || temFarinha) return { aviso: 'Açúcar ou farinha detectados — podem cristalizar ou entupir. Ponteira mínima sugerida: 1,2 mm (cinza). Se bem solubilizado, 0,8 mm pode funcionar.', minNozzle: '1.2' }
  return { aviso: null, minNozzle: '0.6' }
}

const GCODE_TEMPLATE = `; G-code gerado pela MIA — Morphê Foods
; Formulação: {formulacao}
; Ponteira: {ponteira}mm | Camada: {camada}mm | Resolução: {resolucao}

G28 ; Home
G1 Z5 F3000

; --- Parâmetros ---
M221 S{flow}
G1 F{vel_imp}

; --- Impressão ---
G1 X10 Y10 Z{camada} F3000
G1 X60 Y10 E5 F{vel_ext}
G1 X60 Y60 E10
G1 X10 Y60 E15
G1 X10 Y10 E20
G1 Z{camada_2} F3000
; ... (continua conforme geometria)

M84 ; Desligar motores`

export default function ParametrosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [formulacaoId, setFormulacaoId] = useState('')
  const [ponteira, setPonteira] = useState('0.8')
  const [resolucao, setResolucao] = useState('otimizado')
  const [formato, setFormato] = useState('cilindro')
  const [calculando, setCalculando] = useState(false)
  const [parametros, setParametros] = useState<Parametros | null>(null)
  const [parametrosEditados, setParametrosEditados] = useState<Parametros | null>(null)
  const [gcode, setGcode] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [avisoGranulo, setAvisoGranulo] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(data => setFormulacoes(data || []))
  }, [])

  useEffect(() => {
    const form = formulacoes.find(f => f.id === formulacaoId)
    if (form) {
      const { aviso } = analisarGranulometria(form.ingredientes, ponteira)
      setAvisoGranulo(aviso)
    } else {
      setAvisoGranulo(null)
    }
  }, [formulacaoId, ponteira, formulacoes])

  function updateParam(key: keyof Parametros, value: string) {
    setParametrosEditados(prev => prev ? { ...prev, [key]: value } : null)
  }

  const params = parametrosEditados ?? parametros

  async function calcularParametros() {
    setCalculando(true)
    setParametros(null)
    setParametrosEditados(null)
    setGcode('')

    const form = formulacoes.find(f => f.id === formulacaoId)
    const altCamada = calcularAlturaCamada(ponteira, resolucao)
    const resLabel = RESOLUCOES.find(r => r.value === resolucao)?.label ?? resolucao
    const ingredientesStr = form ? form.ingredientes.map(i => `${i.nome} ${i.percentual}% (${i.funcao})`).join(', ') : 'não especificada'

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Sugira parâmetros de impressão 3D de alimentos para: ${ingredientesStr}. Ponteira: ${ponteira}mm, altura de camada: ${altCamada}mm (${resLabel}), formato: ${formato}. Responda APENAS JSON: {"velocidade_extrusao":"val","velocidade_impressao":"val","temperatura":"val","pressao":"val","altura_camada":"${altCamada}mm","retraction":"val","flow_rate":"val","observacoes":"texto"}`,
          }],
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
      }
      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      const parsed: Parametros = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        velocidade_extrusao: '600–900 mm/min', velocidade_impressao: '1000–1500 mm/min',
        temperatura: '20–25 °C', pressao: '2–4 bar', altura_camada: `${altCamada} mm`,
        retraction: '0.5–1 mm', flow_rate: '95–105%', observacoes: '',
      }
      setParametros(parsed)
      setParametrosEditados(parsed)

      const gc = GCODE_TEMPLATE
        .replace('{formulacao}', form?.nome ?? 'não informada')
        .replace(/{ponteira}/g, ponteira)
        .replace(/{camada}/g, altCamada)
        .replace('{camada_2}', String(parseFloat(altCamada) * 2))
        .replace('{resolucao}', resLabel)
        .replace('{flow}', parsed.flow_rate?.replace(/[^0-9]/g, '') || '100')
        .replace('{vel_imp}', parsed.velocidade_impressao?.replace(/[^0-9]/g, '') || '1200')
        .replace('{vel_ext}', parsed.velocidade_extrusao?.replace(/[^0-9]/g, '') || '800')
      setGcode(gc)
    } catch {
      const altCamadaFallback = calcularAlturaCamada(ponteira, resolucao)
      const fallback: Parametros = {
        velocidade_extrusao: '—', velocidade_impressao: '—', temperatura: '—',
        pressao: '—', altura_camada: `${altCamadaFallback} mm`, retraction: '—',
        flow_rate: '—', observacoes: 'Erro ao calcular. Verifique a conexão.',
      }
      setParametros(fallback)
      setParametrosEditados(fallback)
    }
    setCalculando(false)
  }

  async function baixarGcode() {
    const blob = new Blob([gcode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mia_${Date.now()}.gcode`; a.click()
    URL.revokeObjectURL(url)
  }

  async function copiarGcode() {
    await navigator.clipboard.writeText(gcode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function exportarPrusaSlicer() {
    if (!params) return
    const config = `[print]
layer_height = ${calcularAlturaCamada(ponteira, resolucao)}
perimeters = 2
fill_density = 20%
fill_pattern = rectilinear
print_speed = ${params.velocidade_impressao?.replace(/[^0-9]/g, '') || '30'}
first_layer_speed = 20

[printer]
nozzle_diameter = ${ponteira}
max_print_speed = 150

; Gerado por MIA — Morphê Foods
; Formulação: ${formulacoes.find(f => f.id === formulacaoId)?.nome ?? 'não informada'}
`
    const blob = new Blob([config], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `config_${formulacoes.find(f => f.id === formulacaoId)?.nome?.replace(/\s+/g, '_') ?? 'formulacao'}_${formato}.ini`; a.click()
    URL.revokeObjectURL(url)
  }

  const ponteiraSelecionada = PONTEIRAS.find(p => p.value === ponteira)
  const altCamada = calcularAlturaCamada(ponteira, resolucao)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Parâmetros de Impressão</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure sua impressão e receba parâmetros e G-code otimizados.</p>
        </div>

        {/* Formulação */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-1.5">Formulação</label>
          <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
            className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50">
            <option value="">Selecione uma formulação</option>
            {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {formulacoes.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Nenhuma formulação salva. <a href="/formular" className="text-morphe-orange hover:underline">Criar agora</a></p>
          )}
          {avisoGranulo && (
            <div className="mt-2 flex gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
              <Info size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300">{avisoGranulo}</p>
            </div>
          )}
        </div>

        {/* Ponteiras */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-2">Ponteira (nozzle) <span className="text-xs text-muted-foreground font-normal ml-1">— guia de cores para seringa c/luerlock</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PONTEIRAS.map(p => (
              <button key={p.value} onClick={() => setPonteira(p.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${ponteira === p.value ? 'border-morphe-orange/60 bg-morphe-orange/10' : 'border-border bg-morphe-dark-2 hover:border-morphe-orange/30'}`}>
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${p.cor}`} title={p.corLabel} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.label} <span className="text-xs text-muted-foreground font-normal">· {p.corLabel}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{p.desc}</p>
                  {!p.luerlock && <p className="text-xs text-morphe-orange">Sem luerlock</p>}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
            <Info size={11} className="flex-shrink-0 mt-0.5" />
            A granulometria depende dos ingredientes E do protocolo de solubilização. Com boa solubilização, a pasta fica lisa e permite usar ponteiras menores.
          </p>
        </div>

        {/* Resolução */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-2">Resolução <span className="text-xs text-muted-foreground font-normal ml-1">— altura de camada calculada automaticamente</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {RESOLUCOES.map(r => (
              <button key={r.value} onClick={() => setResolucao(r.value)}
                className={`p-3 rounded-xl border text-left transition-colors ${resolucao === r.value ? 'border-morphe-orange/60 bg-morphe-orange/10' : 'border-border bg-morphe-dark-2 hover:border-morphe-orange/30'}`}>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
          {ponteiraSelecionada && (
            <p className="text-xs text-morphe-orange mt-2">
              Altura de camada sugerida: <strong>{altCamada} mm</strong> (metade do diâmetro da ponteira {ponteiraSelecionada.label} × {RESOLUCOES.find(r => r.value === resolucao)?.fator})
            </p>
          )}
        </div>

        {/* Formato */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">Formato</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FORMATOS.map(f => (
              <div key={f.value} className="relative">
                {f.pago ? (
                  <a href={`/pagamento?formato=${f.value}`} target="_blank" rel="noopener noreferrer"
                    className="block p-3 rounded-xl border border-border bg-morphe-dark-2 opacity-50 cursor-pointer hover:opacity-70 transition-opacity">
                    <Lock size={11} className="absolute top-2 right-2 text-muted-foreground" />
                    {f.imagem && <img src={f.imagem} alt={f.label} className="w-full h-16 object-cover rounded mb-2" />}
                    <span className="text-xl mb-1 block">{f.emoji}</span>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    <p className="text-xs text-morphe-orange mt-1">{f.preco}</p>
                  </a>
                ) : (
                  <button onClick={() => setFormato(f.value)}
                    className={`w-full p-3 rounded-xl border text-left transition-colors ${
                      formato === f.value ? 'border-morphe-orange/60 bg-morphe-orange/10' : 'border-border bg-morphe-dark-2 hover:border-morphe-orange/30'
                    }`}>
                    {f.imagem && <img src={f.imagem} alt={f.label} className="w-full h-16 object-cover rounded mb-2" />}
                    <span className="text-xl mb-1 block">{f.emoji}</span>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={calcularParametros} disabled={calculando}
          className="flex items-center gap-2 bg-morphe-orange hover:bg-morphe-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mb-6">
          <Sparkles size={14} /> {calculando ? 'Calculando...' : 'Calcular parâmetros'}
        </button>

        {/* Resultados */}
        {params && (
          <div className="space-y-4">
            <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={15} className="text-morphe-orange" />
                <h2 className="text-sm font-medium">Parâmetros recomendados <span className="text-xs text-muted-foreground font-normal ml-1">(editáveis)</span></h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.entries({
                  'Vel. extrusão': 'velocidade_extrusao',
                  'Vel. impressão': 'velocidade_impressao',
                  'Temperatura': 'temperatura',
                  'Fator de extrusão': 'pressao',
                  'Altura camada': 'altura_camada',
                  'Retraction': 'retraction',
                  'Flow rate': 'flow_rate',
                }) as [string, keyof Parametros][]).map(([label, key]) => (
                  <div key={key} className="bg-morphe-dark border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <input value={params[key] ?? ''} onChange={e => updateParam(key, e.target.value)}
                      className="w-full text-sm font-semibold text-morphe-orange bg-transparent focus:outline-none focus:border-b focus:border-morphe-orange/50" />
                  </div>
                ))}
              </div>
              {params.observacoes && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{params.observacoes}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={exportarPrusaSlicer}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors">
                  <Download size={11} /> Abrir no PrusaSlicer (.ini)
                </button>
              </div>
            </div>

            {gcode && (
              <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium">G-code</h2>
                  <div className="flex gap-2">
                    <button onClick={copiarGcode}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-md transition-colors">
                      {copiado ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <button onClick={baixarGcode}
                      className="flex items-center gap-1.5 text-xs bg-morphe-orange hover:bg-morphe-orange-hover text-white px-2.5 py-1.5 rounded-md transition-colors">
                      <Download size={12} /> Baixar .gcode
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-muted-foreground bg-morphe-dark rounded-lg p-4 overflow-x-auto leading-relaxed font-mono">{gcode}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
