'use client'
import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
  ingredientes: Array<{ nome: string; percentual: number; funcao: string }>
  parametros: Record<string, unknown>
  tabela_nutri: Record<string, unknown> | null
  created_at: string
}

const TIPOS_EXPORTACAO = [
  { id: 'ficha_tecnica', label: 'Ficha Técnica', desc: 'Ingredientes, processo, parâmetros e tabela nutricional' },
  { id: 'pop', label: 'POP', desc: 'Procedimento Operacional Padrão para replicação do processo' },
]

export default function ExportarPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [selecionada, setSelecionada] = useState<string>('')
  const [tipo, setTipo] = useState('ficha_tecnica')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(data => setFormulacoes(data || []))
  }, [])

  async function exportar() {
    if (!selecionada) return
    setLoading(true)
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulacao_id: selecionada, tipo }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mia_${tipo}_${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <div className="h-full overflow-y-auto bg-morphe-dark">
      <div className="section-alt border-b border-border/60 px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Exportar documentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gere ficha técnica ou POP em PDF a partir das suas formulações.</p>
      </div>

      <div className="max-w-lg mx-auto px-8">
        {/* Selecionar formulação */}
        <div className="mb-6">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Formulação</label>
          <select
            value={selecionada}
            onChange={e => setSelecionada(e.target.value)}
            className="input-premium"
          >
            <option value="">Selecione uma formulação</option>
            {formulacoes.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
          {formulacoes.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Nenhuma formulação salva. <a href="/formular" className="text-morphe-orange hover:underline">Criar agora</a></p>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="mb-8">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-3">Tipo de documento</label>
          <div className="space-y-2">
            {TIPOS_EXPORTACAO.map(t => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  tipo === t.id
                    ? 'border-morphe-orange/50 bg-morphe-orange/8'
                    : 'card-depth hover:border-morphe-orange/30'
                }`}
                style={tipo === t.id ? {boxShadow:'0 0 16px rgba(250,85,40,0.1)'} : {}}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tipo === t.id ? 'bg-morphe-orange/15' : 'bg-morphe-dark'}`}>
                    <FileText size={13} className={tipo === t.id ? 'text-morphe-orange' : 'text-muted-foreground'} />
                  </div>
                  <span className="text-sm font-semibold">{t.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-9">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={exportar}
          disabled={!selecionada || loading}
          className="btn-glow w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <Download size={16} />
          {loading ? 'Gerando PDF...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  )
}
