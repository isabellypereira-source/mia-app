'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Sparkles, Plus, Trash2, CheckCircle, Save, ArrowRight, X, ExternalLink, Download, Zap, Cookie, Soup, Drumstick, IceCream2, Pill, Layers, Check, ArrowLeft } from 'lucide-react'
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
  { id: 'outros',        nome: 'Outras Aplicações',       desc: 'Projetos customizados para demandas específicas de ingredientes e processos.',          Icon: Layers },
]

const TENDENCIAS = ['Alto em Proteína', 'Sem Glúten', 'Funcional / Bioativo', 'Vegano', 'Sem Lactose', 'Alto em Fibra', 'Low Carb']

const INGREDIENTES_SUGERIDOS: Record<string, string[]> = {
  snacks:        ['Farinha de arroz', 'Proteína de ervilha', 'Xantana', 'Lecitina de girassol', 'Amido de milho', 'Inulina', 'Cacau em pó', 'Fibra de aveia'],
  massas:        ['Farinha de trigo', 'Glúten vital', 'Goma guar', 'Azeite de oliva', 'Farinha de grão-de-bico', 'Ovo em pó', 'Semolina', 'Cúrcuma'],
  proteinas:     ['Proteína de soja', 'Metilcelulose', 'Beterraba em pó', 'Óleo de coco', 'Proteína de ervilha', 'Amido modificado', 'Fibra de bambu', 'Lecitina de soja'],
  laticinios:    ['Proteína do leite', 'Carragena', 'Goma de alfarroba', 'Amido modificado', 'Agar-agar', 'Pectina', 'Gordura de coco', 'Inulina'],
  nutraceuticos: ['Spirulina', 'Cúrcuma', 'Quinoa Real', 'Maca Peruana', 'Chia', 'Colágeno hidrolisado', 'Psyllium', 'Proteína de arroz'],
  outros:        ['Farinha de arroz', 'Xantana', 'Proteína de ervilha', 'Amido modificado', 'Goma guar', 'Agar-agar'],
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
  const autoSuggestRef = useRef<Record<number, AbortController | undefined>>({})
  const autoSuggestTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

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
    const tendLabel = tendencias.length > 0 ? tendencias.join(', ') : 'nenhuma especificada'
    const ingLabel = ingredientesWizard.length > 0 ? ingredientesWizard.join(', ') : 'a sua escolha'

    const prompt = `Crie uma formulação completa para impressão 3D de alimentos.

Especificações:
- Aplicação: ${appLabel}
- Tendências nutricionais: ${tendLabel}
- Ingredientes base desejados: ${ingLabel}

IMPORTANTE: A formulação deve ter no mínimo 2 ingredientes (use mais se for tecnicamente necessário) com percentuais que somem 100%.
Use funções válidas: Estruturante, Hidrocolóide, Plastificante, Emulsificante, Aromatizante, Corante, Conservante, Proteína, Lipídio, Carboidrato, Líquidos, Outro.

Responda SOMENTE com JSON puro (sem markdown, sem backticks, sem texto antes ou depois):
{"nome_sugerido":"nome descritivo","ingredientes":[{"nome":"ingrediente","percentual":25,"funcao":"Estruturante"}],"observacoes":"análise técnica breve"}`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], noTools: true, skipRag: true }),
      })

      if (!res.ok) {
        console.error('[MIA] API error:', res.status, res.statusText)
        setModo('wizard_resultado')
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let texto = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('0:')) continue
            try {
              const parsed = JSON.parse(line.slice(2))
              if (typeof parsed === 'string') texto += parsed
            } catch { /* chunk boundary, skip */ }
          }
        }
      }

      console.log('[MIA] Raw response text:', texto.slice(0, 500))

      const cleaned = texto.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0])
          console.log('[MIA] Parsed formulation:', data)
          setNomeFormulacao(data.nome_sugerido ?? '')
          if (Array.isArray(data.ingredientes) && data.ingredientes.length > 0) {
            setIngredientes(data.ingredientes.map((i: { nome: string; percentual: number; funcao: string }) => ({
              nome: i.nome ?? '',
              percentual: String(i.percentual ?? 0),
              funcao: FUNCOES.includes(i.funcao) ? i.funcao : 'Outro',
            })))
          }
          setValidacao(data.observacoes ?? null)
        } catch (parseErr) {
          console.error('[MIA] JSON parse error:', parseErr, 'raw:', jsonMatch[0].slice(0, 300))
        }
      } else {
        console.error('[MIA] No JSON found in response. Full text:', cleaned.slice(0, 500))
      }
    } catch (err) {
      console.error('[MIA] Fetch error:', err)
    }
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
    if (field === 'nome' && value.trim().length >= 3) {
      const ingTouchedFuncao = ingredientes[i]?.funcao && ingredientes[i].funcao !== 'Estruturante' && ingredientes[i].funcao !== 'Outro'
      if (ingTouchedFuncao) return
      const controller = new AbortController()
      autoSuggestRef.current[i]?.abort()
      autoSuggestRef.current[i] = controller
      clearTimeout(autoSuggestTimers.current[i])
      autoSuggestTimers.current[i] = setTimeout(async () => {
        try {
          const res = await fetch(`/api/foods/search?q=${encodeURIComponent(value.trim())}`, { signal: controller.signal })
          const json = await res.json()
          const top = json.results?.[0]
          if (top && top.similarity >= 0.4 && top.funcao_sugerida && FUNCOES.includes(top.funcao_sugerida)) {
            setIngredientes(prev => prev.map((ing, idx) => {
              if (idx !== i) return ing
              const tocado = ing.funcao && ing.funcao !== 'Estruturante' && ing.funcao !== 'Outro'
              return tocado ? ing : { ...ing, funcao: top.funcao_sugerida }
            }))
          }
        } catch { /* ignore */ }
      }, 350)
    }
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
      onCancelar={() => setModo('escolha')}
      onAvancar={() => setModo('wizard_tendencias')}
      avancarDisabled={!aplicacao}
      avancarLabel="Próximo Passo"
    >
      <div className="wiz-head">
        <h2>Escolha a sua <em>aplicação</em></h2>
        <p>Selecione o segmento industrial para o qual deseja desenvolver sua nova formulação biônica.</p>
      </div>
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
      onCancelar={() => setModo('wizard_app')}
      onAvancar={() => setModo('wizard_ingredientes')}
      avancarLabel="Próximo Passo"
    >
      <div className="wiz-head">
        <h2><em>Tendências</em> nutricionais</h2>
        <p>Selecione tendências para que a MIA adapte a formulação ao mercado atual. <span className="wiz-opt">(opcional)</span></p>
      </div>
      <div className="trend-grid">
        {TENDENCIAS.map(t => {
          const on = tendencias.includes(t)
          return (
            <button key={t} onClick={() => toggleTendencia(t)} className={`trend-chip ${on ? 'on' : ''}`}>
              {on && <Check size={13} strokeWidth={2.5} />} {t}
            </button>
          )
        })}
      </div>
    </WizardShell>
  )

  // ─── WIZARD: INGREDIENTES ─────────────────────────────────────
  if (modo === 'wizard_ingredientes') {
    const sugestoes = (INGREDIENTES_SUGERIDOS[aplicacao] ?? []).filter(s => !ingredientesWizard.includes(s))
    return (
      <WizardShell
        passo={3}
        onCancelar={() => setModo('wizard_tendencias')}
        onAvancar={gerarComMIA}
        avancarLabel="Gerar com MIA"
        avancarIcon={<Sparkles size={14} />}
      >
        <div className="wiz-head">
          <h2><em>Ingredientes</em> base</h2>
          <p>Adicione os ingredientes principais. A MIA calculará proporções, sinergia e parâmetros de extrusão automaticamente.</p>
        </div>

        <div className="ing-layout">
          {/* Left: input + suggestions */}
          <div className="ing-left">
            <div className="ing-form">
              <input value={buscaIngrediente} onChange={e => setBuscaIngrediente(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIngredienteWizard(buscaIngrediente)}
                placeholder="Ex: cenoura, batata-doce, proteína de ervilha..."
                className="ing-input" />
              <button onClick={() => addIngredienteWizard(buscaIngrediente)} disabled={!buscaIngrediente.trim()}
                className="ing-add">
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {sugestoes.length > 0 && (
              <>
                <p className="ing-section-label">Sugestões para {APLICACOES.find(a => a.id === aplicacao)?.nome ?? 'sua aplicação'}</p>
                <div className="ing-suggest">
                  {sugestoes.map(s => (
                    <button key={s} onClick={() => addIngredienteWizard(s)} className="ing-sug-chip">
                      <Plus size={11} /> {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: selected (always visible) */}
          <div className={`ing-right ${ingredientesWizard.length > 0 ? 'has-items' : ''}`}>
            <div className="ing-right-header">
              <Sparkles size={14} />
              <span>Ingredientes selecionados</span>
              {ingredientesWizard.length > 0 && <span className="ing-count">{ingredientesWizard.length}</span>}
            </div>
            {ingredientesWizard.length === 0 ? (
              <p className="ing-empty">Clique nas sugestões ou adicione pelo campo ao lado para montar sua base.</p>
            ) : (
              <div className="ing-selected">
                {ingredientesWizard.map((item, idx) => (
                  <span key={item} className="ing-sel-chip" style={{ animationDelay: `${idx * 60}ms` }}>
                    <span className="ing-sel-num">{idx + 1}</span>
                    {item}
                    <button onClick={() => removeIngredienteWizard(item)} aria-label="Remover"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </WizardShell>
    )
  }

  // ─── WIZARD: PROCESSANDO ──────────────────────────────────────
  if (modo === 'wizard_processando') return (<LoadingScreen title="MIA está formulando..." subtitle="Buscando referências e calculando parâmetros" />)

  // ─── STL: GERANDO ─────────────────────────────────────────────
  if (modo === 'stl_gerando') return (<LoadingScreen title="Gerando STL 3D..." subtitle="Calculando geometria e volume" />)

  // ─── STL: PRONTO ──────────────────────────────────────────────
  if (modo === 'stl_pronto') return (
    <>
      <style>{STL_CSS}</style>
      <div className="stl-root">
        <div className="stl-header">
          <button onClick={() => setModo('validar')} className="stl-back">← Voltar</button>
          <h1 className="stl-title">STL Gerado com Sucesso</h1>
        </div>

        <div className="stl-body">
          {stlError && (
            <div className="stl-error"><p>{stlError}</p></div>
          )}

          <div className="stl-card">
            <div className="stl-icon-wrap"><Download size={28} /></div>
            <h2>{stlResult?.filename}</h2>
            <p className="stl-desc">Seu arquivo STL está pronto para download</p>

            {stlResult?.metadata && (
              <div className="stl-meta-grid">
                <div><span>Volume</span><strong>{(stlResult.metadata.volume_mm3 / 1000).toFixed(1)} cm³</strong></div>
                <div><span>Peso Estimado</span><strong>{stlResult.metadata.peso_estimado_g.toFixed(1)}g</strong></div>
                <div><span>Tempo de Impressão</span><strong>~{stlResult.metadata.tempo_impressao_estimado_min}min</strong></div>
                <div><span>Forma</span><strong>{stlResult.metadata.forma}</strong></div>
              </div>
            )}

            <button onClick={baixarSTLHandler} className="stl-download">
              <Download size={16} /> Baixar STL
            </button>
          </div>

          <div className="stl-info">
            <h3>Próximos passos</h3>
            <p>
              1. Abra o PrusaSlicer em seu computador<br />
              2. Importe este arquivo STL (File → Open)<br />
              3. Configure os parâmetros de impressão<br />
              4. Exporte o G-code<br />
              5. Faça upload do G-code aqui para registrar o experimento
            </p>
          </div>

          <button onClick={() => setModo('validar')} className="stl-back-btn">
            <ArrowRight size={16} /> Voltar à Formulação
          </button>
        </div>
      </div>
    </>
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
  onCancelar,
  onAvancar,
  avancarDisabled,
  avancarLabel,
  avancarIcon,
}: {
  passo: number
  children: React.ReactNode
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
                    {isDone ? <Check size={14} strokeWidth={2.5} /> : num}
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

const LOADING_STEPS = [
  'Analisando ingredientes',
  'Calculando sinergia',
  'Otimizando proporções',
  'Ajustando viscosidade',
  'Validando extrusão',
  'Refinando formulação',
]

function LoadingScreen({ title, subtitle }: { title: string; subtitle: string }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % LOADING_STEPS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style>{LOADING_CSS}</style>
      <div className="load-root">
        <div className="load-center">
          <div className="load-logo-wrap">
            <div className="load-ring" />
            <img src="/mia-logo.png" alt="MIA" className="load-logo" />
          </div>
          <h2 className="load-title">{title}</h2>
          <p className="load-sub">{subtitle}</p>
          <div className="load-chips">
            {LOADING_STEPS.map((s, i) => (
              <span key={s} className={`load-chip ${i === activeStep ? 'active' : ''}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

const LOADING_CSS = `
  .load-root{
    display:flex;align-items:center;justify-content:center;
    min-height:calc(100vh - 120px);
    padding:40px;
  }
  .load-center{
    text-align:center;max-width:560px;
    animation:loadFadeIn .5s ease-out;
  }
  @keyframes loadFadeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

  .load-logo-wrap{
    position:relative;
    width:110px;height:110px;
    margin:0 auto 32px;
  }
  .load-ring{
    position:absolute;inset:-6px;
    border-radius:50%;
    border:2.5px solid var(--border-glass-strong);
    border-top-color:var(--accent);
    animation:loadSpin 1.2s linear infinite;
  }
  @keyframes loadSpin{to{transform:rotate(360deg)}}
  .load-logo{
    width:100%;height:100%;
    border-radius:50%;
    object-fit:contain;
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass);
    padding:18px;
    backdrop-filter:blur(12px);
  }

  .load-title{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(28px,3.2vw,38px);letter-spacing:-.015em;
    color:var(--text-main);margin:0 0 10px;
  }
  .load-sub{
    font-size:15px;color:var(--text-muted);margin:0 0 32px;line-height:1.5;
  }

  .load-chips{
    display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
  }
  .load-chip{
    padding:8px 18px;border-radius:999px;
    font-size:13px;font-weight:500;
    background:var(--surface-glass);
    border:1px solid var(--border-glass-strong);
    color:var(--text-faint);
    transition:all .4s ease;
    backdrop-filter:blur(10px);
  }
  .load-chip.active{
    background:var(--accent);
    color:var(--accent-text-on);
    border-color:var(--accent);
    box-shadow:0 8px 22px -8px var(--accent);
    transform:scale(1.06);
    font-weight:600;
  }
`

const STL_CSS = `
  .stl-root{max-width:760px;margin:0 auto;padding:0 24px}
  .stl-header{
    display:flex;align-items:center;gap:14px;
    padding:16px 0;border-bottom:1px solid var(--border-glass);margin-bottom:24px;
  }
  .stl-back{
    background:transparent;border:none;cursor:pointer;
    color:var(--text-muted);font-family:inherit;font-size:13px;
    padding:6px 10px;border-radius:8px;transition:.15s;
  }
  .stl-back:hover{background:var(--hover-tint);color:var(--text-main)}
  .stl-title{font-size:18px;font-weight:600;color:var(--text-main);margin:0}

  .stl-body{display:flex;flex-direction:column;gap:18px;padding-bottom:40px}
  .stl-error{
    padding:14px 18px;border-radius:14px;
    background:rgba(220,38,38,.1);border-left:3px solid rgba(220,38,38,.6);
  }
  .stl-error p{margin:0;font-size:14px;color:var(--text-main)}

  .stl-card{
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass-strong);
    border-radius:20px;padding:28px;text-align:center;
    backdrop-filter:blur(16px);
  }
  .stl-icon-wrap{
    width:60px;height:60px;border-radius:50%;
    display:grid;place-items:center;
    background:var(--icon-tint);color:var(--accent-em);
    margin:0 auto 16px;
  }
  .stl-card h2{font-size:18px;font-weight:600;color:var(--text-main);margin:0 0 6px}
  .stl-desc{font-size:14px;color:var(--text-muted);margin:0 0 20px}

  .stl-meta-grid{
    display:grid;grid-template-columns:1fr 1fr;gap:12px;
    padding:16px;border-radius:14px;
    background:var(--surface-glass);margin-bottom:20px;text-align:left;
  }
  .stl-meta-grid span{font-size:12px;color:var(--text-faint);display:block;margin-bottom:4px}
  .stl-meta-grid strong{font-size:14px;color:var(--text-main);font-weight:600}

  .stl-download{
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    width:100%;padding:12px;border-radius:14px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;
    transition:.15s;
  }
  .stl-download:hover{transform:translateY(-1px);box-shadow:0 12px 26px -10px var(--accent)}

  .stl-info{
    background:var(--surface-glass);
    border:1px solid var(--border-glass-strong);
    border-left:3px solid var(--accent-em);
    border-radius:16px;padding:18px 22px;
  }
  .stl-info h3{font-size:14px;font-weight:600;color:var(--text-main);margin:0 0 8px}
  .stl-info p{font-size:14px;color:var(--text-muted);line-height:1.65;margin:0}

  .stl-back-btn{
    display:flex;align-items:center;justify-content:center;gap:8px;
    width:100%;padding:12px;border-radius:14px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;
    transition:.15s;
  }
  .stl-back-btn:hover{transform:translateY(-1px);box-shadow:0 12px 26px -10px var(--accent)}
`

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
    display:flex;flex-direction:column;
    width:100%;max-width:1180px;margin:0 auto;
    padding:18px 32px 24px;
    color:var(--text-main);
    min-height:calc(100vh - 120px);
  }

  /* ── Step bar ───────────────────────────────────────── */
  .wiz-steps{
    display:flex;align-items:flex-start;
    padding:4px 8px 22px;
    border-bottom:1px solid var(--border-glass);
    margin-bottom:28px;
  }
  .wiz-step-wrap{display:flex;align-items:flex-start;flex:1;gap:10px}
  .wiz-step-col{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:90px}
  .wiz-step-dot{
    width:34px;height:34px;border-radius:50%;
    display:grid;place-items:center;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-muted);
    font-weight:600;font-size:13px;
    transition:.25s;
    backdrop-filter:blur(10px);
  }
  .wiz-step-dot.done{background:var(--accent-em);color:var(--accent-text-on);border-color:transparent}
  .wiz-step-dot.active{background:var(--accent);color:var(--accent-text-on);border-color:transparent;box-shadow:0 0 0 5px var(--icon-tint)}
  .wiz-step-label{font-size:12px;color:var(--text-faint);font-weight:500;letter-spacing:.01em}
  .wiz-step-label.active{color:var(--text-main);font-weight:600}
  .wiz-step-label.done{color:var(--text-muted)}
  .wiz-step-line{
    flex:1;height:1.5px;margin-top:17px;border-radius:2px;
    background:repeating-linear-gradient(90deg, var(--border-glass-strong) 0 6px, transparent 6px 12px);
  }
  .wiz-step-line.done{background:var(--accent-em)}

  /* ── Content area ──────────────────────────────────── */
  .wiz-content{flex:1;padding:8px 0 28px}

  .wiz-head{margin-bottom:30px;max-width:720px}
  .wiz-head h2{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:clamp(30px,3.4vw,42px);line-height:1.08;letter-spacing:-.015em;
    color:var(--text-main) !important;margin:0 0 10px;
  }
  .wiz-head h2 em{font-style:italic;color:var(--accent-em) !important;font-family:inherit}
  .wiz-head p{
    color:var(--text-muted) !important;
    font-size:15px;line-height:1.55;margin:0;
  }
  .wiz-head .wiz-opt{color:var(--text-faint);font-size:13.5px;margin-left:4px}

  /* ── Footer ────────────────────────────────────────── */
  .wiz-footer{
    display:flex;align-items:center;justify-content:space-between;
    padding-top:20px;border-top:1px solid var(--border-glass);
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
    padding:12px 26px;border-radius:999px;
    font-family:inherit;font-size:14px;font-weight:600;
    transition:transform .15s, box-shadow .25s;
  }
  .wiz-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 30px -10px var(--accent)}
  .wiz-next:disabled{opacity:.45;cursor:not-allowed}

  /* ── Aplicação grid ────────────────────────────────── */
  .aplicacoes-grid{
    display:grid;grid-template-columns:repeat(3,1fr);
    gap:18px;
  }
  .aplic-card{
    position:relative;text-align:left;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:20px;padding:22px 22px 24px;
    cursor:pointer;transition:.2s;
    backdrop-filter:blur(16px);
    font-family:inherit;color:var(--text-main);
    min-height:158px;
  }
  .aplic-card:hover{transform:translateY(-3px);border-color:var(--accent-em);box-shadow:0 22px 44px -18px rgba(0,0,0,.28)}
  .aplic-card.active{border-color:var(--accent);background:var(--icon-tint)}
  .aplic-check{
    position:absolute;top:14px;right:14px;
    width:26px;height:26px;border-radius:50%;
    background:var(--accent);color:var(--accent-text-on);
    display:grid;place-items:center;
  }
  .aplic-icon{
    display:inline-grid;place-items:center;
    width:46px;height:46px;border-radius:14px;
    background:var(--icon-tint);
    border:1px solid var(--border-glass);
    color:var(--accent-em);
    margin-bottom:14px;
  }
  .aplic-card.active .aplic-icon{background:var(--accent);color:var(--accent-text-on);border-color:transparent}
  .aplic-nome{
    margin:0 0 6px;font-size:16px;font-weight:600;
    color:var(--text-main) !important;letter-spacing:-.01em;
  }
  .aplic-desc{
    margin:0;font-size:13px;line-height:1.5;
    color:var(--text-muted) !important;
  }

  /* ── Tendências ────────────────────────────────────── */
  .trend-grid{
    display:flex;flex-wrap:wrap;gap:12px;
    max-width:880px;
  }
  .trend-chip{
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 22px;border-radius:999px;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-main);
    font-family:inherit;font-size:14px;font-weight:500;
    cursor:pointer;transition:.18s;
    backdrop-filter:blur(12px);
  }
  .trend-chip:hover{border-color:var(--accent-em);transform:translateY(-1px)}
  .trend-chip.on{
    background:var(--accent);color:var(--accent-text-on);
    border-color:var(--accent);font-weight:600;
    box-shadow:0 10px 24px -10px var(--accent);
  }

  /* ── Ingredientes (two-column layout) ────────────── */
  .ing-layout{
    display:grid;grid-template-columns:1fr 340px;gap:28px;
    align-items:start;
  }
  .ing-left{}
  .ing-form{
    display:flex;gap:10px;margin-bottom:20px;
  }
  .ing-input{
    flex:1;
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    color:var(--text-main);
    border-radius:14px;padding:13px 18px;
    font-family:inherit;font-size:14.5px;
    transition:.15s;backdrop-filter:blur(12px);
  }
  .ing-input::placeholder{color:var(--text-faint)}
  .ing-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--icon-tint)}
  .ing-add{
    display:inline-flex;align-items:center;gap:8px;
    padding:13px 22px;border-radius:14px;
    background:var(--accent);color:var(--accent-text-on);
    border:none;cursor:pointer;
    font-family:inherit;font-size:14px;font-weight:600;
    transition:transform .15s, box-shadow .25s, opacity .15s;
    white-space:nowrap;
  }
  .ing-add:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 26px -10px var(--accent)}
  .ing-add:disabled{opacity:.4;cursor:not-allowed}

  .ing-section-label{
    font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;
    color:var(--text-faint);font-weight:600;
    margin:4px 0 12px;
  }
  .ing-suggest{display:flex;flex-wrap:wrap;gap:8px}
  .ing-sug-chip{
    display:inline-flex;align-items:center;gap:5px;
    padding:9px 16px;border-radius:999px;
    background:var(--surface-glass);
    border:1.5px dashed var(--border-glass-strong);
    color:var(--text-muted);
    font-family:inherit;font-size:13px;
    cursor:pointer;transition:.2s;
  }
  .ing-sug-chip:hover{border-style:solid;border-color:var(--accent-em);color:var(--text-main);background:var(--icon-tint);transform:translateY(-2px)}

  /* Right panel: selected items */
  .ing-right{
    background:var(--surface-glass-strong);
    border:1.5px solid var(--border-glass-strong);
    border-radius:20px;
    padding:20px;
    backdrop-filter:blur(16px);
    min-height:200px;
    transition:.3s;
  }
  .ing-right.has-items{border-color:var(--accent-em)}
  .ing-right-header{
    display:flex;align-items:center;gap:8px;
    font-size:12.5px;font-weight:600;color:var(--accent-em);
    margin-bottom:16px;letter-spacing:.02em;
  }
  .ing-count{
    margin-left:auto;
    width:24px;height:24px;border-radius:50%;
    background:var(--accent);color:var(--accent-text-on);
    display:grid;place-items:center;
    font-size:12px;font-weight:700;
  }
  .ing-empty{
    color:var(--text-faint) !important;font-size:13.5px;line-height:1.55;
    text-align:center;padding:20px 8px;margin:0;
  }
  .ing-selected{display:flex;flex-direction:column;gap:8px}
  .ing-sel-chip{
    display:flex;align-items:center;gap:10px;
    padding:10px 14px;border-radius:14px;
    background:var(--icon-tint);
    border:1px solid var(--accent-em);
    color:var(--text-main);
    font-family:inherit;font-size:14px;font-weight:500;
    animation:ingSlideIn .25s ease-out both;
  }
  @keyframes ingSlideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
  .ing-sel-num{
    width:22px;height:22px;border-radius:50%;
    background:var(--accent);color:var(--accent-text-on);
    display:grid;place-items:center;
    font-size:11px;font-weight:700;flex-shrink:0;
  }
  .ing-sel-chip button{
    display:grid;place-items:center;
    background:transparent;border:none;cursor:pointer;
    color:var(--text-faint);padding:0;margin-left:auto;
    opacity:.7;transition:.15s;
  }
  .ing-sel-chip button:hover{opacity:1;color:var(--accent-em);transform:scale(1.15)}

  @media (max-width:980px){
    .aplicacoes-grid{grid-template-columns:1fr 1fr}
    .ing-layout{grid-template-columns:1fr;gap:20px}
    .ing-right{min-height:auto}
  }
  @media (max-width:700px){
    .aplicacoes-grid{grid-template-columns:1fr}
    .wiz-step-col{min-width:48px}
    .wiz-step-label{display:none}
    .wiz-root{padding:16px 18px}
  }
`

