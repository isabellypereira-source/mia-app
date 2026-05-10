'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  TestTube2, Plus, CheckCircle, XCircle, AlertCircle, Sparkles,
  ChevronDown, ChevronUp, Calendar, Trash2, Download, Send, Loader2, Wifi,
} from 'lucide-react'

interface Formulacao { id: string; nome: string }
interface ChatMsg { role: 'user' | 'assistant'; content: string }

interface Experimento {
  id: string
  formulacao_id?: string
  formulacao_nome?: string
  data: string
  resultado: 'sucesso' | 'falha' | 'parcial' | 'pendente'
  descricao?: string
  problema?: string
  peso_impresso_g?: number
  origem: 'manual' | 'agent'
  gcode_filename?: string
  chat?: ChatMsg[]
}

type Resultado = 'sucesso' | 'falha' | 'parcial'

const RC: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  sucesso:  { icon: CheckCircle,  color: 'text-green-500', bg: 'bg-green-50 border-green-200',   label: 'Sucesso'  },
  parcial:  { icon: AlertCircle,  color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200',   label: 'Parcial'  },
  falha:    { icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50 border-red-200',       label: 'Falha'    },
  pendente: { icon: Loader2,      color: 'text-blue-400',  bg: 'bg-blue-50 border-blue-200',     label: 'Pendente' },
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

// Limpa code blocks JSON e formatação de cards estruturados de respostas antigas
function limparTextoMia(texto: string): string {
  return texto
    .replace(/```json[\s\S]*?```/g, '')           // remove blocos ```json ... ```
    .replace(/```[\s\S]*?```/g, '')                // remove qualquer code block
    .replace(/\{"__type"[\s\S]*?\}\s*$/gm, '')     // remove cards inline
    .replace(/\n{3,}/g, '\n\n')                    // colapsa quebras de linha
    .trim()
}

function DiagnosticoChat({ exp }: { exp: Experimento }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(exp.chat ?? [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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

    const context = [
      `Experimento de impressão 3D de alimentos na MIA.`,
      exp.formulacao_nome ? `Formulação: ${exp.formulacao_nome}` : '',
      `Data: ${exp.data}`,
      `Resultado: ${RC[exp.resultado]?.label ?? exp.resultado}`,
      exp.descricao ? `Observações: ${exp.descricao}` : '',
      exp.gcode_filename ? `Arquivo GCode: ${exp.gcode_filename}` : '',
      `\nVocê é a MIA. Analise o caso, sugira causas e soluções. Seja técnico e direto.`,
    ].filter(Boolean).join('\n')

    const apiMsgs = [
      { role: 'user', content: context + '\n\n---\n\n' + texto },
      ...newMsgs.slice(1).map(m => ({ role: m.role, content: m.content })),
    ]

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs, plainText: true }),
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

  return (
    <div className="flex flex-col" style={{ minHeight: 320 }}>
      <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-96">
        {msgs.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-[#58413c] mb-3">Converse com a MIA sobre este experimento.</p>
            {exp.resultado !== 'sucesso' && exp.resultado !== 'pendente' && (
              <button onClick={() => enviar('Analise este experimento e me diga as prováveis causas do problema e como corrigir.')}
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
              m.role === 'user' ? 'bg-[#003223] text-white rounded-br-sm' : 'bg-white border border-[#e5d9c1] text-[#211b0c] rounded-bl-sm'
            }`}>
              {m.content
                ? (m.role === 'assistant' ? limparTextoMia(m.content) : m.content)
                : <span className="opacity-40">...</span>}
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
      <div className="border-t border-[#e5d9c1] p-3 flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          placeholder="Descreva o problema, cole G-code, ou faça uma pergunta..."
          rows={2}
          className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
        <button onClick={() => enviar()} disabled={!input.trim() || loading}
          className="bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white p-2 rounded-xl transition-colors self-end">
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Formulário de resultado para experimentos pendentes (vindos do agent)
// ---------------------------------------------------------------------------

function RegistrarResultado({ exp, formulacoes, onSalvo }: {
  exp: Experimento
  formulacoes: Formulacao[]
  onSalvo: (updated: Experimento) => void
}) {
  const [resultado, setResultado] = useState<Resultado>('sucesso')
  const [descricao, setDescricao] = useState('')
  const [problema, setProblema] = useState('')
  const [peso, setPeso] = useState('')
  const [formulacaoId, setFormulacaoId] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    setSalvando(true)
    const form = formulacoes.find(f => f.id === formulacaoId)
    const res = await fetch('/api/experimentos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: exp.id,
        resultado,
        descricao: problema ? `${problema}${descricao ? ' — ' + descricao : ''}` : descricao,
        problema,
        peso_impresso_g: peso ? parseFloat(peso) : undefined,
        formulacao_id: formulacaoId || undefined,
        formulacao_nome: form?.nome,
      }),
    })
    const updated = await res.json()
    setSalvando(false)
    onSalvo(updated)
  }

  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-[#58413c]">
        GCode recebido: <span className="font-mono text-[#003223]">{exp.gcode_filename}</span>
      </p>

      <div>
        <label className="text-xs text-[#58413c] block mb-1.5">Formulação (opcional)</label>
        <select value={formulacaoId} onChange={e => setFormulacaoId(e.target.value)}
          className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20">
          <option value="">Selecione...</option>
          {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-[#58413c] block mb-2">Como foi a impressão?</label>
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-1.5">
            {PROBLEMAS.map(p => (
              <button key={p} onClick={() => setProblema(p === problema ? '' : p)}
                className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${problema === p ? 'border-[#003223]/30 bg-[rgba(0,50,35,0.06)] text-[#003223]' : 'border-[#e5d9c1] text-[#58413c] hover:border-[#003223]/20'}`}>
                {p}
              </button>
            ))}
          </div>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhes adicionais..." rows={2}
            className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="number" value={peso} onChange={e => setPeso(e.target.value)}
          placeholder="Peso (g)" min={0} step={0.1}
          className="w-28 bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
        <span className="text-xs text-[#58413c]">g impresso (opcional)</span>
      </div>

      <button onClick={salvar} disabled={salvando}
        className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
        <TestTube2 size={14} /> {salvando ? 'Salvando...' : 'Registrar resultado'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function ExperimentosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [experimentos, setExperimentos] = useState<Experimento[]>([])
  const [novoAberto, setNovoAberto] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [abaExp, setAbaExp] = useState<Record<string, 'observacao' | 'resultado' | 'diagnostico'>>({})
  const [carregando, setCarregando] = useState(true)

  // Formulário manual
  const [formulacaoId, setFormulacaoId] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState<Resultado>('sucesso')
  const [descricao, setDescricao] = useState('')
  const [problemaSelecionado, setProblemaSelecionado] = useState('')
  const [pesoImpresso, setPesoImpresso] = useState('')
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const [fRes, eRes] = await Promise.all([
      fetch('/api/formulacoes'),
      fetch('/api/experimentos'),
    ])
    const [fData, eData] = await Promise.all([fRes.json(), eRes.json()])
    setFormulacoes(fData || [])
    setExperimentos(eData || [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
    // Polling leve para capturar novos GCodes do agent
    const interval = setInterval(() => {
      fetch('/api/experimentos').then(r => r.json()).then(d => setExperimentos(d || []))
    }, 15000)
    return () => clearInterval(interval)
  }, [carregar])

  async function registrarManual() {
    setSalvando(true)
    const form = formulacoes.find(f => f.id === formulacaoId)
    await fetch('/api/experimentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formulacao_id: formulacaoId || undefined,
        formulacao_nome: form?.nome ?? 'Formulação não informada',
        data,
        resultado,
        descricao: problemaSelecionado
          ? `${problemaSelecionado}${descricao ? ' — ' + descricao : ''}`
          : descricao,
        problema: problemaSelecionado || undefined,
        peso_impresso_g: pesoImpresso ? parseFloat(pesoImpresso) : undefined,
      }),
    })
    await carregar()
    setFormulacaoId(''); setData(new Date().toISOString().split('T')[0])
    setResultado('sucesso'); setDescricao(''); setProblemaSelecionado(''); setPesoImpresso('')
    setNovoAberto(false); setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este experimento?')) return
    await fetch('/api/experimentos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setExperimentos(prev => prev.filter(e => e.id !== id))
  }

  function baixarHistorico() {
    const linhas = experimentos.map(e =>
      `[${e.data}] ${e.formulacao_nome ?? e.gcode_filename ?? '—'} — ${RC[e.resultado]?.label}\n` +
      (e.descricao ? `Observação: ${e.descricao}\n` : '') +
      (e.peso_impresso_g ? `Peso: ${e.peso_impresso_g}g\n` : '') + '---'
    ).join('\n')
    const blob = new Blob([`Histórico — MIA BioedTech\n${new Date().toLocaleString('pt-BR')}\n\n${linhas}`], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `experimentos_${Date.now()}.txt`; a.click()
  }

  function getAba(id: string) { return abaExp[id] ?? 'observacao' }
  function setAba(id: string, aba: 'observacao' | 'resultado' | 'diagnostico') {
    setAbaExp(prev => ({ ...prev, [id]: aba }))
  }

  const pendentes = experimentos.filter(e => e.resultado === 'pendente')

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Experimentos</h1>
            <p className="text-sm text-[#58413c] mt-1">
              Registre impressões e diagnostique com a MIA.
              {pendentes.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendentes.length} novo{pendentes.length > 1 ? 's' : ''} do Slicer
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {experimentos.length > 0 && (
              <button onClick={baixarHistorico} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2">
                <Download size={12} /> Histórico
              </button>
            )}
            <button onClick={() => setNovoAberto(!novoAberto)}
              className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
              <Plus size={14} /> Novo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-6 space-y-4">

        {/* Formulário manual */}
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
                <div className="grid grid-cols-1 gap-1.5">
                  {PROBLEMAS.map(p => (
                    <button key={p} onClick={() => setProblemaSelecionado(p === problemaSelecionado ? '' : p)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${problemaSelecionado === p ? 'border-[#003223]/30 bg-[rgba(0,50,35,0.06)] text-[#003223]' : 'border-[#e5d9c1] text-[#58413c] hover:border-[#003223]/20'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder="Detalhes adicionais..." rows={3}
                  className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
              </div>
            )}
            {resultado === 'sucesso' && (
              <div className="mb-4">
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder="Observações (opcional)" rows={2}
                  className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 resize-none" />
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              <input type="number" value={pesoImpresso} onChange={e => setPesoImpresso(e.target.value)}
                placeholder="Peso (g)" min={0} step={0.1}
                className="w-28 bg-white border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
              <span className="text-xs text-[#58413c]">g — estimativa nutricional</span>
            </div>
            <div className="flex gap-2">
              <button onClick={registrarManual} disabled={salvando}
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
        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-[#58413c]" />
          </div>
        ) : experimentos.length === 0 ? (
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
              const cfg = RC[exp.resultado] ?? RC.pendente
              const Icon = cfg.icon
              const aberto = expandido === exp.id
              const aba = getAba(exp.id)
              const isPendente = exp.resultado === 'pendente'

              return (
                <div key={exp.id} className={`bg-white border rounded-2xl overflow-hidden ${isPendente ? 'border-blue-200 ring-1 ring-blue-100' : 'border-[#e5d9c1]'}`}>
                  <button onClick={() => {
                    setExpandido(aberto ? null : exp.id)
                    if (isPendente) setAba(exp.id, 'resultado')
                  }} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                    <div className="flex items-center gap-3">
                      {exp.origem === 'agent'
                        ? <Wifi size={15} className="text-blue-400 flex-shrink-0" />
                        : <Icon size={16} className={cfg.color} />
                      }
                      <div>
                        <p className="text-sm font-medium">
                          {exp.formulacao_nome ?? exp.gcode_filename ?? 'Experimento'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-[#58413c]">{exp.data}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {isPendente && exp.origem === 'agent' ? 'Aguardando resultado' : cfg.label}
                          </span>
                          {exp.peso_impresso_g && (
                            <span className="text-[10px] text-[#58413c]">{exp.peso_impresso_g}g</span>
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
                          { id: 'observacao' as const, label: 'Observações', hide: isPendente },
                          { id: 'resultado' as const, label: isPendente ? 'Registrar resultado' : 'Resultado', hide: false },
                          { id: 'diagnostico' as const, label: 'Diagnóstico MIA', hide: false },
                        ].filter(a => !a.hide).map(a => (
                          <button key={a.id} onClick={() => setAba(exp.id, a.id)}
                            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${aba === a.id ? 'border-[#003223] text-[#003223]' : 'border-transparent text-[#58413c] hover:text-[#211b0c]'}`}>
                            {a.id === 'diagnostico' && <Sparkles size={10} />}
                            {a.label}
                          </button>
                        ))}
                      </div>

                      {aba === 'observacao' && (
                        <div className="p-4 space-y-3">
                          {exp.descricao
                            ? <p className="text-sm text-[#58413c] leading-relaxed">{exp.descricao}</p>
                            : <p className="text-xs text-[#58413c] italic">Nenhuma observação.</p>
                          }
                          {exp.gcode_filename && (
                            <p className="text-xs text-[#58413c]">GCode: <span className="font-mono">{exp.gcode_filename}</span></p>
                          )}
                        </div>
                      )}

                      {aba === 'resultado' && (
                        isPendente
                          ? <RegistrarResultado exp={exp} formulacoes={formulacoes}
                              onSalvo={updated => {
                                setExperimentos(prev => prev.map(e => e.id === updated.id ? updated : e))
                                setAba(exp.id, 'observacao')
                              }} />
                          : (
                            <div className="p-4">
                              <p className="text-sm text-[#58413c]">{exp.descricao || 'Nenhuma observação.'}</p>
                            </div>
                          )
                      )}

                      {aba === 'diagnostico' && <DiagnosticoChat exp={exp} />}
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
