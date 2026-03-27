'use client'
import { useEffect, useState } from 'react'
import { SlidersHorizontal, Sparkles, Download, Copy, CheckCheck } from 'lucide-react'

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
  { value: '0.4', label: '0.4 mm — Alta resolução, pastas fluidas' },
  { value: '0.6', label: '0.6 mm — Uso geral' },
  { value: '0.8', label: '0.8 mm — Pastas densas / alta viscosidade' },
  { value: '1.0', label: '1.0 mm — Formulações muito viscosas / géis' },
  { value: '1.5', label: '1.5 mm — Materiais fibrosos ou granulados' },
]

const RESOLUCOES = [
  { value: '0.1', label: '0.1 mm — Muito fina (lenta)' },
  { value: '0.15', label: '0.15 mm — Fina' },
  { value: '0.2', label: '0.2 mm — Padrão' },
  { value: '0.3', label: '0.3 mm — Grossa (rápida)' },
]

const FORMATOS_STL = [
  { value: 'cilindro', label: 'Cilindro' },
  { value: 'cubo', label: 'Cubo' },
  { value: 'honeycomb', label: 'Honeycomb (colmeia)' },
  { value: 'personalizado', label: 'STL personalizado (upload)' },
]

const GCODE_EXEMPLO = `; G-code gerado pela MIA — Morphê Foods
; Formulação: {formulacao}
; Ponteira: {ponteira}mm | Camada: {camada}mm

G28 ; Home
G1 Z5 F3000 ; Subir

; --- Parâmetros de extrusão ---
M221 S{flow} ; Flow rate
G1 F{vel_imp} ; Velocidade de impressão

; --- Início da impressão ---
G1 X10 Y10 Z0.2 F3000
G1 X50 Y10 E5 F{vel_ext}
G1 X50 Y50 E10
G1 X10 Y50 E15
G1 X10 Y10 E20

G1 Z{camada} F3000 ; Nova camada
; ... (continua conforme geometria do STL)

M84 ; Desligar motores`

export default function ParametrosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [formulacaoId, setFormulacaoId] = useState('')
  const [ponteira, setPonteira] = useState('0.6')
  const [resolucao, setResolucao] = useState('0.2')
  const [formato, setFormato] = useState('cilindro')
  const [calculando, setCalculando] = useState(false)
  const [parametros, setParametros] = useState<Parametros | null>(null)
  const [gcode, setGcode] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes')
      .then(r => r.json())
      .then(data => setFormulacoes(data || []))
  }, [])

  async function calcularParametros() {
    setCalculando(true)
    setParametros(null)
    setGcode('')

    const form = formulacoes.find(f => f.id === formulacaoId)
    const ingredientesStr = form
      ? form.ingredientes.map(i => `${i.nome} ${i.percentual}% (${i.funcao})`).join(', ')
      : 'não especificada'

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Sugira parâmetros de impressão 3D de alimentos para esta formulação: ${ingredientesStr}. Ponteira: ${ponteira}mm, altura de camada: ${resolucao}mm, formato: ${formato}. Responda APENAS com JSON no formato: {"velocidade_extrusao":"valor","velocidade_impressao":"valor","temperatura":"valor","pressao":"valor","altura_camada":"${resolucao}mm","retraction":"valor","flow_rate":"valor","observacoes":"texto curto"}`,
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
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try { texto += JSON.parse(line.slice(2)) } catch { /* skip */ }
            }
          }
        }
      }

      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Parametros
        setParametros(parsed)

        const gc = GCODE_EXEMPLO
          .replace('{formulacao}', form?.nome ?? 'não informada')
          .replace(/{ponteira}/g, ponteira)
          .replace(/{camada}/g, resolucao)
          .replace('{flow}', parsed.flow_rate?.replace(/[^0-9]/g, '') || '100')
          .replace('{vel_imp}', parsed.velocidade_impressao?.replace(/[^0-9]/g, '') || '1200')
          .replace('{vel_ext}', parsed.velocidade_extrusao?.replace(/[^0-9]/g, '') || '800')
        setGcode(gc)
      } else {
        setParametros({
          velocidade_extrusao: '600–900 mm/min',
          velocidade_impressao: '1000–1500 mm/min',
          temperatura: '20–25 °C (ambiente)',
          pressao: '2–4 bar',
          altura_camada: `${resolucao} mm`,
          retraction: '0.5–1 mm',
          flow_rate: '95–105%',
          observacoes: texto.slice(0, 200),
        })
      }
    } catch {
      setParametros({
        velocidade_extrusao: '—',
        velocidade_impressao: '—',
        temperatura: '—',
        pressao: '—',
        altura_camada: `${resolucao} mm`,
        retraction: '—',
        flow_rate: '—',
        observacoes: 'Erro ao calcular. Verifique a conexão.',
      })
    }

    setCalculando(false)
  }

  async function baixarGcode() {
    const blob = new Blob([gcode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mia_${Date.now()}.gcode`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copiarGcode() {
    await navigator.clipboard.writeText(gcode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Parâmetros de Impressão</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione a formulação e as configurações para receber os parâmetros e G-code.
          </p>
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium block mb-1.5">Formulação</label>
            <select
              value={formulacaoId}
              onChange={e => setFormulacaoId(e.target.value)}
              className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
            >
              <option value="">Selecione uma formulação</option>
              {formulacoes.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
            {formulacoes.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Nenhuma formulação salva.{' '}
                <a href="/formular" className="text-morphe-orange hover:underline">Criar agora</a>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Ponteira (nozzle)</label>
            <select
              value={ponteira}
              onChange={e => setPonteira(e.target.value)}
              className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
            >
              {PONTEIRAS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Resolução (altura de camada)</label>
            <select
              value={resolucao}
              onChange={e => setResolucao(e.target.value)}
              className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
            >
              {RESOLUCOES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Formato / STL</label>
            <select
              value={formato}
              onChange={e => setFormato(e.target.value)}
              className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50"
            >
              {FORMATOS_STL.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={calcularParametros}
          disabled={calculando}
          className="flex items-center gap-2 bg-morphe-orange hover:bg-morphe-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mb-6"
        >
          <Sparkles size={14} />
          {calculando ? 'Calculando...' : 'Calcular parâmetros'}
        </button>

        {/* Resultados */}
        {parametros && (
          <div className="space-y-4">
            <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={15} className="text-morphe-orange" />
                <h2 className="text-sm font-medium">Parâmetros recomendados</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Vel. extrusão', value: parametros.velocidade_extrusao },
                  { label: 'Vel. impressão', value: parametros.velocidade_impressao },
                  { label: 'Temperatura', value: parametros.temperatura },
                  { label: 'Pressão', value: parametros.pressao },
                  { label: 'Altura camada', value: parametros.altura_camada },
                  { label: 'Retraction', value: parametros.retraction },
                  { label: 'Flow rate', value: parametros.flow_rate },
                ].map(item => (
                  <div key={item.label} className="bg-morphe-dark border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-morphe-orange">{item.value}</p>
                  </div>
                ))}
              </div>
              {parametros.observacoes && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{parametros.observacoes}</p>
              )}
            </div>

            {gcode && (
              <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium">G-code</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={copiarGcode}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      {copiado ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
                      {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                      onClick={baixarGcode}
                      className="flex items-center gap-1.5 text-xs bg-morphe-orange hover:bg-morphe-orange-hover text-white px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      <Download size={12} /> Baixar .gcode
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-muted-foreground bg-morphe-dark rounded-lg p-4 overflow-x-auto leading-relaxed font-mono">
                  {gcode}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
