'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Sparkles, Plus, Trash2, CheckCircle, Save, ArrowRight, X, ExternalLink } from 'lucide-react'

type Modo = 'escolha' | 'wizard_app' | 'wizard_tendencias' | 'wizard_ingredientes' | 'wizard_processando' | 'wizard_resultado' | 'input' | 'validar'

interface Ingrediente {
  nome: string
  percentual: string
  funcao: string
}

const FUNCOES = ['Estruturante', 'Hidrocolóide', 'Plastificante', 'Emulsificante', 'Aromatizante', 'Corante', 'Conservante', 'Proteína', 'Lipídio', 'Carboidrato', 'Líquidos', 'Outro']

const APLICACOES = [
  { id: 'snacks', nome: 'Snacks e Conveniência', desc: 'Snacks crocantes, biscoitos recheados e barras funcionais.', emoji: '🍪' },
  { id: 'massas', nome: 'Massas e Grãos', desc: 'Massas frescas ou secas com texturas de extrusão exclusivas.', emoji: '🍝' },
  { id: 'proteinas', nome: 'Proteínas e Análogos', desc: 'Soluções plant-based e híbridas com estrutura fibrosa.', emoji: '🥩' },
  { id: 'laticinios', nome: 'Laticínios e Sobremesas', desc: 'Iogurtes, queijos vegetais e sobremesas com estabilidade térmica.', emoji: '🍦' },
  { id: 'nutraceuticos', nome: 'Nutracêuticos', desc: 'Suplementos bioativos em formatos inovadores.', emoji: '💊' },
]

const TENDENCIAS = ['Alto em Proteína', 'Sem Glúten', 'Funcional / Bioativo', 'Vegano', 'Sem Lactose', 'Alto em Fibra', 'Low Carb']

const INGREDIENTES_SUGERIDOS: Record<string, string[]> = {
  snacks: ['Farinha de arroz', 'Proteína de ervilha', 'Xantana', 'Lecitina de girassol'],
  massas: ['Farinha de trigo', 'Glúten vital', 'Goma guar', 'Azeite de oliva'],
  proteinas: ['Proteína de soja', 'Metilcelulose', 'Beterraba em pó', 'Óleo de coco'],
  laticinios: ['Proteína do leite', 'Carragena', 'Goma de alfarroba', 'Amido modificado'],
  nutraceuticos: ['Spirulina', 'Cúrcuma', 'Quinoa Real', 'Maca Peruana'],
}

const DICAS_MIA: Record<string, string> = {
  snacks: 'Snacks e Conveniência está crescendo 12% em plant-based este mês.',
  massas: 'Massas com proteína vegetal têm 3x mais engajamento em 2024.',
  proteinas: 'Proteínas análogas lideram pesquisas de impressão 3D alimentar.',
  laticinios: 'Sobremesas personalizadas têm alto valor percebido pelo consumidor.',
  nutraceuticos: 'Nutraceuticos em formas impressas aumentam a biodisponibilidade.',
}

export default function FormularPage() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>('escolha')
  const [aplicacao, setAplicacao] = useState('')
  const [tendencias, setTendencias] = useState<string[]>([])
  const [ingredientesWizard, setIngredientesWizard] = useState<string[]>([])
  const [buscaIngrediente, setBuscaIngrediente] = useState('')
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([{ nome: '', percentual: '', funcao: 'Estruturante' }])
  const [nomeFormulacao, setNomeFormulacao] = useState('')
  const [validando, setValidando] = useState(false)
  const [validacao, setValidacao] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  function toggleTendencia(t: string) {
    setTendencias(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function addIngredienteWizard(nome: string) {
    if (!nome.trim() || ingredientesWizard.includes(nome)) return
    setIngredientesWizard(prev => [...prev, nome])
    setBuscaIngrediente('')
  }

  function removeIngredienteWizard(nome: string) {
    setIngredientesWizard(prev => prev.filter(i => i !== nome))
  }

  async function gerarComMIA() {
    setModo('wizard_processando')
    const appLabel = APLICACOES.find(a => a.id === aplicacao)?.nome ?? aplicacao
    const prompt = `Crie uma formulação para impressão 3D de alimentos com as seguintes especificações:
- Aplicação: ${appLabel}
- Tendências nutricionais: ${tendencias.length > 0 ? tendencias.join(', ') : 'nenhuma especificada'}
- Ingredientes base desejados: ${ingredientesWizard.length > 0 ? ingredientesWizard.join(', ') : 'a sua escolha'}

Retorne APENAS um JSON no formato exato (sem texto adicional):
{"nome_sugerido":"nome da formulação","ingredientes":[{"nome":"ingrediente","percentual":0,"funcao":"Estruturante"}],"observacoes":"análise técnica curta"}`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], noTools: true }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let texto = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          for (const line of chunk.split('\n')) {
            if (line.startsWith('0:')) { try { texto += JSON.parse(line.slice(2)) } catch { /* skip */ } }
          }
        }
      }
      const jsonMatch = texto.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setNomeFormulacao(parsed.nome_sugerido ?? '')
        setIngredientes((parsed.ingredientes ?? []).map((i: { nome: string; percentual: number; funcao: string }) => ({
          nome: i.nome,
          percentual: String(i.percentual),
          funcao: i.funcao,
        })))
        setValidacao(parsed.observacoes ?? null)
      }
    } catch { /* usa defaults */ }
    setModo('wizard_resultado')
  }

  function addIngrediente() {
    setIngredientes(prev => [...prev, { nome: '', percentual: '', funcao: 'Outro' }])
  }

  function removeIngrediente(i: number) {
    setIngredientes(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateIngrediente(i: number, field: keyof Ingrediente, value: string) {
    setIngredientes(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  async function validarFormulacao() {
    setValidando(true)
    setValidacao(null)
    const lista = ingredientes.filter(i => i.nome.trim()).map(i => `${i.nome} (${i.percentual}%, ${i.funcao})`).join('; ')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Valide esta formulação para impressão 3D de alimentos: ${lista}. Analise: total de sólidos, balanço hidrocolóides, viabilidade de extrusão, pontos críticos e sugestões. Seja direto e técnico.` }] }),
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
      setValidacao(texto || 'Formulação analisada.')
    } catch { setValidacao('Erro ao validar.') }
    setValidando(false)
    setModo('validar')
  }

  async function salvarFormulacao() {
    if (!nomeFormulacao.trim()) return
    setSalvando(true)
    await fetch('/api/formulacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeFormulacao,
        ingredientes: ingredientes.filter(i => i.nome.trim()).map(i => ({ nome: i.nome, percentual: parseFloat(i.percentual) || 0, funcao: i.funcao })),
        observacoes: validacao || '',
        resultado: null,
        parametros: {},
      }),
    })
    setSalvando(false)
    router.push('/formulacoes')
  }

  // --- TELA INICIAL ---
  if (modo === 'escolha') return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Formular</h1>
        <p className="text-sm text-[#58413c] mt-1">Ponto de partida do fluxo MIA. Insira ou crie sua formulação.</p>
      </div>
      <div className="max-w-2xl mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setModo('input')} className="bg-white rounded-2xl shadow-tonal p-6 text-left group">
            <FlaskConical size={28} className="text-[#003223] mb-4" />
            <h2 className="font-semibold text-base mb-1">Tenho uma formulação</h2>
            <p className="text-sm text-[#58413c]">Insira os ingredientes e percentuais para validar e salvar.</p>
            <div className="flex items-center gap-1 text-[#003223] text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Inserir <ArrowRight size={12} /></div>
          </button>
          <button onClick={() => setModo('wizard_app')} className="bg-white rounded-2xl shadow-tonal p-6 text-left group">
            <Sparkles size={28} className="text-[#003223] mb-4" />
            <h2 className="font-semibold text-base mb-1">Criar com a MIA</h2>
            <p className="text-sm text-[#58413c]">Deixe a MIA sugerir uma formulação otimizada para sua aplicação.</p>
            <div className="flex items-center gap-1 text-[#003223] text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Iniciar guia <ArrowRight size={12} /></div>
          </button>
        </div>
      </div>
    </div>
  )

  // --- WIZARD: APLICAÇÃO ---
  if (modo === 'wizard_app') return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <WizardHeader passo={1} total={3} onVoltar={() => setModo('escolha')} />
        <h2 className="text-lg font-semibold mb-1">Escolha a sua aplicação</h2>
        <p className="text-sm text-[#58413c] mb-6">Selecione o segmento para o qual deseja desenvolver sua formulação.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {APLICACOES.map(a => (
            <button key={a.id} onClick={() => setAplicacao(a.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${aplicacao === a.id ? 'border-[#e5d9c1] bg-[rgba(0,50,35,0.08)]' : 'border-[#e5d9c1] bg-[#fff2da] hover:border-[#e5d9c1]'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <p className="font-medium text-sm">{a.nome}</p>
                  <p className="text-xs text-[#58413c] mt-0.5">{a.desc}</p>
                </div>
                {aplicacao === a.id && <CheckCircle size={14} className="text-[#003223] ml-auto flex-shrink-0 mt-0.5" />}
              </div>
            </button>
          ))}
        </div>
        {aplicacao && (
          <div className="bg-[#fff2da] border border-[#e5d9c1] rounded-lg p-3 mb-5 flex gap-2">
            <Sparkles size={13} className="text-[#003223] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#58413c]"><span className="text-[#003223] font-medium">MIA Intelligence: </span>{DICAS_MIA[aplicacao]}</p>
          </div>
        )}
        <button onClick={() => setModo('wizard_tendencias')} disabled={!aplicacao}
          className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          Próximo Passo <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )

  // --- WIZARD: TENDÊNCIAS ---
  if (modo === 'wizard_tendencias') return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <WizardHeader passo={2} total={3} onVoltar={() => setModo('wizard_app')} />
        <h2 className="text-lg font-semibold mb-1">Tendências nutricionais</h2>
        <p className="text-sm text-[#58413c] mb-1">Selecione as tendências desejadas <span className="text-xs">(opcional)</span></p>
        {tendencias.length > 0 && tendencias.includes('Alto em Proteína') && tendencias.includes('Vegano') && (
          <div className="bg-[#fff2da] border border-[#e5d9c1] rounded-lg p-3 mb-4 flex gap-2">
            <Sparkles size={13} className="text-[#003223] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#58413c]"><span className="text-[#003223] font-medium">Dica da MIA: </span>Formular com &quot;Alto em Proteína&quot; e &quot;Vegano&quot; priorizará micro-proteínas de ervilha e sementes de girassol.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          {TENDENCIAS.map(t => (
            <button key={t} onClick={() => toggleTendencia(t)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${tendencias.includes(t) ? 'border-[#e5d9c1] bg-[rgba(0,50,35,0.08)] text-[#003223]' : 'border-[#e5d9c1] text-[#58413c] hover:border-[#e5d9c1]'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setModo('wizard_ingredientes')}
          className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          Próximo <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )

  // --- WIZARD: INGREDIENTES ---
  if (modo === 'wizard_ingredientes') return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <WizardHeader passo={3} total={3} onVoltar={() => setModo('wizard_tendencias')} />
        <h2 className="text-lg font-semibold mb-1">Ingrediente(s) base</h2>
        <p className="text-sm text-[#58413c] mb-4">Selecione os elementos fundamentais. A MIA irá otimizar a formulação completa.</p>
        <div className="flex gap-2 mb-3">
          <input value={buscaIngrediente} onChange={e => setBuscaIngrediente(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIngredienteWizard(buscaIngrediente)}
            placeholder="Ex: cenoura, batata-doce, proteína de ervilha..."
            className="flex-1 bg-white rounded-2xl shadow-tonal px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
          <button onClick={() => addIngredienteWizard(buscaIngrediente)} disabled={!buscaIngrediente.trim()}
            className="flex items-center gap-1.5 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(INGREDIENTES_SUGERIDOS[aplicacao] ?? []).filter(s => !ingredientesWizard.includes(s)).map(s => (
            <button key={s} onClick={() => addIngredienteWizard(s)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e5d9c1] text-xs text-[#58413c] hover:border-[#e5d9c1] hover:text-[#003223] transition-colors">
              <Plus size={10} /> {s}
            </button>
          ))}
        </div>
        {ingredientesWizard.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {ingredientesWizard.map(i => (
              <span key={i} className="flex items-center gap-1.5 bg-[rgba(0,50,35,0.08)] border border-[#e5d9c1] text-[#003223] text-xs px-3 py-1.5 rounded-full">
                {i}
                <button onClick={() => removeIngredienteWizard(i)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={gerarComMIA}
            className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            <Sparkles size={14} /> Gerar com MIA
          </button>
        </div>
      </div>
    </div>
  )

  // --- WIZARD: PROCESSANDO ---
  if (modo === 'wizard_processando') return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#e5d9c1] flex items-center justify-center">
            <FlaskConical size={32} className="text-[#003223] animate-pulse" />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[rgba(0,50,35,0.1)] animate-bounce" />
          <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-[rgba(0,50,35,0.1)] animate-bounce delay-150" />
        </div>
        <h2 className="text-lg font-semibold mb-2">MIA está formulando...</h2>
        <p className="text-sm text-[#58413c] mb-4">Buscando referências e calculando parâmetros</p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#58413c]">
          {['Ajustando viscosidade', 'Sinergia de bioativos', 'Teste de estabilidade'].map((s, i) => (
            <span key={s} className={`px-2 py-1 rounded border border-[#e5d9c1] ${i === 0 ? 'text-[#003223] border-[#e5d9c1]' : ''}`}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )

  // --- WIZARD: RESULTADO / INPUT MANUAL ---
  if (modo === 'wizard_resultado' || modo === 'input' || modo === 'validar') {
    const isWizard = modo === 'wizard_resultado'
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setModo(isWizard ? 'wizard_ingredientes' : 'escolha')} className="text-xs text-[#58413c] hover:text-[#211b0c] transition-colors">← Voltar</button>
            <h1 className="text-xl font-semibold">{isWizard ? 'Formulação sugerida pela MIA' : 'Inserir formulação'}</h1>
            {isWizard && (
              <a href="/chat" target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#003223] border border-[#e5d9c1] hover:border-[#e5d9c1] px-3 py-1.5 rounded-md transition-colors">
                <ExternalLink size={11} /> Chat com MIA
              </a>
            )}
          </div>

          {isWizard && validacao && (
            <div className="bg-[#fff2da] border border-[#e5d9c1] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[#003223]" />
                <span className="text-xs font-medium text-[#003223]">Análise MIA</span>
              </div>
              <p className="text-sm text-[#58413c] leading-relaxed">{validacao}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-tonal p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">Ingredientes {isWizard && <span className="text-xs text-[#58413c] font-normal ml-1">(você pode editar)</span>}</h2>
              <span className="text-xs text-[#58413c]">Total: {ingredientes.reduce((acc, i) => acc + (parseFloat(i.percentual) || 0), 0).toFixed(1)}%</span>
            </div>
            <div className="space-y-2">
              {ingredientes.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_140px_32px] gap-2 items-center">
                  <input value={ing.nome} onChange={e => updateIngrediente(i, 'nome', e.target.value)} placeholder="Ingrediente"
                    className="bg-[#fff8f1] border border-[#e5d9c1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
                  <div className="relative">
                    <input value={ing.percentual} onChange={e => updateIngrediente(i, 'percentual', e.target.value)} placeholder="0" type="number" min="0" max="100"
                      className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#58413c]">%</span>
                  </div>
                  <select value={ing.funcao} onChange={e => updateIngrediente(i, 'funcao', e.target.value)}
                    className="bg-[#fff8f1] border border-[#e5d9c1] rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30">
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button onClick={() => removeIngrediente(i)} disabled={ingredientes.length === 1} className="text-[#58413c] hover:text-red-400 disabled:opacity-20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addIngrediente} className="mt-3 flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#003223] transition-colors">
              <Plus size={13} /> Adicionar ingrediente
            </button>
          </div>

          {!isWizard && validacao && (
            <div className="bg-[#fff2da] border border-[#e5d9c1] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="text-[#003223]" />
                <span className="text-sm font-medium">Análise da MIA</span>
              </div>
              <p className="text-sm text-[#58413c] leading-relaxed whitespace-pre-wrap">{validacao}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-tonal p-5 mb-4">
            <h2 className="text-sm font-medium mb-3">Salvar formulação</h2>
            <div className="flex gap-3">
              <input value={nomeFormulacao} onChange={e => setNomeFormulacao(e.target.value)} placeholder="Nome da formulação (ex: Pasta de batata-doce v1)"
                className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30" />
              <button onClick={salvarFormulacao} disabled={!nomeFormulacao.trim() || salvando}
                className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors">
                <Save size={14} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {!isWizard && modo !== 'validar' && (
            <button onClick={validarFormulacao} disabled={validando || !ingredientes.some(i => i.nome.trim())}
              className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
              <Sparkles size={14} /> {validando ? 'Validando...' : 'Validar com MIA'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

function WizardHeader({ passo, total, onVoltar }: { passo: number; total: number; onVoltar: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button onClick={onVoltar} className="text-xs text-[#58413c] hover:text-[#211b0c] transition-colors">← Voltar</button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i < passo ? 'w-8 bg-[#003223]' : 'w-4 bg-[#e5d9c1]'}`} />
        ))}
      </div>
      <span className="text-xs text-[#58413c]">{passo}/{total}</span>
    </div>
  )
}
