'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Sparkles, Plus, Trash2, CheckCircle, Save, ArrowRight, X, ExternalLink, Download, Zap } from 'lucide-react'
import { gerarSTL, baixarSTL } from '@/lib/prusa-integration'
import { useAgentConnected } from '@/lib/hooks/useAgentConnected'

type Modo = 'escolha' | 'wizard_app' | 'wizard_tendencias' | 'wizard_ingredientes' | 'wizard_processando' | 'wizard_resultado' | 'input' | 'validar' | 'stl_gerando' | 'stl_pronto'

interface Ingrediente {
  nome: string
  percentual: string
  funcao: string
}

const FUNCOES = ['Estruturante', 'Hidrocolóide', 'Plastificante', 'Emulsificante', 'Aromatizante', 'Corante', 'Conservante', 'Proteína', 'Lipídio', 'Carboidrato', 'Líquidos', 'Outro']

const APLICACOES = [
  { id: 'snacks',        nome: 'Snacks e Conveniência',   desc: 'Snacks crocantes, biscoitos recheados e barras de cereais funcionais.',               icon: 'cookie' },
  { id: 'massas',        nome: 'Massas e Grãos',          desc: 'Massas frescas ou secas com perfis nutricionais otimizados e texturas de extrusão.',  icon: 'ramen_dining' },
  { id: 'proteinas',     nome: 'Proteínas e Análogos',    desc: 'Soluções plant-based e híbridas com foco em suculência e estrutura fibrosa avançada.', icon: 'kebab_dining' },
  { id: 'laticinios',    nome: 'Laticínios e Sobremesas', desc: 'Iogurtes, queijos vegetais e sobremesas lácteas com estabilidade térmica superior.',   icon: 'icecream' },
  { id: 'nutraceuticos', nome: 'Nutracêuticos',           desc: 'Suplementos bioativos em formatos inovadores de entrega de nutrientes.',               icon: 'medication' },
  { id: 'outros',        nome: 'Outras Aplicações',       desc: 'Projetos customizados para demandas específicas de ingredientes e processos.',          icon: 'content_cut' },
]

const TENDENCIAS = ['Alto em Proteína', 'Sem Glúten', 'Funcional / Bioativo', 'Vegano', 'Sem Lactose', 'Alto em Fibra', 'Low Carb']

const INGREDIENTES_SUGERIDOS: Record<string, string[]> = {
  snacks:        ['Farinha de arroz', 'Proteína de ervilha', 'Xantana', 'Lecitina de girassol'],
  massas:        ['Farinha de trigo', 'Glúten vital', 'Goma guar', 'Azeite de oliva'],
  proteinas:     ['Proteína de soja', 'Metilcelulose', 'Beterraba em pó', 'Óleo de coco'],
  laticinios:    ['Proteína do leite', 'Carragena', 'Goma de alfarroba', 'Amido modificado'],
  nutraceuticos: ['Spirulina', 'Cúrcuma', 'Quinoa Real', 'Maca Peruana'],
  outros:        [],
}

const DICAS_MIA: Record<string, string> = {
  snacks:        'Com base nas tendências atuais, a categoria de Snacks & Conveniência está crescendo 12% em pedidos plant-based este mês.',
  massas:        'Massas com proteína vegetal têm 3x mais engajamento em 2024.',
  proteinas:     'Proteínas análogas lideram pesquisas de impressão 3D alimentar.',
  laticinios:    'Sobremesas personalizadas têm alto valor percebido pelo consumidor.',
  nutraceuticos: 'Nutracêuticos em formas impressas aumentam a biodisponibilidade.',
  outros:        'Projetos customizados permitem diferenciação máxima no mercado.',
}

const WIZARD_STEPS = [
  { id: 'wizard_app',         label: 'Aplicação'   },
  { id: 'wizard_tendencias',  label: 'Tendências'  },
  { id: 'wizard_ingredientes',label: 'Ingredientes'},
  { id: 'wizard_resultado',   label: 'Resultado'   },
]

export default function FormularPage() {
  const router = useRouter()
  const { connected: agentConnected } = useAgentConnected()
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
  const [stlLoading, setStlLoading] = useState(false)
  const [stlResult, setStlResult] = useState<{ url: string; filename: string; metadata?: { volume_mm3: number; peso_estimado_g: number; tempo_impressao_estimado_min: number; forma: string } } | null>(null)
  const [stlError, setStlError] = useState<string | null>(null)

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

  async function gerarSTLHandler() {
    setStlError(null)
    setStlResult(null)
    setStlLoading(true)
    setModo('stl_gerando')

    const formula = {
      nome: nomeFormulacao,
      aplicacao,
      ingredientes: ingredientes.filter(i => i.nome.trim()).map(i => ({ nome: i.nome, percentual: parseFloat(i.percentual) || 0 })),
    }

    const result = await gerarSTL(formula)
    setStlLoading(false)

    if (result.success && result.stlUrl) {
      setStlResult({
        url: result.stlUrl,
        filename: result.filename || 'modelo.stl',
        metadata: result.metadata,
      })
      setModo('stl_pronto')
    } else {
      setStlError(result.error || 'Erro ao gerar STL')
      setModo('validar')
    }
  }

  async function baixarSTLHandler() {
    if (!stlResult) return
    const success = await baixarSTL(stlResult.url, stlResult.filename)
    if (!success) {
      setStlError('Erro ao baixar arquivo STL')
    }
  }

  // ─── TELA INICIAL ─────────────────────────────────────────────
  if (modo === 'escolha') return (
    <div className="h-full overflow-y-auto flex items-center justify-center px-6 py-12" style={{ background: '#fff8f1' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#003223' }}>
            <FlaskConical size={26} style={{ color: '#c8ee4f' }} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2" style={{ color: '#003223', letterSpacing: '-0.02em' }}>Como quer formular?</h1>
          <p className="text-sm font-sans" style={{ color: '#58413c' }}>Escolha o ponto de partida do seu fluxo de criação.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setModo('input')}
            className="bg-white p-6 rounded-2xl shadow-tonal text-left group transition-all duration-200 hover:shadow-tonal-lg hover:scale-[1.02]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#fff2da' }}>
              <FlaskConical size={20} style={{ color: '#003223' }} />
            </div>
            <h2 className="font-display font-semibold text-sm mb-1" style={{ color: '#003223' }}>Tenho uma formulação</h2>
            <p className="text-xs font-sans leading-relaxed" style={{ color: '#58413c' }}>Insira ingredientes e percentuais para validar e salvar.</p>
            <div className="flex items-center gap-1 mt-4 text-xs font-display font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#516600' }}>
              Inserir <ArrowRight size={11} />
            </div>
          </button>
          <button onClick={() => setModo('wizard_app')}
            className="p-6 rounded-2xl text-left group transition-all duration-200 hover:scale-[1.02]"
            style={{ background: '#003223' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(200,238,79,0.2)' }}>
              <Sparkles size={20} style={{ color: '#c8ee4f' }} />
            </div>
            <h2 className="font-display font-semibold text-sm mb-1 text-white">Criar com a MIA</h2>
            <p className="text-xs font-sans leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>Deixe a MIA sugerir uma formulação otimizada para sua aplicação.</p>
            <div className="flex items-center gap-1 mt-4 text-xs font-display font-semibold" style={{ color: '#c8ee4f' }}>
              Iniciar guia <ArrowRight size={11} />
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  // ─── WIZARD: APLICAÇÃO ────────────────────────────────────────
  if (modo === 'wizard_app') return (
    <WizardShell
      passo={1}
      miaIntelDica={aplicacao ? DICAS_MIA[aplicacao] : undefined}
      onCancelar={() => setModo('escolha')}
      onAvancar={() => setModo('wizard_tendencias')}
      avancarDisabled={!aplicacao}
      avancarLabel="Próximo Passo"

    >
      <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#003223', letterSpacing: '-0.02em' }}>Escolha a sua aplicação</h2>
      <p className="text-sm font-sans mb-8" style={{ color: '#58413c' }}>
        Selecione o segmento industrial para o qual deseja desenvolver<br />sua nova formulação biônica.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {APLICACOES.map(a => (
          <button key={a.id} onClick={() => setAplicacao(a.id)}
            className="relative text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-tonal"
            style={{
              borderColor: aplicacao === a.id ? '#516600' : '#e5d9c1',
              background: aplicacao === a.id ? 'rgba(81,102,0,0.04)' : 'white',
            }}>
            {aplicacao === a.id && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#516600' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>check</span>
              </span>
            )}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: aplicacao === a.id ? 'rgba(81,102,0,0.12)' : '#fff2da' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: aplicacao === a.id ? '#516600' : '#003223', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>
                {a.icon}
              </span>
            </div>
            <p className="font-display font-semibold text-sm mb-1.5" style={{ color: '#003223' }}>{a.nome}</p>
            <p className="text-xs font-sans leading-relaxed" style={{ color: '#58413c' }}>{a.desc}</p>
          </button>
        ))}
      </div>
    </WizardShell>
  )

  // ─── WIZARD: TENDÊNCIAS ───────────────────────────────────────
  if (modo === 'wizard_tendencias') return (
    <WizardShell
      passo={2}
      miaIntelDica={tendencias.includes('Alto em Proteína') && tendencias.includes('Vegano')
        ? 'Combinar "Alto em Proteína" e "Vegano" priorizará micro-proteínas de ervilha e sementes de girassol.'
        : 'Selecione tendências para que a MIA adapte a formulação ao mercado atual.'}
      onCancelar={() => setModo('wizard_app')}
      onAvancar={() => setModo('wizard_ingredientes')}
      avancarLabel="Próximo"

    >
      <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#003223', letterSpacing: '-0.02em' }}>Tendências nutricionais</h2>
      <p className="text-sm font-sans mb-8" style={{ color: '#58413c' }}>
        Selecione as tendências desejadas <span className="opacity-60">(opcional)</span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {TENDENCIAS.map(t => (
          <button key={t} onClick={() => toggleTendencia(t)}
            className="px-4 py-2.5 rounded-xl border-2 text-sm font-sans transition-all duration-150"
            style={{
              borderColor: tendencias.includes(t) ? '#003223' : '#e5d9c1',
              background: tendencias.includes(t) ? 'rgba(0,50,35,0.06)' : 'white',
              color: tendencias.includes(t) ? '#003223' : '#58413c',
              fontWeight: tendencias.includes(t) ? 600 : 400,
            }}>
            {tendencias.includes(t) && '✓ '}{t}
          </button>
        ))}
      </div>
    </WizardShell>
  )

  // ─── WIZARD: INGREDIENTES ─────────────────────────────────────
  if (modo === 'wizard_ingredientes') return (
    <WizardShell
      passo={3}
      miaIntelDica="Adicione os ingredientes principais. A MIA calculará proporções, sinergia e parâmetros de extrusão automaticamente."
      onCancelar={() => setModo('wizard_tendencias')}
      onAvancar={gerarComMIA}
      avancarLabel="Gerar com MIA"
      avancarIcon={<Sparkles size={14} />}

    >
      <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#003223', letterSpacing: '-0.02em' }}>Ingrediente(s) base</h2>
      <p className="text-sm font-sans mb-8" style={{ color: '#58413c' }}>
        Selecione os elementos fundamentais. A MIA irá otimizar a formulação completa.
      </p>
      <div className="flex gap-2 mb-4">
        <input value={buscaIngrediente} onChange={e => setBuscaIngrediente(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addIngredienteWizard(buscaIngrediente)}
          placeholder="Ex: cenoura, batata-doce, proteína de ervilha..."
          className="flex-1 bg-white rounded-xl border border-[#e5d9c1] px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#003223] transition-colors"
          style={{ color: '#211b0c' }} />
        <button onClick={() => addIngredienteWizard(buscaIngrediente)} disabled={!buscaIngrediente.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-40 transition-colors"
          style={{ background: '#003223', color: 'white' }}>
          <Plus size={14} /> Adicionar
        </button>
      </div>
      {(INGREDIENTES_SUGERIDOS[aplicacao] ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {(INGREDIENTES_SUGERIDOS[aplicacao] ?? []).filter(s => !ingredientesWizard.includes(s)).map(s => (
            <button key={s} onClick={() => addIngredienteWizard(s)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#e5d9c1] text-xs font-sans transition-colors hover:border-[#003223] hover:text-[#003223]"
              style={{ color: '#58413c', background: '#fff2da' }}>
              <Plus size={10} /> {s}
            </button>
          ))}
        </div>
      )}
      {ingredientesWizard.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredientesWizard.map(i => (
            <span key={i} className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,50,35,0.08)', color: '#003223', border: '1px solid rgba(0,50,35,0.15)' }}>
              {i}
              <button onClick={() => removeIngredienteWizard(i)} className="opacity-60 hover:opacity-100"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </WizardShell>
  )

  // ─── WIZARD: PROCESSANDO ──────────────────────────────────────
  if (modo === 'wizard_processando') return (
    <div className="h-full flex items-center justify-center p-6" style={{ background: '#fff8f1' }}>
      <div className="text-center max-w-sm animate-slide-up">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#e5d9c1] bg-white flex items-center justify-center shadow-tonal">
            <FlaskConical size={32} style={{ color: '#003223' }} className="animate-pulse" />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full animate-bounce" style={{ background: '#c8ee4f' }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full animate-bounce" style={{ background: 'rgba(0,50,35,0.2)', animationDelay: '150ms' }} />
        </div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#003223' }}>MIA está formulando...</h2>
        <p className="text-sm font-sans mb-6" style={{ color: '#58413c' }}>Buscando referências e calculando parâmetros</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['Ajustando viscosidade', 'Sinergia de bioativos', 'Teste de estabilidade'].map((s, i) => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-sans border"
              style={{ borderColor: i === 0 ? '#003223' : '#e5d9c1', color: i === 0 ? '#003223' : '#707974', background: 'white' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── STL: GERANDO ─────────────────────────────────────────────
  if (modo === 'stl_gerando') return (
    <div className="h-full flex items-center justify-center p-6" style={{ background: '#fff8f1' }}>
      <div className="text-center max-w-sm animate-slide-up">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#e5d9c1] bg-white flex items-center justify-center shadow-tonal">
            <Zap size={32} style={{ color: '#003223' }} className="animate-pulse" />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full animate-bounce" style={{ background: '#c8ee4f' }} />
        </div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#003223' }}>Gerando STL 3D...</h2>
        <p className="text-sm font-sans mb-6" style={{ color: '#58413c' }}>Calculando geometria e volume</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['Forma do objeto', 'Densidade material', 'Dimensões'].map((s, i) => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-sans border"
              style={{ borderColor: i === 0 ? '#003223' : '#e5d9c1', color: i === 0 ? '#003223' : '#707974', background: 'white' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── STL: PRONTO ──────────────────────────────────────────────
  if (modo === 'stl_pronto') return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="px-8 py-5 border-b" style={{ background: '#fff2da', borderColor: '#e5d9c1' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => setModo('validar')}
            className="text-xs font-sans transition-colors hover:text-[#003223]" style={{ color: '#58413c' }}>← Voltar</button>
          <h1 className="font-display font-bold text-lg" style={{ color: '#003223' }}>STL Gerado com Sucesso</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-6 space-y-4">
        {stlError && (
          <div className="p-4 rounded-2xl bg-red-50 border-l-4 border-red-500">
            <p className="text-sm font-sans" style={{ color: '#7f1d1d' }}>{stlError}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-tonal p-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f0f9ff' }}>
            <Download size={28} style={{ color: '#003223' }} />
          </div>
          <h2 className="font-display font-bold text-lg mb-2" style={{ color: '#003223' }}>
            {stlResult?.filename}
          </h2>
          <p className="text-sm font-sans mb-6" style={{ color: '#58413c' }}>Seu arquivo STL está pronto para download</p>

          {stlResult?.metadata && (
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl" style={{ background: '#f9edd4' }}>
              <div>
                <p className="text-xs font-sans" style={{ color: '#707974' }}>Volume</p>
                <p className="text-sm font-display font-bold" style={{ color: '#003223' }}>
                  {(stlResult.metadata.volume_mm3 / 1000).toFixed(1)} cm³
                </p>
              </div>
              <div>
                <p className="text-xs font-sans" style={{ color: '#707974' }}>Peso Estimado</p>
                <p className="text-sm font-display font-bold" style={{ color: '#003223' }}>
                  {stlResult.metadata.peso_estimado_g.toFixed(1)}g
                </p>
              </div>
              <div>
                <p className="text-xs font-sans" style={{ color: '#707974' }}>Tempo de Impressão</p>
                <p className="text-sm font-display font-bold" style={{ color: '#003223' }}>
                  ~{stlResult.metadata.tempo_impressao_estimado_min}min
                </p>
              </div>
              <div>
                <p className="text-xs font-sans" style={{ color: '#707974' }}>Forma</p>
                <p className="text-sm font-display font-bold" style={{ color: '#003223' }}>
                  {stlResult.metadata.forma}
                </p>
              </div>
            </div>
          )}

          <button onClick={baixarSTLHandler}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-display font-semibold transition-colors hover:opacity-90"
            style={{ background: '#003223', color: 'white' }}>
            <Download size={16} /> Baixar STL
          </button>
        </div>

        <div className="bg-[#f9edd4] rounded-2xl p-6 border-l-4" style={{ borderColor: '#003223' }}>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#003223' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>info</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm" style={{ color: '#003223' }}>Próximos passos</h3>
              <p className="text-sm font-sans leading-relaxed" style={{ color: '#58413c' }}>
                1. Abra o PrusaSlicer em seu computador<br />
                2. Importe este arquivo STL (File → Open)<br />
                3. Configure os parâmetros de impressão<br />
                4. Exporte o G-code<br />
                5. Faça upload do G-code aqui para registrar o experimento
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => setModo('validar')}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-display font-semibold transition-colors"
          style={{ background: '#003223', color: 'white' }}>
          <ArrowRight size={16} /> Voltar à Formulação
        </button>
      </div>
    </div>
  )

  // ─── WIZARD: RESULTADO / INPUT MANUAL ────────────────────────
  if (modo === 'wizard_resultado' || modo === 'input' || modo === 'validar') {
    const isWizard = modo === 'wizard_resultado'
    return (
      <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
        {/* Header */}
        <div className="px-8 py-5 border-b" style={{ background: '#fff2da', borderColor: '#e5d9c1' }}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => setModo(isWizard ? 'wizard_ingredientes' : 'escolha')}
              className="text-xs font-sans transition-colors hover:text-[#003223]" style={{ color: '#58413c' }}>← Voltar</button>
            <h1 className="font-display font-bold text-lg" style={{ color: '#003223' }}>
              {isWizard ? 'Formulação sugerida pela MIA' : 'Inserir formulação'}
            </h1>
            {isWizard && (
              <a href="/chat" target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-xs font-sans border rounded-lg px-3 py-1.5 transition-colors hover:border-[#003223] hover:text-[#003223]"
                style={{ borderColor: '#e5d9c1', color: '#58413c' }}>
                <ExternalLink size={11} /> Chat com MIA
              </a>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-6 space-y-4">
          {isWizard && validacao && (
            <div className="p-4 rounded-2xl" style={{ background: '#f9edd4', borderLeft: '3px solid #003223' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} style={{ color: '#003223' }} />
                <span className="text-xs font-display font-semibold" style={{ color: '#003223' }}>Análise MIA</span>
              </div>
              <p className="text-sm font-sans leading-relaxed" style={{ color: '#58413c' }}>{validacao}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-tonal p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-display font-semibold" style={{ color: '#003223' }}>
                Ingredientes {isWizard && <span className="text-xs font-normal ml-1" style={{ color: '#707974' }}>(você pode editar)</span>}
              </h2>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full" style={{ background: '#fff2da', color: '#516600' }}>
                Total: {ingredientes.reduce((acc, i) => acc + (parseFloat(i.percentual) || 0), 0).toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2">
              {ingredientes.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_140px_32px] gap-2 items-center">
                  <input value={ing.nome} onChange={e => updateIngrediente(i, 'nome', e.target.value)} placeholder="Ingrediente"
                    className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#003223] transition-colors"
                    style={{ color: '#211b0c' }} />
                  <div className="relative">
                    <input value={ing.percentual} onChange={e => updateIngrediente(i, 'percentual', e.target.value)} placeholder="0" type="number" min="0" max="100"
                      className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#003223] transition-colors"
                      style={{ color: '#211b0c' }} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#707974' }}>%</span>
                  </div>
                  <select value={ing.funcao} onChange={e => updateIngrediente(i, 'funcao', e.target.value)}
                    className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-2 py-2 text-sm font-sans focus:outline-none focus:border-[#003223] transition-colors"
                    style={{ color: '#211b0c' }}>
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button onClick={() => removeIngrediente(i)} disabled={ingredientes.length === 1}
                    className="flex items-center justify-center text-[#58413c] hover:text-red-400 disabled:opacity-20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addIngrediente} className="mt-3 flex items-center gap-1.5 text-xs font-sans transition-colors hover:text-[#003223]" style={{ color: '#58413c' }}>
              <Plus size={13} /> Adicionar ingrediente
            </button>
          </div>

          {!isWizard && validacao && (
            <div className="bg-white rounded-2xl shadow-tonal p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} style={{ color: '#003223' }} />
                <span className="text-sm font-display font-semibold" style={{ color: '#003223' }}>Análise da MIA</span>
              </div>
              <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap" style={{ color: '#58413c' }}>{validacao}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-tonal p-5">
            <h2 className="text-sm font-display font-semibold mb-3" style={{ color: '#003223' }}>Salvar formulação</h2>
            <div className="flex gap-3">
              <input value={nomeFormulacao} onChange={e => setNomeFormulacao(e.target.value)}
                placeholder="Nome da formulação (ex: Pasta de batata-doce v1)"
                className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#003223] transition-colors"
                style={{ color: '#211b0c' }} />
              <button onClick={salvarFormulacao} disabled={!nomeFormulacao.trim() || salvando}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: '#003223', color: 'white' }}>
                <Save size={14} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {!isWizard && modo !== 'validar' && (
            <button onClick={validarFormulacao} disabled={validando || !ingredientes.some(i => i.nome.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: '#003223', color: 'white' }}>
              <Sparkles size={14} /> {validando ? 'Validando...' : 'Validar com MIA'}
            </button>
          )}

          {modo === 'validar' && agentConnected && (
            <button onClick={gerarSTLHandler} disabled={stlLoading || !ingredientes.some(i => i.nome.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: '#003223', color: 'white' }}>
              <Zap size={14} /> {stlLoading ? 'Gerando...' : 'Gerar STL 3D'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

// ─── WIZARD SHELL ─────────────────────────────────────────────────────────────

function WizardShell({
  passo,
  children,
  miaIntelDica,
  onCancelar,
  onAvancar,
  avancarDisabled,
  avancarLabel,
  avancarIcon,
}: {
  passo: number
  children: React.ReactNode
  miaIntelDica?: string
  onCancelar: () => void
  onAvancar: () => void
  avancarDisabled?: boolean
  avancarLabel: string
  avancarIcon?: React.ReactNode
}) {
  return (
    <div className="h-full flex flex-col" style={{ background: '#fff8f1' }}>
      {/* Step bar */}
      <div className="px-8 py-4 border-b" style={{ background: '#fff8f1', borderColor: '#e5d9c1' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center">
            {WIZARD_STEPS.map((step, i) => {
              const num = i + 1
              const isActive = num === passo
              const isDone = num < passo
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all"
                      style={{
                        background: isActive ? '#003223' : isDone ? '#516600' : 'transparent',
                        border: isActive || isDone ? 'none' : '1.5px solid #d4ccc0',
                        color: isActive || isDone ? 'white' : '#bfc9c2',
                        minWidth: '28px',
                      }}>
                      {isDone
                        ? <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        : num}
                    </div>
                    <span className="text-[10px] font-sans whitespace-nowrap"
                      style={{ color: isActive ? '#003223' : isDone ? '#516600' : '#bfc9c2', fontWeight: isActive ? 600 : 400 }}>
                      {step.label}
                    </span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mb-4"
                      style={{ background: isDone ? '#516600' : '#e5d9c1' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto pb-28">
          {children}
        </div>
      </div>

      {/* Footer: actions */}
      <div className="px-8 py-4 border-t flex items-center justify-between"
        style={{ background: '#fff8f1', borderColor: '#e5d9c1' }}>
        <button onClick={onCancelar}
          className="flex items-center gap-1.5 text-sm font-sans transition-colors hover:text-[#003223]" style={{ color: '#58413c' }}>
          <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} /> Cancelar
        </button>
        <button onClick={onAvancar} disabled={avancarDisabled}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90"
          style={{ background: '#003223', color: 'white' }}>
          {avancarIcon} {avancarLabel} <ArrowRight size={14} />
        </button>
      </div>

      {/* MIA Intelligence floating card */}
      {miaIntelDica && (
        <div className="fixed bottom-6 right-6 max-w-[260px] rounded-2xl p-4 shadow-tonal-lg z-10 animate-slide-up"
          style={{ background: '#1a2e1a', border: '1px solid rgba(200,238,79,0.2)' }}>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: '#c8ee4f' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#003223', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <p className="text-[10px] font-display font-bold uppercase tracking-widest mb-1.5" style={{ color: '#c8ee4f' }}>
                MIA Intelligence
              </p>
              <p className="text-[11px] font-sans leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {miaIntelDica}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
