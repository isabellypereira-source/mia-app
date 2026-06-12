'use client'
import { use, useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Send, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

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

const SEP = '<<<NEXTMSG>>>'

function ResultBadge({ r }: { r: string }) {
  if (r === 'sucesso') return <span className="diag-pill r-sucesso"><CheckCircle2 size={13} /> Sucesso</span>
  if (r === 'parcial') return <span className="diag-pill r-parcial"><AlertCircle size={13} /> Parcial</span>
  if (r === 'falha') return <span className="diag-pill r-falha"><XCircle size={13} /> Falha</span>
  return <span className="diag-pill r-pend">Pendente</span>
}

// contextual suggested questions based on the problem reported
function suggestionsFor(problema: string | undefined): string[] {
  const base = ['Quais ajustes recomendados para a próxima impressão?']
  if (!problema) return [...base, 'O que pode ter influenciado esse resultado?']
  const p = problema.toLowerCase()
  if (p.includes('entupiu') || p.includes('não saiu') || p.includes('extrusou')) {
    return [
      'Pode ser viscosidade muito alta?',
      'O diâmetro do bico precisa mudar?',
      ...base,
    ]
  }
  if (p.includes('desabou') || p.includes('colapso')) {
    return [
      'Como aumentar o yield stress?',
      'Quais hidrocolóides recomenda para sustentar a estrutura?',
      ...base,
    ]
  }
  if (p.includes('irregular') || p.includes('cortando') || p.includes('filamento') || p.includes('filete')) {
    return [
      'Pode ser sobre-extrusão ou fluxo alto?',
      'Como ajustar o flow e o fator de extrusão?',
      ...base,
    ]
  }
  if (p.includes('grudaram') || p.includes('adesão') || p.includes('camadas')) {
    return [
      'É problema do tempo entre camadas?',
      'Devo aumentar a temperatura ou o flow?',
      ...base,
    ]
  }
  if (p.includes('deformou') || p.includes('forma')) {
    return [
      'Como reduzir a sinérese (perda de água)?',
      'Posso aumentar o tempo de gelificação?',
      ...base,
    ]
  }
  if (p.includes('bolhas') || p.includes('vazios') || p.includes('furos')) {
    return [
      'Como remover bolhas antes de imprimir?',
      'É necessário desairar ou centrifugar a pasta?',
      ...base,
    ]
  }
  if (p.includes('temperatura')) {
    return [
      'Qual faixa térmica ideal para esta matriz?',
      'O bico ou a mesa precisa calibrar?',
      ...base,
    ]
  }
  if (p.includes('quebrou')) {
    return [
      'Como melhorar a integridade pós-impressão?',
      'Pode ser baixa proporção de hidrocolóide?',
      ...base,
    ]
  }
  return [...base, 'O que pode ter influenciado esse resultado?']
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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentInitialRef = useRef(false)

  const buildInitialPrompt = useCallback((e: Experimento, f: Formulacao | null) => {
    const partes: string[] = []
    partes.push(`Você é a MIA, assistente técnica especializada em impressão 3D de alimentos da Morphê Foods.`)
    partes.push(`Analise o experimento abaixo e gere um diagnóstico técnico claro em português brasileiro.`)
    partes.push(`\n## Dados do experimento`)
    partes.push(`- Formulação: ${e.formulacao_nome || 'sem identificação'}`)
    partes.push(`- Data: ${e.data}`)
    partes.push(`- Resultado: ${e.resultado}`)
    if (e.problema) partes.push(`- O que aconteceu: ${e.problema}`)
    if (e.peso_impresso_g) partes.push(`- Peso impresso: ${e.peso_impresso_g} g`)
    if (e.descricao) partes.push(`- Detalhes:\n${e.descricao}`)
    if (f?.ingredientes?.length) {
      partes.push(`\n## Composição`)
      partes.push(f.ingredientes.map(i => `- ${i.nome} | ${i.percentual}% | ${i.funcao}`).join('\n'))
    }
    if (f?.parametros && Object.keys(f.parametros).length) {
      partes.push(`\n## Parâmetros usados`)
      partes.push(Object.entries(f.parametros).map(([k, v]) => `- ${k}: ${v}`).join('\n'))
    }
    partes.push(`\n## Como você deve responder`)
    partes.push(`Quebre sua resposta em DUAS mensagens separadas usando exatamente o marcador ${SEP} (sem espaços) entre elas.`)
    partes.push(``)
    partes.push(`Mensagem 1 (curta, calorosa, 1-2 frases): cumprimente e diga que analisou os dados desse experimento específico. Cite o nome da formulação.`)
    partes.push(``)
    partes.push(`Mensagem 2 (técnica): comece com a linha "Diagnóstico provável" em negrito, depois explique em 2-4 frases a causa raiz provável conectando o que aconteceu com a reologia, a composição ou os parâmetros. Seja precisa, científica e curta. Use no máximo 120 palavras.`)
    partes.push(``)
    partes.push(`NÃO inclua recomendações ainda. A usuária vai pedir as recomendações por botão depois. NÃO use cabeçalhos markdown com ###. Use negrito (**texto**) só para a frase "Diagnóstico provável".`)
    return partes.join('\n')
  }, [])

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

  useEffect(() => {
    if (loading || !exp || initialDone || sentInitialRef.current) return
    sentInitialRef.current = true
    setInitialDone(true)
    streamChunked(buildInitialPrompt(exp, form), [], true, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, exp, form, initialDone])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, streaming, showSuggestions])

  async function streamChunked(content: string, prior: ChatMsg[], hideUser = false, skipRag = false) {
    setStreaming(true)
    setShowSuggestions(false)
    const apiMessages = [...prior.map(m => ({ role: m.role, content: m.content })), { role: 'user', content }]
    const visibleAfterUser: ChatMsg[] = hideUser ? prior : [...prior, { role: 'user', content }]
    // Start with one empty assistant bubble; we may add more as we encounter SEP
    let working: ChatMsg[] = [...visibleAfterUser, { role: 'assistant', content: '' }]
    setMsgs(working)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, plainText: true, skipRag }),
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
          // Split current accumulated text by SEP and render as separate bubbles
          const parts = acc.split(SEP)
          working = [
            ...visibleAfterUser,
            ...parts.map(p => ({ role: 'assistant' as const, content: p.trim() })),
          ]
          setMsgs(working)
        }
      }
    } catch {
      setMsgs(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: 'Erro ao conectar com a MIA. Tente novamente.' } : m))
    } finally {
      setStreaming(false)
      setShowSuggestions(true)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const texto = input.trim()
    if (!texto || streaming) return
    setInput('')
    streamChunked(texto, msgs, false, false)
  }

  function askSuggestion(q: string) {
    if (streaming) return
    streamChunked(q, msgs, false, false)
  }

  const suggestions = suggestionsFor(exp?.problema)

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

        <section className="diag-chat">
          <div className="diag-chat-head">
            <div className="diag-chat-ic"><Sparkles size={20} strokeWidth={1.8} /></div>
            <div>
              <h2>Análise da MIA</h2>
              <p>Diagnóstico técnico baseado no que você imprimiu.</p>
            </div>
          </div>

          <div className="diag-chat-body">
            {msgs.length === 0 && (
              <div className="diag-msg assistant">
                <div className="diag-msg-ic"><Sparkles size={14} strokeWidth={1.8} /></div>
                <div className="diag-msg-content"><span className="diag-typing"><span /><span /><span /></span></div>
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
            {showSuggestions && !streaming && suggestions.length > 0 && (
              <div className="diag-suggestions">
                <p className="diag-sugg-label">Continuar com a MIA</p>
                <div className="diag-sugg-row">
                  {suggestions.map((q, i) => (
                    <button key={i} type="button" className="diag-sugg-btn" onClick={() => askSuggestion(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, idx) => {
    if (!line.trim()) return <p key={idx} className="diag-blank">&nbsp;</p>
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

  .diag-context{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    backdrop-filter:blur(18px);
    border-radius:20px;padding:24px;overflow-y:auto;
  }
  .diag-ctx-head{margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--border-glass)}
  .diag-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint) !important}
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
  .diag-block-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-faint) !important;margin-bottom:8px}
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
    display:flex;flex-direction:column;gap:14px;
  }
  .diag-msg{display:flex;gap:10px;max-width:86%}
  .diag-msg.user{align-self:flex-end;flex-direction:row-reverse}
  .diag-msg-ic{
    width:28px;height:28px;border-radius:50%;
    background:var(--icon-tint);color:var(--accent-em);
    display:grid;place-items:center;flex-shrink:0;
  }
  .diag-msg-content{
    background:var(--surface-glass-strong) !important;
    border:1px solid var(--border-glass-strong) !important;
    border-radius:16px;padding:14px 18px;
    font-size:14px;line-height:1.55;color:var(--text-main) !important;
  }
  .diag-msg.user .diag-msg-content{
    background:var(--accent) !important;color:var(--accent-text-on) !important;border-color:transparent;
  }
  .diag-msg-content p{margin:0 0 6px}
  .diag-msg-content p:last-child{margin-bottom:0}
  .diag-msg-content p.diag-blank{margin:0;line-height:.5}
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

  .diag-suggestions{
    margin:6px 0 0 38px;display:flex;flex-direction:column;gap:8px;
    animation:diagfade .4s ease;
  }
  @keyframes diagfade{from{opacity:0;transform:translateY(6px)}}
  .diag-sugg-label{
    margin:0 0 4px;font-size:11px;letter-spacing:.14em;
    text-transform:uppercase;color:var(--text-faint) !important;
  }
  .diag-sugg-row{display:flex;flex-wrap:wrap;gap:8px}
  .diag-sugg-btn{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--accent-em) !important;
    padding:9px 14px;border-radius:999px;
    font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;
    transition:.15s;backdrop-filter:blur(12px);
    text-align:left;
  }
  .diag-sugg-btn:hover{background:var(--accent) !important;color:var(--accent-text-on) !important;border-color:transparent;transform:translateY(-1px)}

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
