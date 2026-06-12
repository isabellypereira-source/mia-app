'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Sparkles, Plus, Trash2, CheckCircle, Save, ArrowRight, X, ExternalLink, Download, Zap, Cookie, Soup, Drumstick, IceCream2, Pill, Scissors, Check, ArrowLeft } from 'lucide-react'
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
  { id: 'snacks',        nome: 'Snacks e Conveniência',   desc: 'Snacks crocantes, biscoitos recheados e barras de cereais funcionais.',               Icon: Cookie },
  { id: 'massas',        nome: 'Massas e Grãos',          desc: 'Massas frescas ou secas com perfis nutricionais otimizados e texturas de extrusão.',  Icon: Soup },
  { id: 'proteinas',     nome: 'Proteínas e Análogos',    desc: 'Soluções plant-based e híbridas com foco em suculência e estrutura fibrosa avançada.', Icon: Drumstick },
  { id: 'laticinios',    nome: 'Laticínios e Sobremesas', desc: 'Iogurtes, queijos vegetais e sobremesas lácteas com estabilidade térmica superior.',   Icon: IceCream2 },
  { id: 'nutraceuticos', nome: 'Nutracêuticos',           desc: 'Suplementos bioativos em formatos inovadores de entrega de nutrientes.',               Icon: Pill },
  { id: 'outros',        nome: 'Outras Aplicações',       desc: 'Projetos customizados para demandas específicas de ingredientes e processos.',          Icon: Scissors },
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
    <>
      <style>{ESCOLHA_CSS}</style>
      <div className="escolha-wrap">
        <span className="escolha-eyebrow"><span className="dot" /> Decisão inicial</span>
        <h1 className="escolha-title">Como você quer <em>formular</em> hoje?</h1>
        <p className="escolha-sub">Você pode partir de uma formulação que já tem em mente, ou começar uma conversa guiada com a MIA para construir do zero.</p>

        <div className="escolha-grid">
          <button type="button" onClick={() => setModo('input')} className="choice soft">
            <div>
              <div className="iconbox"><FlaskConical size={26} strokeWidth={1.8} /></div>
              <h2>Já tenho a formulação</h2>
              <p>Insira ingredientes, percentuais e funções para validar, salvar e caracterizar.</p>
            </div>
            <span className="cta">Inserir manualmente <ArrowRight size={16} strokeWidth={2} /></span>
          </button>
          <button type="button" onClick={() => setModo('wizard_app')} className="choice accent">
            <span className="ribbon">Recomendado</span>
            <div>
              <div className="iconbox"><Sparkles size={26} strokeWidth={1.8} /></div>
              <h2>Criar com a MIA</h2>
              <p>Conte sua aplicação e restrições. A MIA propõe uma formulação otimizada com base científica.</p>
            </div>
            <span className="cta">Iniciar guia <ArrowRight size={16} strokeWidth={2} /></span>
          </button>
        </div>
      </div>
    </>
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
      <div className="aplicacoes-grid">
        {APLICACOES.map(a => {
          const ativo = aplicacao === a.id
          const Icon = a.Icon
          return (
            <button key={a.id} onClick={() => setAplicacao(a.id)} className={`aplic-card ${ativo ? 'active' : ''}`}>
              {ativo && (
                <span className="aplic-check"><Check size={13} strokeWidth={2.5} /></span>
              )}
              <span className="aplic-icon"><Icon size={22} strokeWidth={1.6} /></span>
              <p className="aplic-nome">{a.nome}</p>
              <p className="aplic-desc">{a.desc}</p>
            </button>
          )
        })}
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
      <>
        <style>{`
          .formular-header{
            display:flex;align-items:center;gap:14px;margin-bottom:22px;
          }
          .formular-back{
            display:inline-flex;align-items:center;gap:6px;
            background:transparent;border:none;cursor:pointer;
            color:var(--text-muted);font-family:inherit;font-size:13px;
            padding:6px 10px;border-radius:8px;transition:.15s;
          }
          .formular-back:hover{background:var(--hover-tint);color:var(--text-main)}
          .formular-h1{
            font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
            font-size:28px;color:var(--text-main);margin:0;letter-spacing:-.01em;
          }
          .formular-chat{
            margin-left:auto;display:inline-flex;align-items:center;gap:6px;
            background:var(--surface-glass);
            border:1px solid var(--border-glass-strong);
            color:var(--text-main);
            padding:8px 14px;border-radius:999px;
            font-size:13px;font-weight:500;text-decoration:none;
            backdrop-filter:blur(12px);transition:.15s;
          }
          .formular-chat:hover{background:var(--hover-tint)}

          /* glass card e inputs do formulário */
          .formular-card{
            background:var(--surface-glass) !important;
            border:1px solid var(--border-glass) !important;
            backdrop-filter:blur(16px);
            border-radius:18px;padding:22px;margin-bottom:16px;
          }
          .formular-card-title{
            display:flex;align-items:center;justify-content:space-between;
            margin-bottom:14px;
          }
          .formular-card-title h2{
            font-size:14px;font-weight:600;color:var(--text-main);margin:0;
          }
          .formular-total{
            font-size:12px;padding:5px 12px;border-radius:999px;
            background:var(--icon-tint) !important;
            color:var(--accent-em) !important;
            border:1px solid var(--border-glass-strong) !important;
            font-weight:600;
          }
          .formular-row{
            display:grid;grid-template-columns:1fr 90px 150px 32px;
            gap:8px;align-items:center;margin-bottom:8px;
          }
          .formular-input,
          .formular-select{
            background:var(--surface-glass-strong) !important;
            border:1px solid var(--border-glass-strong) !important;
            color:var(--text-main) !important;
            border-radius:10px;padding:10px 12px;
            font-family:inherit;font-size:14px;width:100%;
            transition:border-color .15s, box-shadow .15s;
          }
          .formular-input:focus,
          .formular-select:focus{
            outline:none;border-color:var(--accent) !important;
            box-shadow:0 0 0 4px var(--icon-tint);
          }
          .formular-input::placeholder{color:var(--text-faint) !important}
          .formular-pct-wrap{position:relative}
          .formular-pct-wrap span{
            position:absolute;right:10px;top:50%;transform:translateY(-50%);
            color:var(--text-faint);font-size:12px;
          }
          .formular-pct-wrap .formular-input{padding-right:24px}
          .formular-trash{
            display:grid;place-items:center;
            background:transparent;border:none;cursor:pointer;
            color:var(--text-faint);padding:6px;border-radius:6px;
            transition:.15s;
          }
          .formular-trash:hover{color:var(--orange);background:var(--hover-tint)}
          .formular-trash:disabled{opacity:.25;cursor:not-allowed}
          .formular-add{
            margin-top:8px;display:inline-flex;align-items:center;gap:6px;
            background:transparent;border:none;cursor:pointer;
            color:var(--accent-em) !important;
            font-family:inherit;font-size:13px;font-weight:500;padding:4px 0;
          }
          .formular-add:hover{opacity:.75}

          .formular-save-row{display:flex;gap:10px}
          .formular-save-row .formular-input{flex:1}
          .formular-save{
            display:inline-flex;align-items:center;gap:8px;
            padding:10px 22px;border-radius:12px;
            background:var(--accent) !important;
            color:var(--accent-text-on) !important;
            border:none;cursor:pointer;font-family:inherit;
            font-size:14px;font-weight:600;
            transition:transform .15s, box-shadow .25s;
          }
          .formular-save:hover:not(:disabled){
            transform:translateY(-1px);
            box-shadow:0 12px 28px -10px var(--accent);
          }
          .formular-save:disabled{opacity:.5;cursor:not-allowed}

          .formular-validation{
            background:var(--surface-glass) !important;
            border:1px solid var(--border-glass) !important;
            border-left:3px solid var(--accent-em) !important;
            border-radius:14px;padding:16px;margin-bottom:16px;
          }
          .formular-validation-header{
            display:flex;align-items:center;gap:8px;margin-bottom:8px;
            font-size:12px;font-weight:600;
            color:var(--accent-em);letter-spacing:.06em;text-transform:uppercase;
          }
          .formular-validation p{
            color:var(--text-muted);font-size:14px;line-height:1.55;margin:0;
            white-space:pre-wrap;
          }

          .formular-body{
            max-width:760px;margin:0 auto;
          }
        `}</style>
        <div className="formular-header">
          <button onClick={() => setModo(isWizard ? 'wizard_ingredientes' : 'escolha')} className="formular-back">
            ← Voltar
          </button>
          <h1 className="formular-h1">
            {isWizard ? 'Formulação sugerida pela MIA' : 'Inserir formulação'}
          </h1>
          {isWizard && (
            <a href="/chat" target="_blank" rel="noopener noreferrer" className="formular-chat">
              <ExternalLink size={12} /> Chat com MIA
            </a>
          )}
        </div>

        <div className="formular-body">
          {isWizard && validacao && (
            <div className="formular-validation">
              <div className="formular-validation-header">
                <Sparkles size={13} /> Análise da MIA
              </div>
              <p>{validacao}</p>
            </div>
          )}

          <div className="formular-card">
            <div className="formular-card-title">
              <h2>Ingredientes {isWizard && <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 12 }}>(você pode editar)</span>}</h2>
              <span className="formular-total">
                Total: {ingredientes.reduce((acc, i) => acc + (parseFloat(i.percentual) || 0), 0).toFixed(1)}%
              </span>
            </div>
            <div>
              {ingredientes.map((ing, i) => (
                <div key={i} className="formular-row">
                  <input
                    value={ing.nome}
                    onChange={e => updateIngrediente(i, 'nome', e.target.value)}
                    placeholder="Ingrediente"
                    className="formular-input"
                  />
                  <div className="formular-pct-wrap">
                    <input
                      value={ing.percentual}
                      onChange={e => updateIngrediente(i, 'percentual', e.target.value)}
                      placeholder="0"
                      type="number"
                      min="0"
                      max="100"
                      className="formular-input"
                    />
                    <span>%</span>
                  </div>
                  <select
                    value={ing.funcao}
                    onChange={e => updateIngrediente(i, 'funcao', e.target.value)}
                    className="formular-select"
                  >
                    {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button
                    onClick={() => removeIngrediente(i)}
                    disabled={ingredientes.length === 1}
                    className="formular-trash"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addIngrediente} className="formular-add">
              <Plus size={13} /> Adicionar ingrediente
            </button>
          </div>

          {!isWizard && validacao && (
            <div className="formular-validation">
              <div className="formular-validation-header">
                <CheckCircle size={13} /> Análise da MIA
              </div>
              <p>{validacao}</p>
            </div>
          )}

          <div className="formular-card">
            <div className="formular-card-title">
              <h2>Salvar formulação</h2>
            </div>
            <div className="formular-save-row">
              <input
                value={nomeFormulacao}
                onChange={e => setNomeFormulacao(e.target.value)}
                placeholder="Nome da formulação (ex: Pasta de batata-doce v1)"
                className="formular-input"
              />
              <button
                onClick={salvarFormulacao}
                disabled={!nomeFormulacao.trim() || salvando}
                className="formular-save"
              >
                <Save size={14} /> {salvando ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* "Validar com MIA" e "Gerar STL 3D" temporariamente removidos.
              Voltaremos a esses fluxos quando estiverem prontos. */}
        </div>
      </>
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
    <>
      <style>{WIZARD_CSS}</style>
      <div className="wiz-root">
        {/* Step bar */}
        <div className="wiz-steps">
          {WIZARD_STEPS.map((step, i) => {
            const num = i + 1
            const isActive = num === passo
            const isDone = num < passo
            return (
              <div key={step.id} className="wiz-step-wrap">
                <div className="wiz-step-col">
                  <div className={`wiz-step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    {isDone ? <Check size={13} strokeWidth={2.5} /> : num}
                  </div>
                  <span className={`wiz-step-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    {step.label}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`wiz-step-line ${isDone ? 'done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* MIA Dica como banner inline (não bloqueia mais o botão) */}
        {miaIntelDica && (
          <div className="wiz-mia-banner">
            <div className="wiz-mia-ic"><Sparkles size={14} strokeWidth={1.8} /></div>
            <div className="wiz-mia-text">
              <span className="wiz-mia-label">MIA Intelligence</span>
              <p>{miaIntelDica}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="wiz-content">{children}</div>

        {/* Footer */}
        <div className="wiz-footer">
          <button onClick={onCancelar} className="wiz-back">
            <ArrowLeft size={14} strokeWidth={1.8} /> Cancelar
          </button>
          <button onClick={onAvancar} disabled={avancarDisabled} className="wiz-next">
            {avancarIcon} {avancarLabel} <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  )
}

const ESCOLHA_CSS = `
  .escolha-wrap{
    width:100%;max-width:1080px;margin:0 auto;
    padding:48px 48px 64px;text-align:center;
    position:relative;
    min-height:calc(100vh - 200px);
    display:flex;flex-direction:column;justify-content:center;
  }
  .escolha-wrap::before{
    content:"";position:absolute;inset:-100px 0 0;pointer-events:none;
    background:radial-gradient(60% 50% at 50% 0%, var(--icon-tint), transparent 65%);
    z-index:-1;
  }
  .escolha-eyebrow{
    display:inline-flex;align-items:center;gap:8px;
    padding:7px 16px;border-radius:999px;
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    color:var(--text-muted) !important;
    font-size:12.5px;font-weight:500;letter-spacing:.06em;
    margin:0 auto 24px;
    backdrop-filter:blur(12px);width:fit-content;
  }
  .escolha-eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--accent-em);box-shadow:0 0 0 4px var(--icon-tint)}
  .escolha-title{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(40px,5.5vw,68px);line-height:1.02;letter-spacing:-.02em;
    color:var(--text-main) !important;margin:0 0 16px;
  }
  .escolha-title em{font-style:italic;color:var(--accent-em) !important;font-family:inherit}
  .escolha-sub{font-size:16px;line-height:1.55;color:var(--text-muted) !important;max-width:520px;margin:0 auto 56px}

  .escolha-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:880px;margin:0 auto;width:100%}

  .escolha-wrap .choice{
    text-align:left;
    padding:36px;border-radius:28px;
    cursor:pointer;text-decoration:none;
    transition:transform .25s ease, box-shadow .3s ease, border-color .25s ease;
    position:relative;overflow:hidden;
    min-height:300px;display:flex;flex-direction:column;justify-content:space-between;
    font-family:inherit;
  }

  .escolha-wrap .choice.soft{
    background:var(--surface-glass-strong) !important;
    border:1px solid var(--border-glass-strong);
    color:var(--text-main) !important;
    backdrop-filter:blur(20px);
  }
  .escolha-wrap .choice.soft:hover{transform:translateY(-4px);border-color:var(--accent-em);box-shadow:0 30px 60px -20px rgba(0,0,0,.2)}
  .escolha-wrap .choice.soft .iconbox{
    width:54px;height:54px;border-radius:16px;
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    color:var(--text-main) !important;
    display:grid;place-items:center;
  }
  .escolha-wrap .choice.soft h2{color:var(--text-main) !important}
  .escolha-wrap .choice.soft p{color:var(--text-muted) !important}
  .dash-root .escolha-wrap .choice.soft .cta{color:var(--accent-em) !important}
  .dash-root.theme-light .escolha-wrap .choice.soft .cta{color:#79a51e !important}

  .escolha-wrap .choice.accent{
    background:linear-gradient(135deg, var(--accent) 0%, var(--accent-em) 100%) !important;
    color:var(--accent-text-on) !important;
    border:1px solid transparent;
    box-shadow:0 20px 50px -16px var(--accent);
  }
  .escolha-wrap .choice.accent:hover{transform:translateY(-4px);box-shadow:0 30px 70px -16px var(--accent)}
  .escolha-wrap .choice.accent .iconbox{
    width:54px;height:54px;border-radius:16px;
    background:rgba(3,56,42,.22);
    display:grid;place-items:center;color:var(--accent-text-on) !important;
    border:none;
  }
  .dash-root.theme-light .escolha-wrap .choice.accent .iconbox{background:rgba(255,255,255,.22)}
  .escolha-wrap .choice.accent h2{color:var(--accent-text-on) !important}
  .escolha-wrap .choice.accent p{color:rgba(3,56,42,.78) !important}
  .dash-root.theme-light .escolha-wrap .choice.accent p{color:rgba(255,255,255,.85) !important}
  .escolha-wrap .choice.accent .cta{color:var(--accent-text-on) !important}

  .escolha-wrap .choice .iconbox svg{width:26px;height:26px}
  .escolha-wrap .choice h2{margin:24px 0 8px;font-size:22px;font-weight:600;letter-spacing:-.01em}
  .escolha-wrap .choice p{margin:0;font-size:14.5px;line-height:1.5;max-width:280px}
  .escolha-wrap .choice .cta{
    margin-top:24px;display:inline-flex;align-items:center;gap:8px;
    font-size:14px;font-weight:600;
  }

  .escolha-wrap .choice .ribbon{
    position:absolute;top:20px;right:20px;
    background:rgba(3,56,42,.18);
    color:var(--accent-text-on) !important;
    font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    padding:6px 12px;border-radius:999px;
  }
  .dash-root.theme-light .escolha-wrap .choice .ribbon{background:rgba(255,255,255,.22)}

  @media (max-width:900px){
    .escolha-grid{grid-template-columns:1fr}
    .escolha-wrap{padding:24px}
  }
`

const WIZARD_CSS = `
  .wiz-root{
    display:flex;flex-direction:column;height:100%;
    max-width:1100px;margin:0 auto;padding:0 24px 24px;
    color:var(--text-main);
  }
  .wiz-steps{
    display:flex;align-items:flex-start;
    padding:18px 8px 26px;
    border-bottom:1px solid var(--border-glass);
    margin-bottom:24px;
  }
  .wiz-step-wrap{display:flex;align-items:flex-start;flex:1;gap:8px}
  .wiz-step-col{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:80px}
  .wiz-step-dot{
    width:32px;height:32px;border-radius:50%;
    display:grid;place-items:center;
    background:transparent;
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-faint);
    font-weight:600;font-size:13px;
    transition:.2s;
  }
  .wiz-step-dot.done{background:var(--accent-em);color:var(--accent-text-on);border-color:transparent}
  .wiz-step-dot.active{background:var(--accent);color:var(--accent-text-on);border-color:transparent;box-shadow:0 0 0 4px var(--icon-tint)}
  .wiz-step-label{font-size:11.5px;color:var(--text-faint);font-weight:500}
  .wiz-step-label.active{color:var(--text-main);font-weight:600}
  .wiz-step-label.done{color:var(--text-muted)}
  .wiz-step-line{
    flex:1;height:1px;margin-top:16px;
    background:repeating-linear-gradient(90deg, var(--border-glass) 0 6px, transparent 6px 12px);
  }
  .wiz-step-line.done{background:var(--accent-em)}

  .wiz-mia-banner{
    display:flex;align-items:center;gap:14px;
    background:var(--surface-glass);
    border:1px solid var(--border-glass-strong);
    border-left:3px solid var(--accent-em);
    border-radius:14px;padding:14px 18px;margin-bottom:24px;
    backdrop-filter:blur(12px);
  }
  .wiz-mia-ic{
    width:36px;height:36px;border-radius:12px;
    background:var(--icon-tint);color:var(--accent-em);
    display:grid;place-items:center;flex-shrink:0;
  }
  .wiz-mia-text{flex:1;min-width:0}
  .wiz-mia-label{
    display:block;font-size:10.5px;letter-spacing:.16em;
    text-transform:uppercase;color:var(--accent-em);font-weight:700;margin-bottom:2px;
  }
  .wiz-mia-text p{margin:0;font-size:13px;color:var(--text-muted);line-height:1.5}

  .wiz-content{flex:1;overflow-y:auto;padding-bottom:24px}

  .wiz-footer{
    display:flex;align-items:center;justify-content:space-between;
    padding-top:18px;border-top:1px solid var(--border-glass);
    margin-top:auto;
  }
  .wiz-back{
    display:inline-flex;align-items:center;gap:6px;
    background:transparent;border:none;cursor:pointer;
    color:var(--text-muted);font-family:inherit;font-size:13.5px;
    padding:8px 12px;border-radius:10px;transition:.15s;
  }
  .wiz-back:hover{background:var(--hover-tint);color:var(--text-main)}
  .wiz-next{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;
    padding:11px 22px;border-radius:999px;
    font-family:inherit;font-size:14px;font-weight:600;
    transition:transform .15s, box-shadow .25s;
  }
  .wiz-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 28px -10px var(--accent)}
  .wiz-next:disabled{opacity:.5;cursor:not-allowed}

  /* Step title + descrição usados dentro dos passos */
  .wiz-content h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:32px;color:var(--text-main) !important;margin:0 0 8px;letter-spacing:-.01em;
  }
  .wiz-content p{color:var(--text-muted);font-size:14.5px;line-height:1.55}

  /* Aplicação cards */
  .aplicacoes-grid{
    display:grid;grid-template-columns:repeat(3,1fr);
    gap:16px;margin-top:16px;
  }
  .aplic-card{
    position:relative;text-align:left;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:18px;padding:22px;
    cursor:pointer;transition:.2s;
    backdrop-filter:blur(16px);
    font-family:inherit;color:var(--text-main);
  }
  .aplic-card:hover{transform:translateY(-3px);border-color:var(--accent-em);box-shadow:0 20px 40px -16px rgba(0,0,0,.2)}
  .aplic-card.active{border-color:var(--accent);background:var(--icon-tint)}
  .aplic-check{
    position:absolute;top:14px;right:14px;
    width:24px;height:24px;border-radius:50%;
    background:var(--accent);color:var(--accent-text-on);
    display:grid;place-items:center;
  }
  .aplic-icon{
    display:inline-grid;place-items:center;
    width:44px;height:44px;border-radius:14px;
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    color:var(--accent-em);
    margin-bottom:14px;
  }
  .aplic-card.active .aplic-icon{background:var(--accent);color:var(--accent-text-on);border-color:transparent}
  .aplic-nome{
    margin:0 0 6px;font-size:15px;font-weight:600;color:var(--text-main) !important;letter-spacing:-.01em;
  }
  .aplic-desc{
    margin:0;font-size:12.5px;line-height:1.5;color:var(--text-muted) !important;
  }

  @media (max-width:900px){
    .aplicacoes-grid{grid-template-columns:1fr 1fr}
    .wiz-step-col{min-width:48px}
    .wiz-step-label{display:none}
  }
`

