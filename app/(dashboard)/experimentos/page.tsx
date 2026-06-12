'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  CheckCircle2, AlertCircle, XCircle,
  Plus, Download, Trash2, ChevronDown, ChevronUp,
  Sparkles, Calendar, Loader2, Wifi, Pencil,
} from 'lucide-react'
import Link from 'next/link'

interface Ingrediente { nome: string; percentual: number | string; funcao: string }
interface Formulacao {
  id: string
  nome: string
  parametros?: Record<string, unknown> | null
  ingredientes?: Ingrediente[]
}
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

// Linguagem acessível com termo técnico associado, p/ acadêmicos e leigos
const PROBLEMAS_FALHA = [
  { id: 'A massa entupiu no bico',               tech: 'Material não extrusou' },
  { id: 'A peça desabou enquanto imprimia',      tech: 'Colapso estrutural' },
  { id: 'O filete saiu irregular ou cortando',   tech: 'Filamento inconsistente' },
  { id: 'As camadas não grudaram entre si',      tech: 'Baixa adesão entre camadas' },
  { id: 'A peça deformou depois de pronta',      tech: 'Deformação pós-impressão' },
  { id: 'Apareceram bolhas ou furos no material', tech: 'Bolhas ou vazios' },
  { id: 'A temperatura saiu do esperado',         tech: 'Desvio térmico' },
  { id: 'Outro',                                  tech: 'Descrição livre' },
]

const PROBLEMAS_PARCIAL = [
  { id: 'Imprimiu, mas quebrou ao retirar',      tech: 'Fragilidade estrutural' },
  { id: 'Imprimiu, mas perdeu a forma',          tech: 'Relaxamento pós-deposição' },
  { id: 'Imprimiu pela metade',                  tech: 'Interrupção de processo' },
  { id: 'Textura ficou diferente do esperado',   tech: 'Inconsistência sensorial' },
  { id: 'Outro',                                  tech: 'Descrição livre' },
]

function calcularNutri(ingredientes: Ingrediente[] | undefined, pesoG: number) {
  if (!ingredientes?.length || !pesoG) return null
  let carb = 0, prot = 0, gord = 0, fibra = 0, umid = 0
  const total = ingredientes.reduce((s, i) => s + Number(i.percentual || 0), 0) || 100
  for (const ing of ingredientes) {
    const frac = Number(ing.percentual || 0) / total
    const fn = (ing.funcao || '').toLowerCase()
    if (fn.includes('estruturante') || fn.includes('carboidrato') || fn.includes('amido')) { carb += frac * 70; umid += frac * 20 }
    else if (fn.includes('proteína')) { prot += frac * 80; umid += frac * 10 }
    else if (fn.includes('lipídio') || fn.includes('gordura')) { gord += frac * 90 }
    else if (fn.includes('hidrocolóide') || fn.includes('fibra')) { fibra += frac * 60; umid += frac * 30 }
    else { carb += frac * 30; umid += frac * 60 }
  }
  const kcal = Math.round(carb * 4 + prot * 4 + gord * 9)
  const ratio = pesoG / 100
  return {
    kcal: Math.round(kcal * ratio),
    carb: (carb * ratio).toFixed(1),
    prot: (prot * ratio).toFixed(1),
    gord: (gord * ratio).toFixed(1),
    fibra: (fibra * ratio).toFixed(1),
    umid: Math.min(umid * ratio, pesoG * 0.85).toFixed(1),
  }
}

export default function ExperimentosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [experimentos, setExperimentos] = useState<Experimento[]>([])
  const [novoAberto, setNovoAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)

  // form state
  const [formulacaoId, setFormulacaoId] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState<Resultado>('sucesso')
  const [problemaSel, setProblemaSel] = useState('')
  const [outroTexto, setOutroTexto] = useState('')
  const [pesoImpresso, setPesoImpresso] = useState('')
  const [obs, setObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [incluirNutri, setIncluirNutri] = useState(true)
  const [incluirParametros, setIncluirParametros] = useState(true)

  const formulacaoSelecionada = useMemo(
    () => formulacoes.find(f => f.id === formulacaoId),
    [formulacoes, formulacaoId]
  )
  const parametrosSugeridos = formulacaoSelecionada?.parametros || null
  const tabelaNutri = useMemo(
    () => formulacaoSelecionada && pesoImpresso
      ? calcularNutri(formulacaoSelecionada.ingredientes, parseFloat(pesoImpresso))
      : null,
    [formulacaoSelecionada, pesoImpresso]
  )

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
    const i = setInterval(() => fetch('/api/experimentos').then(r => r.json()).then(d => setExperimentos(d || [])), 15000)
    return () => clearInterval(i)
  }, [carregar])

  const problemasAtuais = resultado === 'falha' ? PROBLEMAS_FALHA : resultado === 'parcial' ? PROBLEMAS_PARCIAL : []

  function resetForm() {
    setFormulacaoId('')
    setData(new Date().toISOString().split('T')[0])
    setResultado('sucesso')
    setProblemaSel('')
    setOutroTexto('')
    setPesoImpresso('')
    setObs('')
    setIncluirNutri(true)
    setIncluirParametros(true)
  }

  function abrirEdicao(exp: Experimento) {
    setEditandoId(exp.id)
    setFormulacaoId(exp.formulacao_id || '')
    setData(exp.data || new Date().toISOString().split('T')[0])
    setResultado((exp.resultado === 'pendente' ? 'sucesso' : exp.resultado) as Resultado)
    setProblemaSel(exp.problema && (PROBLEMAS_FALHA.some(p => p.id === exp.problema) || PROBLEMAS_PARCIAL.some(p => p.id === exp.problema)) ? exp.problema : exp.problema ? 'Outro' : '')
    setOutroTexto(exp.problema && !PROBLEMAS_FALHA.some(p => p.id === exp.problema) && !PROBLEMAS_PARCIAL.some(p => p.id === exp.problema) ? exp.problema : '')
    setPesoImpresso(exp.peso_impresso_g ? String(exp.peso_impresso_g) : '')
    const obsMatch = exp.descricao?.match(/OBSERVAÇÕES:\n([\s\S]*?)(?:\n\n|$)/)
    setObs(obsMatch ? obsMatch[1].trim() : '')
    setIncluirParametros(!!exp.descricao?.includes('PARÂMETROS DE IMPRESSÃO'))
    setIncluirNutri(!!exp.descricao?.includes('TABELA NUTRICIONAL'))
    setNovoAberto(true)
    setExpandido(null)
  }

  async function registrar() {
    if (!formulacaoId) return
    setSalvando(true)
    const form = formulacaoSelecionada

    let resultadoTexto = ''
    if (resultado === 'sucesso') {
      resultadoTexto = 'Impressão bem-sucedida.'
    } else {
      const escolhido = problemaSel === 'Outro' ? outroTexto.trim() : problemaSel
      resultadoTexto = escolhido || 'Sem detalhamento.'
    }

    const blocos: string[] = []
    if (incluirParametros && parametrosSugeridos && Object.keys(parametrosSugeridos).length) {
      blocos.push('PARÂMETROS DE IMPRESSÃO:\n' + Object.entries(parametrosSugeridos)
        .map(([k, v]) => `  ${k}: ${v}`).join('\n'))
    }
    if (incluirNutri && tabelaNutri && pesoImpresso) {
      blocos.push(`TABELA NUTRICIONAL (${pesoImpresso} g):\n  Energia: ${tabelaNutri.kcal} kcal\n  Carboidratos: ${tabelaNutri.carb} g\n  Proteínas: ${tabelaNutri.prot} g\n  Gorduras: ${tabelaNutri.gord} g\n  Fibras: ${tabelaNutri.fibra} g\n  Umidade: ${tabelaNutri.umid} g`)
    }
    if (obs.trim()) {
      blocos.push('OBSERVAÇÕES:\n' + obs.trim())
    }

    const payload = {
      formulacao_id: formulacaoId,
      formulacao_nome: form?.nome ?? 'Formulação',
      data,
      resultado,
      problema: resultado === 'sucesso' ? undefined : resultadoTexto,
      descricao: blocos.length ? blocos.join('\n\n') : undefined,
      peso_impresso_g: pesoImpresso ? parseFloat(pesoImpresso) : undefined,
    }

    if (editandoId) {
      await fetch('/api/experimentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editandoId, ...payload }),
      })
    } else {
      await fetch('/api/experimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    await carregar()
    resetForm()
    setEditandoId(null)
    setNovoAberto(false)
    setSalvando(false)
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
      `[${e.data}] ${e.formulacao_nome ?? e.gcode_filename ?? 'Sem nome'}\n` +
      `Resultado: ${e.resultado === 'sucesso' ? 'Sucesso' : e.problema ?? e.resultado}\n` +
      (e.descricao ? `${e.descricao}\n` : '') +
      (e.peso_impresso_g ? `Peso: ${e.peso_impresso_g}g\n` : '') + '---'
    ).join('\n')
    const blob = new Blob([`Histórico de experimentos | MIA · Morphê Foods\n${new Date().toLocaleString('pt-BR')}\n\n${linhas}`], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `experimentos_${Date.now()}.txt`
    a.click()
  }

  return (
    <>
      <style>{EXP_CSS}</style>

      <div className="exp-head">
        <div>
          <p className="exp-sub">Registre suas impressões. A MIA usa esses dados para diagnosticar e sugerir ajustes nas próximas tentativas.</p>
        </div>
        <div className="exp-actions">
          {experimentos.length > 0 && (
            <button className="btn-ghost" onClick={baixarHistorico}>
              <Download size={14} strokeWidth={1.8} /> Histórico
            </button>
          )}
          <button className="btn-accent" onClick={() => setNovoAberto(!novoAberto)}>
            <Plus size={14} strokeWidth={2} /> Registrar experimento
          </button>
        </div>
      </div>

      {/* Form */}
      {novoAberto && (
        <div className="form-card">
          <h3 className="form-title">{editandoId ? 'Editar experimento' : 'Novo experimento'}</h3>

          <div className="row-2">
            <div className="field">
              <label>Qual formulação você imprimiu?</label>
              <CustomSelect
                value={formulacaoId}
                options={formulacoes.map(f => ({ value: f.id, label: f.nome }))}
                placeholder="Selecione uma formulação…"
                onChange={setFormulacaoId}
              />
            </div>
            <div className="field">
              <label>Data da impressão</label>
              <div className="input-wrap">
                <Calendar size={14} strokeWidth={1.8} className="input-icon" />
                <input type="date" value={data} onChange={e => setData(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="field">
            <label>Como foi o resultado da impressão?</label>
            <div className="result-tabs">
              <button
                type="button"
                onClick={() => { setResultado('sucesso'); setProblemaSel(''); setOutroTexto('') }}
                className={`result-tab sucesso ${resultado === 'sucesso' ? 'active' : ''}`}
              >
                <CheckCircle2 size={16} strokeWidth={1.8} /> Sucesso
              </button>
              <button
                type="button"
                onClick={() => { setResultado('parcial'); setProblemaSel('') }}
                className={`result-tab parcial ${resultado === 'parcial' ? 'active' : ''}`}
              >
                <AlertCircle size={16} strokeWidth={1.8} /> Parcial
              </button>
              <button
                type="button"
                onClick={() => { setResultado('falha'); setProblemaSel('') }}
                className={`result-tab falha ${resultado === 'falha' ? 'active' : ''}`}
              >
                <XCircle size={16} strokeWidth={1.8} /> Falha
              </button>
            </div>
          </div>

          {/* Problem options */}
          {problemasAtuais.length > 0 && (
            <div className="field">
              <label>O que aconteceu? <span className="hint">(Selecione a opção que mais se aproxima)</span></label>
              <div className="problem-list">
                {problemasAtuais.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setProblemaSel(p.id === problemaSel ? '' : p.id)}
                    className={`problem-item ${problemaSel === p.id ? 'active' : ''}`}
                  >
                    <span className="problem-label">{p.id}</span>
                    <span className="problem-tech">{p.tech}</span>
                  </button>
                ))}
              </div>
              {problemaSel === 'Outro' && (
                <div className="outro-wrap">
                  <textarea
                    value={outroTexto}
                    onChange={e => setOutroTexto(e.target.value)}
                    rows={3}
                    placeholder="Descreva o que aconteceu na impressão. A MIA vai analisar essa descrição quando você acessar o diagnóstico."
                  />
                  <p className="outro-hint">
                    <Sparkles size={12} strokeWidth={1.8} /> A MIA vai gerar o diagnóstico a partir dessa descrição na aba de análise.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Parameters used */}
          {formulacaoSelecionada && (
            <div className="field">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={incluirParametros}
                  onChange={e => setIncluirParametros(e.target.checked)}
                />
                <span>Incluir parâmetros de impressão usados</span>
              </label>
              {incluirParametros && (
                parametrosSugeridos && Object.keys(parametrosSugeridos).length > 0 ? (
                  <div className="block-info">
                    <div className="block-info-title">Parâmetros sugeridos pela MIA para essa formulação</div>
                    <div className="block-info-grid">
                      {Object.entries(parametrosSugeridos).map(([k, v]) => (
                        <div key={k} className="param-row">
                          <span className="param-k">{k}</span>
                          <span className="param-v">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="block-empty">Essa formulação ainda não tem parâmetros calculados. Você pode definir em <a href="/parametros">Parâmetros</a> e voltar aqui.</p>
                )
              )}
            </div>
          )}

          {/* Nutritional table */}
          <div className="field">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={incluirNutri}
                onChange={e => setIncluirNutri(e.target.checked)}
              />
              <span>Incluir tabela nutricional</span>
            </label>
            {incluirNutri && (
              <>
                <div className="input-wrap">
                  <input
                    type="number"
                    value={pesoImpresso}
                    onChange={e => setPesoImpresso(e.target.value)}
                    placeholder="Digite aqui o peso do produto impresso (em gramas)"
                    min={0}
                    step={0.1}
                  />
                </div>
                {tabelaNutri && (
                  <div className="block-info">
                    <div className="block-info-title">Calculado para {pesoImpresso} g</div>
                    <div className="block-info-grid grid-3">
                      <div className="nutri-cell"><span>Energia</span><b>{tabelaNutri.kcal} kcal</b></div>
                      <div className="nutri-cell"><span>Carboidratos</span><b>{tabelaNutri.carb} g</b></div>
                      <div className="nutri-cell"><span>Proteínas</span><b>{tabelaNutri.prot} g</b></div>
                      <div className="nutri-cell"><span>Gorduras</span><b>{tabelaNutri.gord} g</b></div>
                      <div className="nutri-cell"><span>Fibras</span><b>{tabelaNutri.fibra} g</b></div>
                      <div className="nutri-cell"><span>Umidade</span><b>{tabelaNutri.umid} g</b></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Observações */}
          <div className="field">
            <label>Observações <span className="hint">(opcional)</span></label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={3}
              placeholder="Algo a mais que você queira anotar sobre essa impressão."
            />
          </div>

          <div className="actions">
            <button
              type="button"
              disabled={salvando || !formulacaoId}
              onClick={registrar}
              className="btn-accent"
            >
              {salvando ? <><Loader2 size={14} className="spin" /> Salvando…</> : (editandoId ? <>Salvar alterações</> : <>Registrar experimento</>)}
            </button>
            <button type="button" onClick={() => { setNovoAberto(false); setEditandoId(null); resetForm() }} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {carregando ? (
        <div className="exp-empty"><Loader2 size={20} className="spin" /></div>
      ) : experimentos.length === 0 ? (
        <div className="exp-empty">
          <p>Você ainda não registrou nenhum experimento.</p>
          <button onClick={() => setNovoAberto(true)} className="btn-accent">
            <Plus size={14} strokeWidth={2} /> Registrar o primeiro
          </button>
        </div>
      ) : (
        <div className="exp-list">
          {experimentos.map(exp => {
            const aberto = expandido === exp.id
            const isPendente = exp.resultado === 'pendente'
            return (
              <div key={exp.id} className={`exp-row r-${exp.resultado}`}>
                <button
                  className="exp-row-head"
                  onClick={() => setExpandido(aberto ? null : exp.id)}
                >
                  <div className="exp-row-left">
                    {exp.origem === 'agent'
                      ? <span className="r-pill r-agent"><Wifi size={13} /> Do Slicer</span>
                      : <ResultPill resultado={exp.resultado} />}
                    <div>
                      <p className="exp-name">{exp.formulacao_nome ?? exp.gcode_filename ?? 'Experimento'}</p>
                      <p className="exp-meta">
                        {exp.data}
                        {exp.peso_impresso_g ? ` · ${exp.peso_impresso_g}g` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="exp-row-right">
                    <Link
                      href={`/experimentos/${exp.id}/diagnostico`}
                      onClick={e => e.stopPropagation()}
                      className="diag-quick"
                      title="Diagnóstico da MIA"
                    >
                      <Sparkles size={13} strokeWidth={1.8} /> Diagnóstico
                    </Link>
                    <button
                      onClick={e => { e.stopPropagation(); abrirEdicao(exp) }}
                      className="trash"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); excluir(exp.id) }}
                      className="trash"
                      aria-label="Excluir"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                    {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {aberto && (
                  <div className="exp-row-body">
                    <div className="exp-result">
                      <div className="exp-result-label">Resultado</div>
                      <div className="exp-result-text">
                        {isPendente
                          ? 'Aguardando registro do resultado.'
                          : exp.resultado === 'sucesso'
                            ? 'Impressão bem-sucedida.'
                            : exp.problema || 'Sem detalhamento.'}
                      </div>
                    </div>
                    {exp.descricao && (
                      <div className="exp-detalhes">
                        <pre>{exp.descricao}</pre>
                      </div>
                    )}
                    <div className="exp-row-cta">
                      <Link href={`/experimentos/${exp.id}/diagnostico`} className="btn-accent">
                        <Sparkles size={14} strokeWidth={1.8} /> Abrir análise completa
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  placeholder: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.cs-wrap')) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])
  return (
    <div className="cs-wrap">
      <button
        type="button"
        className={`cs-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? '' : 'cs-placeholder'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={16} strokeWidth={2} className={`cs-chev ${open ? 'rotated' : ''}`} />
      </button>
      {open && (
        <div className="cs-menu">
          {options.length === 0 ? (
            <div className="cs-empty">Nenhuma opção disponível.</div>
          ) : (
            options.map(o => (
              <button
                key={o.value}
                type="button"
                className={`cs-item ${o.value === value ? 'active' : ''}`}
                onClick={() => { onChange(o.value); setOpen(false) }}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ResultPill({ resultado }: { resultado: string }) {
  if (resultado === 'sucesso') return <span className="r-pill r-sucesso"><CheckCircle2 size={13} /> Sucesso</span>
  if (resultado === 'parcial') return <span className="r-pill r-parcial"><AlertCircle size={13} /> Parcial</span>
  if (resultado === 'falha') return <span className="r-pill r-falha"><XCircle size={13} /> Falha</span>
  return <span className="r-pill r-pendente"><Loader2 size={13} className="spin" /> Pendente</span>
}

const EXP_CSS = `
  .spin{animation:expspin 1s linear infinite}
  @keyframes expspin{to{transform:rotate(360deg)}}

  .exp-head{
    display:flex;justify-content:space-between;align-items:flex-start;
    gap:24px;margin-bottom:24px;flex-wrap:wrap;
  }
  .exp-sub{font-size:14px;color:var(--text-muted) !important;margin:0;max-width:580px;line-height:1.5}
  .exp-actions{display:flex;gap:10px;flex-shrink:0;margin-left:auto}

  /* Custom select */
  .cs-wrap{position:relative;width:100%}
  .cs-trigger{
    width:100%;display:flex;align-items:center;justify-content:space-between;
    padding:12px 14px;border-radius:12px;
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
    font-family:inherit;font-size:14px;text-align:left;cursor:pointer;
    transition:.15s;
  }
  .cs-trigger:hover{background:var(--hover-tint) !important}
  .cs-trigger.open{border-color:var(--accent) !important;box-shadow:0 0 0 4px var(--icon-tint)}
  .cs-placeholder{color:var(--text-faint) !important}
  .cs-chev{transition:transform .2s;color:var(--text-muted)}
  .cs-chev.rotated{transform:rotate(180deg)}
  .cs-menu{
    position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:30;
    background:rgba(3,56,42,.96) !important;
    border:1px solid var(--border-glass-strong) !important;
    backdrop-filter:blur(20px);
    border-radius:12px;padding:6px;max-height:280px;overflow-y:auto;
    box-shadow:0 20px 40px -16px rgba(0,0,0,.5);
  }
  .dash-root.theme-light .cs-menu{background:rgba(255,246,227,.98) !important}
  .cs-item{
    width:100%;display:block;text-align:left;
    padding:9px 12px;border-radius:8px;
    background:transparent !important;border:none;color:var(--text-main) !important;
    font-family:inherit;font-size:13.5px;cursor:pointer;
    transition:.12s;
  }
  .cs-item:hover{background:var(--hover-tint) !important}
  .cs-item.active{background:var(--accent) !important;color:var(--accent-text-on) !important;font-weight:600}
  .cs-empty{padding:18px;text-align:center;color:var(--text-faint);font-size:13px}

  .btn-accent{
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 18px;border-radius:999px;
    background:var(--accent) !important;color:var(--accent-text-on) !important;
    font-family:inherit;font-size:13.5px;font-weight:600;
    border:none;cursor:pointer;text-decoration:none;
    transition:transform .15s, box-shadow .25s;
  }
  .btn-accent:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 28px -10px var(--accent)}
  .btn-accent:disabled{opacity:.5;cursor:not-allowed}
  .btn-ghost{
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 18px;border-radius:999px;
    background:var(--surface-glass) !important;color:var(--text-main) !important;
    border:1px solid var(--border-glass-strong) !important;
    font-family:inherit;font-size:13.5px;font-weight:500;
    cursor:pointer;backdrop-filter:blur(12px);
    transition:.15s;
  }
  .btn-ghost:hover{background:var(--hover-tint) !important}

  /* Form card */
  .form-card{
    background:var(--surface-glass-strong) !important;
    border:1px solid var(--border-glass-strong) !important;
    backdrop-filter:blur(20px);
    border-radius:22px;padding:30px;margin-bottom:24px;
  }
  .form-title{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:24px;margin:0 0 22px;color:var(--text-main) !important;
  }
  .field{margin-bottom:22px}
  .field label{
    display:block;font-size:13px;font-weight:600;
    color:var(--text-main) !important;margin-bottom:10px;letter-spacing:.01em;
  }
  .field label .hint{font-weight:400;color:var(--text-faint) !important;font-size:12px;margin-left:6px}
  .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}

  .form-card select,
  .form-card input[type="date"],
  .form-card input[type="number"],
  .form-card textarea{
    width:100%;padding:12px 14px;border-radius:12px;
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
    font-family:inherit;font-size:14px;
    transition:border-color .2s, box-shadow .2s;
  }
  .form-card textarea{resize:vertical;line-height:1.5}
  .form-card select:focus,
  .form-card input:focus,
  .form-card textarea:focus{
    outline:none;border-color:var(--accent) !important;
    box-shadow:0 0 0 4px var(--icon-tint);
  }
  .form-card select option{color:var(--green-deep);background:var(--cream)}
  .form-card textarea::placeholder,
  .form-card input::placeholder{color:var(--text-faint) !important}

  .input-wrap{position:relative}
  .input-wrap .input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-faint)}
  .input-wrap input[type="date"]{padding-left:38px}

  /* Result tabs */
  .result-tabs{display:flex;gap:10px;flex-wrap:wrap}
  .result-tab{
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 18px;border-radius:14px;
    background:var(--surface-glass) !important;
    border:1.5px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
    font-family:inherit;font-size:14px;font-weight:500;
    cursor:pointer;transition:.15s;
  }
  .result-tab:hover{background:var(--hover-tint) !important}
  .result-tab.sucesso.active{
    background:var(--lime) !important;border-color:var(--lime) !important;color:var(--green-deep) !important;font-weight:600;
  }
  .result-tab.parcial.active{
    background:#f4c560 !important;border-color:#f4c560 !important;color:var(--green-deep) !important;font-weight:600;
  }
  .result-tab.falha.active{
    background:var(--orange) !important;border-color:var(--orange) !important;color:#fff !important;font-weight:600;
  }

  /* Problem list */
  .problem-list{display:flex;flex-direction:column;gap:8px}
  .problem-item{
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 16px;border-radius:12px;
    background:var(--surface-glass) !important;
    border:1.5px solid var(--border-glass) !important;
    color:var(--text-main) !important;
    font-family:inherit;font-size:14px;cursor:pointer;text-align:left;
    transition:.15s;
  }
  .problem-item:hover{background:var(--hover-tint) !important;border-color:var(--border-glass-strong) !important}
  .problem-item.active{
    background:var(--accent) !important;border-color:var(--accent) !important;color:var(--accent-text-on) !important;font-weight:600;
  }
  .problem-label{flex:1}
  .problem-tech{
    font-size:11.5px;color:var(--text-faint) !important;
    font-style:italic;letter-spacing:.02em;margin-left:14px;
  }
  .problem-item.active .problem-tech{color:rgba(3,56,42,.65) !important}
  .dash-root.theme-light .problem-item.active .problem-tech{color:rgba(255,255,255,.85) !important}

  .outro-wrap{margin-top:12px}
  .outro-hint{
    display:flex;align-items:center;gap:6px;
    font-size:12px;color:var(--accent-em) !important;margin:8px 0 0;
  }

  /* Toggle */
  .toggle-label{
    display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:12px;
  }
  .toggle-label input[type="checkbox"]{
    width:18px;height:18px;accent-color:var(--accent);cursor:pointer;
  }
  .toggle-label span{font-weight:500;color:var(--text-main) !important;font-size:14px}

  /* Info blocks */
  .block-info{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    border-radius:12px;padding:14px 16px;margin-top:10px;
  }
  .block-info-title{
    font-size:11px;letter-spacing:.16em;text-transform:uppercase;
    color:var(--text-faint) !important;margin-bottom:10px;
  }
  .block-info-grid{display:flex;flex-direction:column;gap:6px}
  .block-info-grid.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .param-row{display:flex;justify-content:space-between;font-size:13.5px}
  .param-k{color:var(--text-muted) !important;text-transform:capitalize}
  .param-v{color:var(--text-main) !important;font-weight:600}
  .nutri-cell{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    border-radius:10px;padding:10px 12px;
  }
  .nutri-cell span{display:block;font-size:11px;color:var(--text-faint) !important;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
  .nutri-cell b{font-family:var(--font-serif),serif;font-style:italic;font-size:17px;color:var(--accent-em) !important;font-weight:400}
  .block-empty{
    font-size:13px;color:var(--text-muted) !important;
    background:var(--surface-glass) !important;
    border:1px dashed var(--border-glass-strong) !important;
    border-radius:12px;padding:14px 16px;margin:0;
  }
  .block-empty a{color:var(--accent-em) !important;font-weight:600;text-decoration:none}

  .actions{display:flex;gap:10px;margin-top:8px}

  /* List */
  .exp-list{display:flex;flex-direction:column;gap:10px}
  .exp-row{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    backdrop-filter:blur(16px);
    border-radius:16px;overflow:hidden;
  }
  .exp-row-head{
    width:100%;display:flex;justify-content:space-between;align-items:center;
    padding:16px 20px;background:transparent !important;border:none;cursor:pointer;text-align:left;
  }
  .exp-row-left{display:flex;align-items:center;gap:14px;flex:1;min-width:0}
  .exp-name{font-size:14.5px;font-weight:600;color:var(--text-main) !important;margin:0}
  .exp-meta{font-size:12px;color:var(--text-faint) !important;margin:3px 0 0}
  .exp-row-right{display:flex;align-items:center;gap:8px;color:var(--text-muted)}
  .trash{background:transparent;border:none;color:var(--text-faint) !important;cursor:pointer;padding:6px;display:grid;place-items:center;border-radius:8px}
  .trash:hover{background:var(--hover-tint) !important;color:var(--orange) !important}
  .diag-quick{
    display:inline-flex;align-items:center;gap:6px;
    background:var(--icon-tint) !important;
    color:var(--accent-em) !important;
    border:1px solid var(--border-glass-strong) !important;
    padding:7px 12px;border-radius:999px;
    font-size:12px;font-weight:600;text-decoration:none;
    transition:.15s;
  }
  .diag-quick:hover{background:var(--accent) !important;color:var(--accent-text-on) !important;border-color:transparent;transform:translateY(-1px)}

  .r-pill{
    display:inline-flex;align-items:center;gap:5px;
    padding:5px 10px;border-radius:999px;font-size:11.5px;font-weight:600;
    letter-spacing:.02em;
  }
  .r-pill.r-sucesso{background:var(--lime) !important;color:var(--green-deep) !important}
  .r-pill.r-parcial{background:#f4c560 !important;color:var(--green-deep) !important}
  .r-pill.r-falha{background:var(--orange) !important;color:#fff !important}
  .r-pill.r-pendente{background:var(--surface-glass-strong) !important;color:var(--text-main) !important;border:1px solid var(--border-glass-strong)}
  .r-pill.r-agent{background:var(--surface-glass-strong) !important;color:var(--text-main) !important;border:1px solid var(--border-glass-strong)}

  .exp-row-body{
    padding:18px 20px;
    border-top:1px solid var(--border-glass);
  }
  .exp-result{margin-bottom:14px}
  .exp-result-label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint) !important;margin-bottom:6px}
  .exp-result-text{font-size:14.5px;color:var(--text-main) !important;line-height:1.5}
  .exp-detalhes{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass) !important;
    border-radius:12px;padding:14px;margin-bottom:14px;
  }
  .exp-detalhes pre{
    margin:0;font-family:inherit;font-size:13px;
    color:var(--text-muted) !important;white-space:pre-wrap;line-height:1.55;
  }
  .exp-row-cta{display:flex;gap:10px}

  .exp-empty{
    text-align:center;padding:60px 24px;color:var(--text-muted) !important;
    display:flex;flex-direction:column;align-items:center;gap:18px;
  }
  .exp-empty p{margin:0;font-size:14.5px}

  @media (max-width:900px){
    .row-2{grid-template-columns:1fr}
    .block-info-grid.grid-3{grid-template-columns:1fr 1fr}
    .problem-item{flex-direction:column;align-items:flex-start;gap:4px}
    .problem-tech{margin-left:0}
  }
`
