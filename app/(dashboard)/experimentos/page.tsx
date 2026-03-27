'use client'
import { useEffect, useState } from 'react'
import { TestTube2, Plus, CheckCircle, XCircle, AlertCircle, Sparkles, ChevronDown, ChevronUp, Calendar, Trash2, Download } from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
}

interface Experimento {
  id: string
  formulacao_nome: string
  data: string
  resultado: 'sucesso' | 'falha' | 'parcial'
  descricao: string
  diagnostico?: string
  gcode?: string
}

type Resultado = 'sucesso' | 'falha' | 'parcial'

const resultadoConfig: Record<Resultado, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  sucesso: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', label: 'Sucesso' },
  parcial: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Parcial' },
  falha:   { icon: XCircle,     color: 'text-red-400',   bg: 'bg-red-400/10 border-red-400/20',     label: 'Falha' },
}

const PROBLEMAS_COMUNS = [
  'Material não extrusou / entupimento',
  'Colapso estrutural durante a impressão',
  'Filamento irregular / inconsistente',
  'Aderência ruim entre camadas',
  'Deformação pós-impressão',
  'Bolhas ou vazios no material',
  'Problema de temperatura',
  'Outro',
]

export default function ExperimentosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [experimentos, setExperimentos] = useState<Experimento[]>([])
  const [novoAberto, setNovoAberto] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [abaExp, setAbaExp] = useState<Record<string, 'observacao' | 'diagnostico' | 'gcode'>>({})
  const [gerandoDiag, setGerandoDiag] = useState<string | null>(null)

  // Formulário
  const [formulacaoId, setFormulacaoId] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState<Resultado>('sucesso')
  const [descricao, setDescricao] = useState('')
  const [problemaSelecionado, setProblemaSelecionado] = useState('')
  const [diagnosticando, setDiagnosticando] = useState(false)
  const [diagnostico, setDiagnostico] = useState('')
  const [gcode, setGcode] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(data => setFormulacoes(data || []))
    const saved = localStorage.getItem('mia_experimentos')
    if (saved) setExperimentos(JSON.parse(saved))
  }, [])

  function salvarLocal(lista: Experimento[]) {
    localStorage.setItem('mia_experimentos', JSON.stringify(lista))
  }

  function excluirExperimento(id: string) {
    if (!confirm('Excluir este experimento?')) return
    const lista = experimentos.filter(e => e.id !== id)
    setExperimentos(lista)
    salvarLocal(lista)
  }

  function baixarHistorico() {
    const linhas = experimentos.map(e =>
      `[${e.data}] ${e.formulacao_nome} — ${resultadoConfig[e.resultado].label}\n` +
      (e.descricao ? `Observação: ${e.descricao}\n` : '') +
      (e.diagnostico ? `Diagnóstico MIA:\n${e.diagnostico}\n` : '') +
      '---'
    ).join('\n')
    const conteudo = `Histórico de Experimentos — MIA Morphê Foods\nExportado em: ${new Date().toLocaleString('pt-BR')}\n\n${linhas}`
    const blob = new Blob([conteudo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `historico_experimentos_${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  async function gerarDiagnosticoExistente(exp: Experimento) {
    setGerandoDiag(exp.id)
    const form = formulacoes.find(f => f.nome === exp.formulacao_nome)
    const contexto = `Formulação: ${exp.formulacao_nome}. Data: ${exp.data}. Problema: ${exp.descricao}`
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Diagnóstico de falha em impressão 3D de alimentos. ${contexto}. Analise causas e sugira soluções práticas. Seja direto e técnico.` }] }),
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
      const lista = experimentos.map(e => e.id === exp.id ? { ...e, diagnostico: texto } : e)
      setExperimentos(lista)
      salvarLocal(lista)
    } catch { /* ignore */ }
    setGerandoDiag(null)
    void form
  }

  async function gerarDiagnostico() {
    if (!descricao.trim() && !problemaSelecionado) return
    setDiagnosticando(true)
    setDiagnostico('')
    const form = formulacoes.find(f => f.id === formulacaoId)
    const contexto = `Formulação: ${form?.nome ?? 'não informada'}. Problema: ${problemaSelecionado}. Descrição: ${descricao}`
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Diagnóstico de falha em impressão 3D de alimentos. ${contexto}. Analise causas e sugira soluções. Seja direto e técnico.` }] }),
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
      setDiagnostico(texto)
    } catch { setDiagnostico('Erro ao gerar diagnóstico.') }
    setDiagnosticando(false)
  }

  function registrarExperimento() {
    setSalvando(true)
    const form = formulacoes.find(f => f.id === formulacaoId)
    const novo: Experimento = {
      id: Date.now().toString(),
      formulacao_nome: form?.nome ?? 'Formulação não informada',
      data,
      resultado,
      descricao: problemaSelecionado ? `${problemaSelecionado}${descricao ? ' — ' + descricao : ''}` : descricao,
      diagnostico: diagnostico || undefined,
      gcode: gcode || undefined,
    }
    const lista = [novo, ...experimentos]
    setExperimentos(lista)
    salvarLocal(lista)
    setFormulacaoId(''); setData(new Date().toISOString().split('T')[0]); setResultado('sucesso')
    setDescricao(''); setProblemaSelecionado(''); setDiagnostico(''); setGcode(''); setNovoAberto(false); setSalvando(false)
  }

  function getAba(id: string): 'observacao' | 'diagnostico' | 'gcode' { return abaExp[id] ?? 'observacao' }
  function setAba(id: string, aba: 'observacao' | 'diagnostico' | 'gcode') { setAbaExp(prev => ({ ...prev, [id]: aba })) }

  const precisaDiagnostico = resultado === 'falha' || resultado === 'parcial'

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Experimentos</h1>
            <p className="text-sm text-muted-foreground mt-1">Registre experimentos de impressão e obtenha diagnósticos.</p>
          </div>
          <div className="flex gap-2">
            {experimentos.length > 0 && (
              <button onClick={baixarHistorico}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg transition-colors">
                <Download size={12} /> Histórico
              </button>
            )}
            <button onClick={() => setNovoAberto(!novoAberto)}
              className="flex items-center gap-1.5 bg-morphe-orange hover:bg-morphe-orange-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={14} /> Novo experimento
            </button>
          </div>
        </div>

        {/* Formulário */}
        {novoAberto && (
          <div className="bg-morphe-dark-2 border border-morphe-orange/20 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-medium mb-4">Registrar experimento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Formulação usada</label>
                <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
                  className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50">
                  <option value="">Selecione...</option>
                  {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Data</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="date" value={data} onChange={e => setData(e.target.value)}
                    className="w-full bg-morphe-dark border border-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-2">Resultado</label>
              <div className="flex gap-2">
                {(['sucesso', 'parcial', 'falha'] as Resultado[]).map(r => {
                  const cfg = resultadoConfig[r]
                  const Icon = cfg.icon
                  return (
                    <button key={r} onClick={() => setResultado(r)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${resultado === r ? cfg.bg + ' ' + cfg.color : 'border-border text-muted-foreground hover:border-border/80'}`}>
                      <Icon size={13} /> {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {precisaDiagnostico && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">O que aconteceu?</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PROBLEMAS_COMUNS.map(p => (
                      <button key={p} onClick={() => setProblemaSelecionado(p === problemaSelecionado ? '' : p)}
                        className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${problemaSelecionado === p ? 'border-morphe-orange/40 bg-morphe-orange/10 text-morphe-orange' : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Detalhes adicionais</label>
                  <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o que observou..." rows={3}
                    className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50 resize-none" />
                </div>
                <button onClick={gerarDiagnostico} disabled={diagnosticando || (!descricao.trim() && !problemaSelecionado)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-morphe-orange border border-border hover:border-morphe-orange/40 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-colors">
                  <Sparkles size={13} /> {diagnosticando ? 'Gerando...' : 'Gerar diagnóstico com MIA'}
                </button>
                {diagnostico && (
                  <div className="bg-morphe-dark border border-morphe-orange/20 rounded-lg p-4">
                    <p className="text-xs font-medium text-morphe-orange mb-2">Diagnóstico MIA</p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{diagnostico}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs text-muted-foreground block mb-1.5">G-code usado (opcional)</label>
              <textarea value={gcode} onChange={e => setGcode(e.target.value)} placeholder="Cole o G-code gerado ou usado na impressão..." rows={4}
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50 resize-none font-mono text-xs" />
            </div>

            {resultado === 'sucesso' && (
              <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-1.5">Observações (opcional)</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Alguma observação sobre a impressão bem-sucedida?" rows={2}
                  className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-orange/50 resize-none" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={registrarExperimento} disabled={salvando}
                className="flex items-center gap-2 bg-morphe-orange hover:bg-morphe-orange-hover disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
                <TestTube2 size={14} /> {salvando ? 'Salvando...' : 'Registrar experimento'}
              </button>
              <button onClick={() => setNovoAberto(false)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 border border-border rounded-md transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {/* Lista */}
        {experimentos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <TestTube2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum experimento registrado ainda.</p>
            <button onClick={() => setNovoAberto(true)} className="text-morphe-orange text-sm hover:underline mt-2 inline-block">Registrar primeiro experimento</button>
          </div>
        ) : (
          <div className="space-y-3">
            {experimentos.map(exp => {
              const cfg = resultadoConfig[exp.resultado]
              const Icon = cfg.icon
              const aberto = expandido === exp.id
              const aba = getAba(exp.id)
              return (
                <div key={exp.id} className={`bg-morphe-dark-2 border rounded-xl overflow-hidden transition-colors ${cfg.bg}`}>
                  <button onClick={() => setExpandido(aberto ? null : exp.id)} className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={cfg.color} />
                      <div>
                        <p className="text-sm font-medium">{exp.formulacao_nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{exp.data} · {cfg.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); excluirExperimento(exp.id) }}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                      {aberto ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                    </div>
                  </button>

                  {aberto && (
                    <div className="border-t border-border/50">
                      {/* Abas */}
                      <div className="flex border-b border-border/50">
                        {[
                          { id: 'observacao' as const, label: 'Observação' },
                          { id: 'diagnostico' as const, label: 'Diagnóstico MIA' },
                          ...(exp.gcode ? [{ id: 'gcode' as const, label: 'G-code' }] : []),
                        ].map(a => (
                          <button key={a.id} onClick={() => setAba(exp.id, a.id)}
                            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${aba === a.id ? 'border-morphe-orange text-morphe-orange' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            {a.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-4">
                        {aba === 'observacao' && (
                          <div>
                            {exp.descricao ? (
                              <p className="text-sm text-muted-foreground leading-relaxed">{exp.descricao}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Nenhuma observação registrada.</p>
                            )}
                          </div>
                        )}

                        {aba === 'diagnostico' && (
                          <div>
                            {exp.diagnostico ? (
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.diagnostico}</p>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-xs text-muted-foreground italic">Nenhum diagnóstico gerado ainda.</p>
                                <button onClick={() => gerarDiagnosticoExistente(exp)} disabled={gerandoDiag === exp.id}
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-morphe-orange border border-border hover:border-morphe-orange/40 disabled:opacity-40 px-4 py-2 rounded-md transition-colors">
                                  <Sparkles size={13} /> {gerandoDiag === exp.id ? 'Gerando diagnóstico...' : 'Gerar diagnóstico com MIA'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {aba === 'gcode' && exp.gcode && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs text-muted-foreground">G-code usado neste experimento</p>
                              <button onClick={() => {
                                const blob = new Blob([exp.gcode!], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url; a.download = `experimento_${exp.id}.gcode`; a.click()
                                URL.revokeObjectURL(url)
                              }}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded-md transition-colors">
                                <Download size={11} /> Baixar .gcode
                              </button>
                            </div>
                            <pre className="text-xs text-muted-foreground bg-morphe-dark rounded-lg p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">{exp.gcode}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
