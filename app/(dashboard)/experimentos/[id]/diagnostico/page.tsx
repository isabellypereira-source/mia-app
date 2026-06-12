'use client'
import { use, useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Send, Loader2, FlaskConical, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface Ingrediente { nome: string; percentual: number | string; funcao: string }
interface Formulacao {
  id: string
  nome: string
  ingredientes?: Ingrediente[]
  parametros?: Record<string, unknown> | null
  observacoes?: string
}
interface Experimento {
  id: string
  formulacao_nome?: string
  data: string
  resultado: 'sucesso' | 'falha' | 'parcial' | 'pendente'
  problema?: string
  descricao?: string
  peso_impresso_g?: number
}
interface ChatMsg { role: 'user' | 'assistant'; content: string }

function ResultBadge({ r }: { r: string }) {
  if (r === 'sucesso') return <span className="diag-pill r-sucesso"><CheckCircle2 size={13} /> Sucesso</span>
  if (r === 'parcial') return <span className="diag-pill r-parcial"><AlertCircle size={13} /> Parcial</span>
  if (r === 'falha') return <span className="diag-pill r-falha"><XCircle size={13} /> Falha</span>
  return <span className="diag-pill r-pend">Pendente</span>
}

export default function DiagnosticoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exp, setExp] = useState<Experimento | null>(null)
  const [form, setForm] = useState<Formulacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [initialDone, setInitialDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const buildContext = useCallback((e: Experimento, f: Formulacao | null) => {
    const partes: string[] = []
    partes.push(`Você é a MIA, assistente técnica especializada em impressão 3D de alimentos da Morphê Foods.`)
    partes.push(`Analise o experimento abaixo e gere um diagnóstico técnico claro, com hipóteses de causa raiz e ajustes recomendados para a próxima tentativa. Fundamente sua análise nos princípios de reologia, ciência de polímeros alimentares e literatura técnica disponível na sua base.`)
    partes.push(`\n## Dados do experimento`)
    partes.push(`- Formulação: ${e.formulacao_nome || 'sem identificação'}`)
    partes.push(`- Data: ${e.data}`)
    partes.push(`- Resultado: ${e.resultado}`)
    if (e.problema) partes.push(`- O que aconteceu: ${e.problema}`)
    if (e.peso_impresso_g) partes.push(`- Peso impresso: ${e.peso_impresso_g} g`)
    if (e.descricao) partes.push(`- Detalhes adicionais:\n${e.descricao}`)
    if (f?.ingredientes?.length) {
      partes.push(`\n## Composição da formulação`)
      partes.push(f.ingredientes.map(i => `- ${i.nome} | ${i.percentual}% | ${i.funcao}`).join('\n'))
    }
    if (f?.parametros && Object.keys(f.parametros).length) {
      partes.push(`\n## Parâmetros de processo definidos`)
      partes.push(Object.entries(f.parametros).map(([k, v]) => `- ${k}: ${v}`).join('\n'))
    }
    partes.push(`\n## Sua tarefa`)
    partes.push(`Gere um diagnóstico estruturado em três blocos:`)
    partes.push(`1. **Diagnóstico provável**: causa raiz mais consistente com os dados.`)
    partes.push(`2. **Análise técnica**: por que esse comportamento ocorre, com base na reologia ou na composição.`)
    partes.push(`3. **Ajustes recomendados**: 2 a 4 ações concretas para a próxima formulação ou impressão.`)
    partes.push(`Seja objetiva, científica e direta. Evite linguagem motivacional.`)
    return partes.join('\n')
  }, [])

  // load experiment + formulação
  useEffect(() => {
    fetch(`/api/experimentos/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) return
        setExp(d.experimento)
        setForm(d.formulacao)
      })
      .finally(() => setLoading(false))
  }, [id])

  // kick off initial diagnostic when data is loaded
  useEffect(() => {
    if (loading || !exp || initialDone) return
    setInitialDone(true)
    const initialPrompt = buildContext(exp, form)
    sendToMia(initialPrompt, [], true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, exp, form, initialDone])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, streaming])

  async function sendToMia(content: string, prior: ChatMsg[], hideUser = false) {
    setStreaming(true)
    const apiMessages = [...prior.map(m => ({ role: m.role, content: m.content })), { role: 'user', content }]
    const visibleAfterUser: ChatMsg[] = hideUser ? prior : [...prior, { role: 'user', content }]
    setMsgs([...visibleAfterUser, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, plainText: true }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value).split('\n')) {
            if (line.startsWith('0:')) {
              try { acc += JSON.parse(line.slice(2)) } catch { /* skip */ }
            }
          }
          setMsgs(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m))
        }
      }
    } catch {
      setMsgs(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: 'Erro ao conectar com a MIA. Tente novamente.' } : m))
    } finally {
      setStreaming(false)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || streaming) return
    setInput('')
    sendToMia(texto, msgs)
  }

  if (loading) {
    return (
      <div className="diag-loading">
        <Loader2 size={22} className="spin" />
        <p>Carregando experimento…</p>
      </div>
    )
  }
  if (!exp) {
    return (
      <div className="diag-loading">
        <p>Experimento não encontrado.</p>
        <Link href="/experimentos" className="diag-back-link">Voltar</Link>
      </div>
    )
  }

  return (
    <>
      <style>{DIAG_CSS}</style>

      <Link href="/experimentos" className="diag-back">
        <ArrowLeft size={14} strokeWidth={1.8} /> Voltar aos experimentos
      </Link>

      <div className="diag-grid">
        {/* Context column */}
        <aside className="diag-context">
          <div className="diag-ctx-head">
            <span className="diag-eyebrow">Experimento</span>
            <h2>{exp.formulacao_nome || 'Sem identificação'}</h2>
            <div className="diag-ctx-meta">
              <ResultBadge r={exp.resultado} />
              <span className="diag-date">{exp.data}</span>
              {exp.peso_impresso_g ? <span className="diag-date">· {exp.peso_impresso_g} g</span> : null}
            </div>
          </div>

          {exp.problema && (
            <div className="diag-block">
              <div className="diag-block-label">O que aconteceu</div>
              <p>{exp.problema}</p>
            </div>
          )}

          {form?.ingredientes && form.ingredientes.length > 0 && (
            <div className="diag-block">
              <div className="diag-block-label">Composição</div>
              <ul className="diag-list">
                {form.ingredientes.map((i, idx) => (
                  <li key={idx}>
                    <span className="diag-li-name">{i.nome}</span>
                    <span className="diag-li-pct">{i.percentual}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {form?.parametros && Object.keys(form.parametros).length > 0 && (
            <div className="diag-block">
              <div className="diag-block-label">Parâmetros usados</div>
              <ul className="diag-list">
                {Object.entries(form.parametros).map(([k, v]) => (
                  <li key={k}>
                    <span className="diag-li-name">{k}</span>
                    <span className="diag-li-pct">{String(v)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Chat column */}
        <section className="diag-chat">
          <div className="diag-chat-head">
            <div className="diag-chat-ic"><Sparkles size={20} strokeWidth={1.8} /></div>
            <div>
              <h2>Análise da MIA</h2>
              <p>Diagnóstico técnico-científico baseado nos dados do experimento e na base de conhecimento.</p>
            </div>
          </div>

          <div className="diag-chat-body">
            {msgs.length === 0 && (
              <div className="diag-msg assistant">
                <div className="diag-msg-ic"><Sparkles size={14} strokeWidth={1.8} /></div>
                <div className="diag-msg-content">Preparando análise…</div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`diag-msg ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="diag-msg-ic"><Sparkles size={14} strokeWidth={1.8} /></div>
                )}
                <div className="diag-msg-content">
                  {m.content ? renderMarkdown(m.content) : <span className="diag-typing"><span /><span /><span /></span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className="diag-chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte algo sobre este experimento…"
              disabled={streaming}
            />
            <button type="submit" disabled={streaming || !input.trim()} className="diag-send">
              {streaming ? <Loader2 size={16} className="spin" /> : <Send size={16} strokeWidth={2} />}
            </button>
          </form>
        </section>
      </div>
    </>
  )
}

// Minimal markdown rendering: bold and line breaks
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const parts: React.ReactNode[] = []
    const re = /\*\*([^*]+)\*\*/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index))
      parts.push(<b key={`${idx}-${m.index}`}>{m[1]}</b>)
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return <p key={idx}>{parts.length ? parts : line}</p>
  })
}

const DIAG_CSS = `
  .spin{animation:diagspin 1s linear infinite}
  @keyframes diagspin{to{transform:rotate(360deg)}}

  .diag-back{
    display:inline-flex;align-items:center;gap:8px;
    color:var(--text-muted) !important;text-decoration:none;
    font-size:13px;margin-bottom:18px;transition:color .15s;
  }
  .diag-back:hover{color:var(--text-main) !important}
  .diag-back-link{color:var(--accent-em) !important;font-weight:600;text-decoration:none}

  .diag-loading{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:14px;padding:80px 24px;color:var(--text-muted) !important;
  }

  .diag-grid{display:grid;grid-template-columns:320px 1fr;gap:18px;height:calc(100vh - 180px);min-height:520px}

  /* Context column */
  .diag-context{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    backdrop-filter:blur(18px);
    border-radius:20px;padding:24px;overflow-y:auto;
  }
  .diag-ctx-head{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--border-glass)}
  .diag-eyebrow{
    font-size:11px;letter-spacing:.16em;text-transform:uppercase;
    color:var(--text-faint) !important;
  }
  .diag-ctx-head h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:24px;margin:6px 0 12px;color:var(--text-main) !important;line-height:1.1;
  }
  .diag-ctx-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .diag-date{font-size:12px;color:var(--text-faint) !important}
  .diag-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600}
  .diag-pill.r-sucesso{background:var(--lime) !important;color:var(--green-deep) !important}
  .diag-pill.r-parcial{background:#f4c560 !important;color:var(--green-deep) !important}
  .diag-pill.r-falha{background:var(--orange) !important;color:#fff !important}
  .diag-pill.r-pend{background:var(--surface-glass-strong) !important;color:var(--text-main) !important}

  .diag-block{margin-bottom:20px}
  .diag-block-label{
    font-size:11px;letter-spacing:.14em;text-transform:uppercase;
    color:var(--text-faint) !important;margin-bottom:8px;
  }
  .diag-block p{font-size:13.5px;color:var(--text-muted) !important;margin:0;line-height:1.5}
  .diag-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
  .diag-list li{
    display:flex;justify-content:space-between;align-items:center;
    font-size:13px;padding:6px 10px;border-radius:8px;
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
  }
  .diag-li-name{color:var(--text-muted) !important}
  .diag-li-pct{color:var(--accent-em) !important;font-weight:600;font-family:var(--font-serif),serif;font-style:italic;font-size:14px}

  /* Chat column */
  .diag-chat{
    display:flex;flex-direction:column;
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    backdrop-filter:blur(18px);
    border-radius:20px;overflow:hidden;
  }
  .diag-chat-head{
    display:flex;align-items:center;gap:14px;
    padding:20px 24px;border-bottom:1px solid var(--border-glass);
  }
  .diag-chat-ic{
    width:44px;height:44px;border-radius:14px;
    background:var(--icon-tint);color:var(--accent-em);
    display:grid;place-items:center;flex-shrink:0;
  }
  .diag-chat-head h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:22px;margin:0;color:var(--text-main) !important;line-height:1.1;
  }
  .diag-chat-head p{font-size:12.5px;color:var(--text-faint) !important;margin:4px 0 0;line-height:1.4}

  .diag-chat-body{
    flex:1;overflow-y:auto;padding:24px;
    display:flex;flex-direction:column;gap:16px;
  }
  .diag-msg{display:flex;gap:12px;max-width:88%}
  .diag-msg.user{align-self:flex-end;flex-direction:row-reverse}
  .diag-msg-ic{
    width:30px;height:30px;border-radius:50%;
    background:var(--icon-tint);color:var(--accent-em);
    display:grid;place-items:center;flex-shrink:0;
  }
  .diag-msg-content{
    background:var(--surface-glass-strong) !important;
    border:1px solid var(--border-glass-strong) !important;
    border-radius:16px;padding:14px 18px;
    font-size:14px;line-height:1.6;color:var(--text-main) !important;
  }
  .diag-msg.user .diag-msg-content{
    background:var(--accent) !important;color:var(--accent-text-on) !important;border-color:transparent;
  }
  .diag-msg-content p{margin:0 0 8px}
  .diag-msg-content p:last-child{margin-bottom:0}
  .diag-msg-content b{color:var(--accent-em) !important;font-weight:600}
  .diag-msg.user .diag-msg-content b{color:var(--accent-text-on) !important}

  .diag-typing{display:inline-flex;gap:5px;align-items:center}
  .diag-typing span{
    width:7px;height:7px;border-radius:50%;background:var(--accent-em);
    animation:diagblink 1.2s infinite ease-in-out;
  }
  .diag-typing span:nth-child(2){animation-delay:.2s}
  .diag-typing span:nth-child(3){animation-delay:.4s}
  @keyframes diagblink{0%,80%,100%{opacity:.3}40%{opacity:1}}

  .diag-chat-input{
    display:flex;gap:10px;padding:16px 20px;border-top:1px solid var(--border-glass);
  }
  .diag-chat-input input{
    flex:1;padding:12px 16px;border-radius:999px;
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
    font-family:inherit;font-size:14px;outline:none;
    transition:border-color .15s, box-shadow .15s;
  }
  .diag-chat-input input::placeholder{color:var(--text-faint) !important}
  .diag-chat-input input:focus{border-color:var(--accent) !important;box-shadow:0 0 0 4px var(--icon-tint)}
  .diag-send{
    width:44px;height:44px;border-radius:50%;
    background:var(--accent) !important;color:var(--accent-text-on) !important;
    border:none;cursor:pointer;display:grid;place-items:center;
    transition:transform .15s, box-shadow .25s;
  }
  .diag-send:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 24px -8px var(--accent)}
  .diag-send:disabled{opacity:.5;cursor:not-allowed}

  @media (max-width:1000px){
    .diag-grid{grid-template-columns:1fr;height:auto}
    .diag-context{max-height:none}
  }
`
