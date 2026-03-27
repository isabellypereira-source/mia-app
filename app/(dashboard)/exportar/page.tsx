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
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-1">Exportar documentos</h1>
        <p className="text-sm text-muted-foreground mb-8">Gere ficha técnica ou POP em PDF a partir das suas formulações.</p>

        {/* Selecionar formulação */}
        <div className="mb-6">
          <label className="text-sm font-medium block mb-2">Formulação</label>
          <select
            value={selecionada}
            onChange={e => setSelecionada(e.target.value)}
            className="w-full bg-morphe-dark-2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green"
          >
            <option value="">Selecione uma formulação</option>
            {formulacoes.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
          {formulacoes.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Nenhuma formulação salva. Crie uma no chat primeiro.</p>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="mb-8">
          <label className="text-sm font-medium block mb-2">Tipo de documento</label>
          <div className="space-y-2">
            {TIPOS_EXPORTACAO.map(t => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  tipo === t.id
                    ? 'border-morphe-green/50 bg-morphe-green/10'
                    : 'border-border bg-morphe-dark-2 hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className={tipo === t.id ? 'text-morphe-green-light' : 'text-muted-foreground'} />
                  <span className="text-sm font-medium">{t.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={exportar}
          disabled={!selecionada || loading}
          className="w-full flex items-center justify-center gap-2 bg-morphe-green hover:bg-morphe-green-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
        >
          <Download size={16} />
          {loading ? 'Gerando PDF...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  )
}
