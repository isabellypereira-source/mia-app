'use client'
import { useEffect, useRef, useState } from 'react'
import {
  TestTube2, Plus, CheckCircle, XCircle, AlertCircle, Sparkles,
  ChevronDown, ChevronUp, Calendar, Trash2, Download, Send, Loader2,
} from 'lucide-react'

interface Formulacao { id: string; nome: string }

interface ChatMsg { role: 'user' | 'assistant'; content: string }

interface Experimento {
  id: string
  formulacao_nome: string
  data: string
  resultado: 'sucesso' | 'falha' | 'parcial'
  descricao: string
  peso_impresso_g?: number
  diagnostico?: string
  chat?: ChatMsg[]
}

type Resultado = 'sucesso' | 'falha' | 'parcial'

const RC: Record<Resultado, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  sucesso: { icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50 border-green-200',  label: 'Sucesso' },
  parcial: { icon: AlertCircle, color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200',  label: 'Parcial' },
  falha:   { icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50 border-red-200',      label: 'Falha'   },
}

const PROBLEMAS = [
  'Material não extrusou / entupimento',
  'Colapso estrutural durante a impressão',
  'Filamento irregular / inconsistente',
  'Baixa adesão entre camadas',
  'Deformação pós-impressão',
  'Bolhas ou vazios no material',
  'Problema de temperatura',
  'Outro',
]

// ---------------------------------------------------------------------------
// Chat de diagnóstico por experimento
// ---------------------------------------------------------------------------

function DiagnosticoChat({ exp, formulacoes }: { exp: Experimento; formulacoes: Formulacao[] }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(exp.chat ?? [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Salva chat no localStorage sempre que muda
  useEffect(() => {
    const saved = localStorage.getItem('mia_experimentos')
    if (!saved) return
    const lista: Experimento[] = JSON.parse(saved)
    const updated = lista.map(e => e.id === exp.id ? { ...e, chat: msgs } : e)
    localStorage.setItem('mia_experimentos', JSON.stringify(updated))
  }, [msgs, exp.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  async function enviar(msgOverride?: string) {
    const texto = (msgOverride ?? input).trim()
    if (!texto || loading) return
    setInput('')

    const newMsgs: ChatMsg[] = [...msgs, { role: 'user', content: texto }]
    setMsgs(newMsgs)
    setLoading(true)

    // Contexto do experimento como system prefix
    const context = [
      `Experimento de impressão 3D de alimentos registrado na MIA.`,
      `Formulação: ${exp.formulacao_nome}`,
      `Data: ${exp.data}`,
      `Resultado: ${RC[exp.resultado].label}`,
      exp.descricao ? `Observações: ${exp.descricao}` : '',
      exp.peso_impresso_g ? `Peso impresso: ${exp.peso_impresso_g}g` : '',
      `\nVocê é a MIA, assistente de impressão 3D de alimentos da BioedTech. Analise este caso, sugira causas e soluções práticas. O usuário pode colar G-code para análise. Seja técnico, direto e goal-oriented.`,
    ].filter(Boolean).join('\n')

    const apiMsgs = [
      { role: 'user', content: context + '\n\n---\n\n' + texto },
      ...newMsgs.slice(1).map(m => ({ role: m.role, content: m.content })),
    ]

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let texto2 = ''

      const respMsgs: ChatMsg[] = [...newMsgs, { role: 'assistant', content: '' }]
      setMsgs(respMsgs)

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n')) {
            if (line.startsWith('0:')) {
              try { texto2 += JSON.parse(line.slice(2)) } catch { /* skip */ }
            }
          }
          setMsgs(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: texto2 } : m))
        }
      }
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com a MIA.' }])
    }
    setLoading(false)
  }

  const promptInicial = exp.resultado !== 'sucesso'
    ? `Analise este experimento e me diga as prováveis causas do problema e como corrijo.`
    : null

  return (
    <div className="flex flex-col" style={{ minHeight: 320 }}>
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-96">
        {msgs.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-[#58413c] mb-3">Converse com a MIA sobre este experimento.<br />Você pode colar G-code, descrever o problema ou pedir sugestões.</p>
            {promptInicial && (
              <button onClick={() => enviar(promptInicial)}
                className="text-xs bg-[#003223]/8 border border-[#003223]/15 text-[#003223] px-4 py-2 rounded-full hover:bg-[#003223]/12 transition-colors">
                <Sparkles size={11} className="inline mr-1" />
                Analisar problema automaticamente
              </button>
            )}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#003223] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-white text-[9px] font-bold">M</span>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-[#003223] text-white rounded-br-sm'
                : 'bg-white border border-[#e5d9c1] text-[#211b0c] rounded-bl-sm'
            }`}>
              {m.content || <span className="opacity-40">...</span>}
            </div>
          </div>
        ))}
        {loading && msgs[msgs.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-[#003223] flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-[9px] font-bold">M</span>
            </div>
            <div className="bg-white border border-[#e5d9c1] rounded-2xl rounded-bl-sm px-3.5 py-2.5">
              <Loader2 size={13} className="animate-spin text-[#58413c]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e5d9c1] p-3 flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          placeholder="Descreva o problema, cole G-code, ou faça uma pergunta..."
          rows={2}
          className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none"
        />
        <button onClick={() => enviar()} disabled={!input.trim() || loading}
          className="bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white p-2 rounded-xl transition-colors self-end">
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function ExperimentosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [experimentos, setExperimentos] = useState<Experimento[]>([])
  const [novoAberto, setNovoAberto] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [abaExp, setAbaExp] = useState<Record<string, 'observacao' | 'diagnostico'>>({})

  // Formulário
  const [formulacaoId, setFormulacaoId] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState<Resultado>('sucesso')
  const [descricao, setDescricao] = useState('')
  const [problemaSelecionado, setProblemaSelecionado] = useState('')
  const [pesoImpresso, setPesoImpresso] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
    const saved = localStorage.getItem('mia_experimentos')
    if (saved) setExperimentos(JSON.parse(saved))
  }, [])

  function salvarLocal(lista: Experimento[]) {
    localStorage.setItem('mia_experimentos', JSON.stringify(lista))
  }

  function excluir(id: string) {
    if (!confirm('Excluir este experimento?')) return
    const lista = experimentos.filter(e => e.id !== id)
    setExperimentos(lista); salvarLocal(lista)
  }

  function baixarHistorico() {
    const linhas = experimentos.map(e =>
      `[${e.data}] ${e.formulacao_nome} — ${RC[e.resultado].label}\n` +
      (e.descricao ? `Observação: ${e.descricao}\n` : '') +
      (e.peso_impresso_g ? `Peso impresso: ${e.peso_impresso_g}g\n` : '') +
      '---'
    ).join('\n')
    const blob = new Blob([`Histórico — MIA BioedTech\n${new Date().toLocaleString('pt-BR')}\n\n${linhas}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `experimentos_${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  function registrar() {
    setSalvando(true)
    const form = formulacoes.find(f => f.id === formulacaoId)
    const novo: Experimento = {
      id: Date.now().toString(),
      formulacao_nome: form?.nome ?? 'Formulação não informada',
      data,
      resultado,
      descricao: problemaSelecionado
        ? `${problemaSelecionado}${descricao ? ' — ' + descricao : ''}`
        : descricao,
      peso_impresso_g: pesoImpresso ? parseFloat(pesoImpresso) : undefined,
    }
    const lista = [novo, ...experimentos]
    setExperimentos(lista); salvarLocal(lista)
    setFormulacaoId(''); setData(new Date().toISOString().split('T')[0])
    setResultado('sucesso'); setDescricao(''); setProblemaSelecionado('')
    setPesoImpresso(''); setNovoAberto(false); setSalvando(false)
    // Auto-abre o experimento recém-criado no tab de diagnóstico se falha/parcial
    if (resultado !== 'sucesso') {
      setExpandido(novo.id)
      setAbaExp(prev => ({ ...prev, [novo.id]: 'diagnostico' }))
    }
  }

  function getAba(id: string) { return abaExp[id] ?? 'observacao' }
  function setAba(id: string, aba: 'observacao' | 'diagnostico') {
    setAbaExp(prev => ({ ...prev, [id]: aba }))
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Experimentos</h1>
            <p className="text-sm text-[#58413c] mt-1">Registre impressões e diagnostique com a MIA.</p>
          </div>
          <div className="flex gap-2">
            {experimentos.length > 0 && (
              <button onClick={baixarHistorico}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2">
                <Download size={12} /> Histórico
              </button>
            )}
            <button onClick={() => setNovoAberto(!novoAberto)}
              className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
              <Plus size={14} /> Novo experimento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-6 space-y-4">

        {/* Formulário */}
        {novoAberto && (
          <div className="bg-white border border-[#e5d9c1] rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-4">Registrar experimento</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-[#58413c] block mb-1.5">Formulação</label>
                <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
                  className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20">
                  <option value="">Selecione...</option>
                  {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#58413c] block mb-1.5">Data</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58413c]" />
                  <input type="date" value={data} onChange={e => setData(e.target.value)}
                    className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#58413c] block mb-2">Resultado</label>
              <div className="flex gap-2">
                {(['sucesso', 'parcial', 'falha'] as Resultado[]).map(r => {
                  const cfg = RC[r]; const Icon = cfg.icon
                  return (
                    <button key={r} onClick={() => setResultado(r)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${resultado === r ? cfg.bg + ' ' + cfg.color + ' font-medium' : 'border-[#e5d9c1] text-[#58413c]'}`}>
                      <Icon size={13} /> {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {(resultado === 'falha' || resultado === 'parcial') && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="text-xs text-[#58413c] block mb-2">O que aconteceu?</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PROBLEMAS.map(p => (
                      <button key={p} onClick={() => setProblemaSelecionado(p === problemaSelecionado ? '' : p)}
                        className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${problemaSelecionado === p ? 'border-[#003223]/30 bg-[rgba(0,50,35,0.06)] text-[#003223]' : 'border-[#e5d9c1] text-[#58413c] hover:border-[#003223]/20'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#58413c] block mb-1.5">Detalhes adicionais</label>
                  <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva o que observou em detalhe..." rows={3}
                    className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
                </div>
              </div>
            )}

            {resultado === 'sucesso' && (
              <div className="mb-4">
                <label className="text-xs text-[#58413c] block mb-1.5">Observações (opcional)</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder="Alguma observação sobre a impressão?" rows={2}
                  className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
              </div>
            )}

            {/* Peso impresso */}
            <div className="mb-4 p-3 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl">
              <label className="text-xs font-medium text-[#211b0c] block mb-1">Peso da peça impressa (opcional)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={pesoImpresso} onChange={e => setPesoImpresso(e.target.value)}
                  placeholder="ex: 38" min={0} step={0.1}
                  className="w-28 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
                <span className="text-xs text-[#58413c]">g — usado para estimar composição nutricional</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={registrar} disabled={salvando}
                className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <TestTube2 size={14} /> {salvando ? 'Salvando...' : 'Registrar'}
              </button>
              <button onClick={() => setNovoAberto(false)}
                className="text-sm text-[#58413c] hover:text-[#211b0c] px-4 py-2 border border-[#e5d9c1] rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {experimentos.length === 0 ? (
          <div className="text-center py-16 text-[#58413c]">
            <TestTube2 size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum experimento registrado.</p>
            <button onClick={() => setNovoAberto(true)}
              className="text-[#003223] text-sm hover:underline mt-2 inline-block">
              Registrar primeiro experimento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experimentos.map(exp => {
              const cfg = RC[exp.resultado]; const Icon = cfg.icon
              const aberto = expandido === exp.id
              const aba = getAba(exp.id)
              return (
                <div key={exp.id} className="bg-white border border-[#e5d9c1] rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandido(aberto ? null : exp.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={cfg.color} />
                      <div>
                        <p className="text-sm font-medium">{exp.formulacao_nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-[#58413c]">{exp.data}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          {exp.peso_impresso_g && (
                            <span className="text-[10px] text-[#58413c]">{exp.peso_impresso_g}g impressos</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); excluir(exp.id) }}
                        className="text-[#bfc9c2] hover:text-red-400 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                      {aberto ? <ChevronUp size={15} className="text-[#58413c]" /> : <ChevronDown size={15} className="text-[#58413c]" />}
                    </div>
                  </button>

                  {aberto && (
                    <div className="border-t border-[#e5d9c1]">
                      <div className="flex border-b border-[#e5d9c1]">
                        {[
                          { id: 'observacao' as const, label: 'Observações' },
                          { id: 'diagnostico' as const, label: 'Diagnóstico MIA' },
                        ].map(a => (
                          <button key={a.id} onClick={() => setAba(exp.id, a.id)}
                            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${aba === a.id ? 'border-[#003223] text-[#003223]' : 'border-transparent text-[#58413c] hover:text-[#211b0c]'}`}>
                            {a.id === 'diagnostico' && <Sparkles size={10} />}
                            {a.label}
                          </button>
                        ))}
                      </div>

                      {aba === 'observacao' && (
                        <div className="p-4 space-y-3">
                          {exp.descricao ? (
                            <p className="text-sm text-[#58413c] leading-relaxed">{exp.descricao}</p>
                          ) : (
                            <p className="text-xs text-[#58413c] italic">Nenhuma observação registrada.</p>
                          )}
                          {exp.peso_impresso_g && (
                            <div className="p-3 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl">
                              <p className="text-xs font-medium text-[#003223] mb-1">Peça impressa</p>
                              <p className="text-sm font-semibold">{exp.peso_impresso_g} g</p>
                              <p className="text-[11px] text-[#58413c] mt-0.5">Para ver dados nutricionais estimados, pergunte à MIA na aba Diagnóstico.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {aba === 'diagnostico' && (
                        <DiagnosticoChat exp={exp} formulacoes={formulacoes} />
                      )}
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
