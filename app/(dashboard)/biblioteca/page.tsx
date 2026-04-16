'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, Library, Sliders, Table2, Upload, BookMarked, ExternalLink, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ArxivEntry } from '@/app/api/arxiv/route'

// ---------------------------------------------------------------------------
// Dados de Parâmetros
// ---------------------------------------------------------------------------

const PARAMS_GUIDE = [
  {
    param: 'Altura de camada',
    range: '50–80% do Ø do bico',
    formula: 'Camada = fator × Ø bico',
    desc: 'Define a precisão vertical e a altura de cada linha extrudada. Valores menores aumentam a resolução e o tempo de impressão. Valores maiores aceleram, mas reduzem o detalhe e a adesão entre camadas. A faixa recomendada é 50–80% do diâmetro do bico.',
    tip: 'Para análogos com detalhes superficiais finos, use 40–50% do Ø. Para produção, 65–80%.',
  },
  {
    param: 'Fator de extrusão',
    range: '90–110% (ajuste empírico)',
    formula: 'E_efetivo = E_teórico × fator',
    desc: 'Multiplicador aplicado sobre o cálculo geométrico de extrusão. Um fator acima de 100% aumenta o volume de material por mm de percurso — útil quando há retração ou compressibilidade da pasta. Abaixo de 100%, reduz o material — útil para pastas altamente expansivas.',
    tip: 'Comece em 100%. Ajuste ±5% com base no resultado visual. Excesso: linhas se fundem. Deficiência: gaps visíveis entre linhas.',
  },
  {
    param: 'Velocidade de impressão',
    range: '5–30 mm/s',
    formula: 'v_pistão = E/mm × v_impressão',
    desc: 'Velocidade de avanço do cabeçote no plano XY. Pastas de alta viscosidade requerem velocidades menores para dar tempo ao pistão de pressurizar o fluxo. Velocidades altas com pastas densas causam subextrusão ou ruptura do filamento.',
    tip: 'Pastas fluidas (xantana <0,5%): até 25 mm/s. Pastas densas (proteínas, amidos altos): 5–12 mm/s. Reduza se o filamento ondular ou rachar.',
  },
  {
    param: 'Altura da mesa (offset Z)',
    range: '0,1–0,5 mm acima da mesa',
    formula: 'Z_offset = distância bico → superfície',
    desc: 'Distância entre a ponteira e a superfície de impressão na primeira camada. Se muito alto, o material cai sem aderir, formando "cobrinhas" soltas. Se muito baixo, a ponteira arrasta o material. O ponto ideal é quando a primeira linha fica levemente achatada e adere à superfície.',
    tip: 'Comece com Z_offset = 0,8 × altura da camada. Se a primeira camada parecer "cobrinha" solta, diminua o offset. Se a ponteira arrastar, aumente.',
  },
  {
    param: 'Velocidade de deslocamento (travel)',
    range: '40–80 mm/s',
    formula: '—',
    desc: 'Velocidade do cabeçote ao se mover sem extrudar. Em impressão alimentar, velocidades altas de travel podem arrastar material ainda fluido da camada anterior. Velocidades muito baixas aumentam o tempo ocioso com risco de gotejamento.',
    tip: 'Use 50 mm/s como padrão. Para pastas com alta tendência a gotejamento, reduza para 30 mm/s e adicione retraction se o firmware suportar.',
  },
  {
    param: 'Número de perímetros',
    range: '2–4',
    formula: '—',
    desc: 'Quantidade de contornos externos antes do preenchimento interno. Mais perímetros aumentam a resistência estrutural lateral e a definição da superfície. Para análogos de carne ou peças com paredes definidas, use 3–4 perímetros.',
    tip: 'Para testes: 2 perímetros. Para peças finais com boa resistência: 3–4. Cada perímetro adicional equivale a uma passagem do bico na borda.',
  },
  {
    param: 'Temperatura de extrusão',
    range: 'Varia por formulação',
    formula: '—',
    desc: 'Temperatura da pasta no momento da extrusão. Géis frios (gelatina, metilcelulose) devem ser impressos abaixo de 20°C para manter a estrutura. Géis quentes (HPMC, carragena) são extrudados aquecidos (50–70°C) e estruturam ao resfriar. A temperatura afeta diretamente a viscosidade e a yield stress.',
    tip: 'Géis frios: use câmara fria ou gelo ativo. Géis quentes: mantenha a seringa aquecida e imprima rapidamente antes do resfriamento prematuro.',
  },
  {
    param: 'Diâmetro do bico (ponteira)',
    range: '0,6–3,2 mm',
    formula: 'E/mm = (d_bico / d_seringa)²',
    desc: 'Dimensiona a resolução do filamento e o E/mm geométrico. Bicos menores oferecem maior resolução mas exigem pastas mais finas (baixa granulometria). Bicos maiores suportam pastas com fibras e grânulos maiores.',
    tip: 'Regra geral: diâmetro de partícula máximo = 1/3 do Ø do bico. Para purês finos: 0,6–0,8 mm. Para análogos com fibras: 1,6–3,2 mm.',
  },
  {
    param: 'Padrão de preenchimento',
    range: 'Concêntrico / Retilíneo / Favo',
    formula: '—',
    desc: 'Define o trajeto do cabeçote dentro do perímetro. Concêntrico é ideal para formas redondas e melhora a textura. Retilíneo (0°/90° alternado) distribui o material de forma homogênea. Favo (hexagonal) cria câmaras de ar que alteram a textura e a densidade percebida.',
    tip: 'Use concêntrico para análogos de frutos do mar e formas redondas. Retilíneo para cubos e produtos planos. Favo para alimentos que precisam de leveza estrutural.',
  },
  {
    param: 'Yield stress (τ₀)',
    range: '50–500 Pa',
    formula: 'τ = τ₀ + K · γ̇ⁿ  (Herschel-Bulkley)',
    desc: 'Tensão mínima que a pasta precisa sofrer para começar a escoar. Abaixo de 50 Pa, a pasta colapsa sob o próprio peso após impressão. Acima de 500 Pa, pode haver dificuldade de extrusão ou entupimento. O valor ideal depende da geometria — peças altas precisam de τ₀ maior.',
    tip: 'Teste empírico: a pasta que mantém um sulco ao ser cortada com espátula tem τ₀ > 50 Pa. Se colapsar imediatamente, aumente hidrocolóide estruturante.',
  },
]

const ABAS = [
  { id: 'parametros', label: 'Guia de Parâmetros', icon: Sliders },
  { id: 'taco',       label: 'TACO',               icon: Table2 },
  { id: 'artigos',    label: 'Artigos KB',          icon: Upload },
  { id: 'pesquisar',  label: 'Pesquisar',           icon: BookMarked },
]
type AbaId = 'parametros' | 'taco' | 'artigos' | 'pesquisar'

// ---------------------------------------------------------------------------
// Componente TACO search
// ---------------------------------------------------------------------------

interface TacoAlimento {
  id: number
  descricao: string
  categoria: string
  energia_kcal: number | null
  proteina_g: number | null
  carboidrato_g: number | null
  lipidios_g: number | null
  fibra_g: number | null
  sodio_mg: number | null
  calcio_mg: number | null
  ferro_mg: number | null
  vitamina_c_mg: number | null
  vitamina_a_ug: number | null
  magnesio_mg: number | null
  fosforo_mg: number | null
  potassio_mg: number | null
  zinco_mg: number | null
  cobre_mg: number | null
  saturados_g: number | null
  monoinsaturados_g: number | null
  polinsaturados_g: number | null
  trans_g: number | null
  colesterol_mg: number | null
  leucina_g: number | null
  lisina_g: number | null
  triptofano_g: number | null
}

function TacoSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<TacoAlimento[]>([])
  const [selected, setSelected] = useState<TacoAlimento | null>(null)
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (q.length < 2) { setResults([]); return }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/taco/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setLoading(false)
    }, 300)
  }, [q])

  function fmt(v: number | null, unit = '') {
    if (v == null) return '—'
    return `${v}${unit}`
  }

  return (
    <div>
      <p className="text-xs text-[#58413c] mb-4">
        Tabela Brasileira de Composição de Alimentos — TACO 4ª edição (UNICAMP). Valores por 100 g de parte comestível.
      </p>
      <div className="relative max-w-md mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58413c]" />
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); setSelected(null) }}
          placeholder="Digite o nome do alimento..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#e5d9c1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003223]/20"
        />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#58413c]" />}
      </div>

      {/* Sugestões */}
      {results.length > 0 && !selected && (
        <div className="bg-white border border-[#e5d9c1] rounded-xl overflow-hidden mb-4 max-w-md shadow-sm">
          {results.map((r, i) => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-[#fff8f1] transition-colors ${i > 0 ? 'border-t border-[#e5d9c1]' : ''}`}>
              <span className="font-medium truncate">{r.descricao}</span>
              <span className="text-xs text-[#58413c] ml-3 flex-shrink-0">{r.categoria}</span>
            </button>
          ))}
        </div>
      )}

      {/* Resultado detalhado */}
      {selected && (
        <div className="bg-white border border-[#e5d9c1] rounded-2xl p-5 max-w-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-base">{selected.descricao}</h3>
              <p className="text-xs text-[#58413c] mt-0.5">{selected.categoria}</p>
            </div>
            <button onClick={() => setSelected(null)}
              className="text-xs text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2.5 py-1 rounded-lg">
              Nova busca
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-5">
            {[
              ['Energia', fmt(selected.energia_kcal, ' kcal'), 'text-[#003223]'],
              ['Proteína', fmt(selected.proteina_g, ' g'), 'text-blue-500'],
              ['Carboidrato', fmt(selected.carboidrato_g, ' g'), 'text-amber-500'],
              ['Lipídios', fmt(selected.lipidios_g, ' g'), 'text-orange-400'],
              ['Fibra', fmt(selected.fibra_g, ' g'), 'text-green-500'],
              ['Sódio', fmt(selected.sodio_mg, ' mg'), 'text-red-400'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-xl p-3">
                <p className="text-[#58413c] mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#e5d9c1] pt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
            {[
              ['Cálcio', fmt(selected.calcio_mg, ' mg')],
              ['Ferro', fmt(selected.ferro_mg, ' mg')],
              ['Magnésio', fmt(selected.magnesio_mg, ' mg')],
              ['Fósforo', fmt(selected.fosforo_mg, ' mg')],
              ['Potássio', fmt(selected.potassio_mg, ' mg')],
              ['Zinco', fmt(selected.zinco_mg, ' mg')],
              ['Cobre', fmt(selected.cobre_mg, ' mg')],
              ['Vit C', fmt(selected.vitamina_c_mg, ' mg')],
              ['Vit A', fmt(selected.vitamina_a_ug, ' µg')],
              ['Colesterol', fmt(selected.colesterol_mg, ' mg')],
              ['AG Sat.', fmt(selected.saturados_g, ' g')],
              ['AG Mono.', fmt(selected.monoinsaturados_g, ' g')],
              ['AG Poli.', fmt(selected.polinsaturados_g, ' g')],
              ['Trans', fmt(selected.trans_g, ' g')],
            ].map(([l, v]) => (
              <div key={l as string} className="flex justify-between border-b border-[#e5d9c1] py-1">
                <span className="text-[#58413c]">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {(selected.leucina_g != null || selected.lisina_g != null) && (
              <>
                <div className="flex justify-between border-b border-[#e5d9c1] py-1">
                  <span className="text-[#58413c]">Leucina</span>
                  <span className="font-medium">{fmt(selected.leucina_g, ' g')}</span>
                </div>
                <div className="flex justify-between border-b border-[#e5d9c1] py-1">
                  <span className="text-[#58413c]">Lisina</span>
                  <span className="font-medium">{fmt(selected.lisina_g, ' g')}</span>
                </div>
                <div className="flex justify-between border-b border-[#e5d9c1] py-1">
                  <span className="text-[#58413c]">Triptofano</span>
                  <span className="font-medium">{fmt(selected.triptofano_g, ' g')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {q.length >= 2 && results.length === 0 && !loading && !selected && (
        <p className="text-sm text-[#58413c]">Nenhum alimento encontrado para &quot;{q}&quot;.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Artigos KB (DOI)
// ---------------------------------------------------------------------------

function ArtigosKB() {
  const [doi, setDoi] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    indexed?: boolean
    title?: string
    authors?: string
    journal?: string
    year?: number
    chunks?: number
    abstract?: string
    message?: string
    error?: string
  } | null>(null)

  async function indexar() {
    if (!doi.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi }),
      })
      const data = await res.json()
      setResult(data)
      if (data.ok && data.indexed) setDoi('')
    } catch {
      setResult({ ok: false, error: 'Erro de rede.' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white rounded-2xl border border-[#e5d9c1] p-5">
        <h2 className="font-semibold text-sm mb-1">Indexar artigo por DOI</h2>
        <p className="text-xs text-[#58413c] mb-4">
          O abstract e os metadados são extraídos via Crossref e indexados na base de conhecimento da MIA.
          O conteúdo fica disponível para todos os usuários.
        </p>
        <div className="flex gap-2">
          <input value={doi} onChange={e => setDoi(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && indexar()}
            placeholder="ex: 10.1016/j.foodhyd.2020.106035"
            className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 font-mono" />
          <button onClick={indexar} disabled={!doi.trim() || loading}
            className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm px-4 py-2 rounded-xl transition-colors">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {loading ? 'Buscando…' : 'Indexar'}
          </button>
        </div>
        <p className="text-[10px] text-[#bfc9c2] mt-2">Cole o DOI completo (ex: 10.1016/...) ou a URL completa (doi.org/...)</p>
      </div>

      {result && (
        <div className={`rounded-2xl border p-4 ${result.ok && result.indexed ? 'bg-green-50 border-green-200' : result.ok ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          {result.error && (
            <p className="text-sm text-red-600">{result.error}</p>
          )}
          {result.ok && result.title && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                {result.indexed
                  ? <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  : <span className="text-amber-600 flex-shrink-0">⚠</span>
                }
                <div>
                  <p className="text-sm font-semibold">{result.title}</p>
                  {result.authors && <p className="text-xs text-[#58413c] mt-0.5">{result.authors}</p>}
                  {result.journal && <p className="text-xs text-[#58413c]">{result.journal}{result.year ? ` · ${result.year}` : ''}</p>}
                </div>
              </div>
              {result.indexed && result.chunks && (
                <p className="text-xs text-green-700 font-medium">{result.chunks} trecho(s) indexados na base da MIA.</p>
              )}
              {result.abstract && (
                <p className="text-xs text-[#58413c] italic leading-relaxed">{result.abstract}</p>
              )}
              {result.message && (
                <p className="text-xs text-amber-700">{result.message}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pesquisar arXiv
// ---------------------------------------------------------------------------

function PesquisarArxiv() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<ArxivEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState<string | null>(null)

  async function buscar() {
    if (!q.trim()) return
    setLoading(true)
    // Sempre contextualiza no domínio de impressão 3D de alimentos
    const query = `${q.trim()} 3D food printing`
    try {
      const res = await fetch(`/api/arxiv?q=${encodeURIComponent(query)}&max=12`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  async function adicionarKB(entry: ArxivEntry) {
    setAdding(entry.id)
    const content = `${entry.title}\n\nAutores: ${entry.authors}\nPublicado: ${entry.published}\nCategoria arXiv: ${entry.categories}\n\n${entry.summary}`
    await fetch('/api/kb/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: entry.title, source: entry.link, category: 'artigo-cientifico', content }),
    })
    setAdded(prev => new Set([...prev, entry.id]))
    setAdding(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#e5d9c1] p-5">
        <h2 className="font-semibold text-sm mb-1">Pesquisar artigos científicos</h2>
        <p className="text-xs text-[#58413c] mb-4">
          Busca no arXiv dentro do contexto de impressão 3D de alimentos. Digite qualquer tema — a busca é automaticamente direcionada para este domínio.
        </p>
        <div className="flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="ex: purê de batata, proteína de ervilha, xantana..."
            className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
          <button onClick={buscar} disabled={!q.trim() || loading}
            className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm px-4 py-2 rounded-xl transition-colors">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
        <p className="text-[10px] text-[#bfc9c2] mt-2">A query &quot;{q ? q + ' ' : ''}3D food printing&quot; é enviada ao arXiv automaticamente.</p>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[#58413c]">{results.length} resultado(s) — clique em &quot;Adicionar à MIA&quot; nos artigos relevantes.</p>
          {results.map(entry => {
            const isAdded = added.has(entry.id)
            const isAdding = adding === entry.id
            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-[#e5d9c1] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-snug mb-1">{entry.title}</h3>
                    <p className="text-xs text-[#58413c]">{entry.authors} · {entry.published}</p>
                    {entry.categories && (
                      <span className="inline-block text-[10px] font-mono bg-[rgba(0,50,35,0.06)] text-[#003223] px-1.5 py-0.5 rounded border border-[#e5d9c1] mt-1">{entry.categories}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <a href={entry.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2 py-1 rounded-lg transition-colors">
                      <ExternalLink size={10} /> Ver
                    </a>
                    <button onClick={() => !isAdded && adicionarKB(entry)} disabled={isAdded || isAdding}
                      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors ${isAdded ? 'bg-green-50 border border-green-200 text-green-700 cursor-default' : 'bg-[#003223] hover:bg-[#004d35] text-white'} disabled:opacity-60`}>
                      {isAdding ? <Loader2 size={10} className="animate-spin" /> : isAdded ? <CheckCircle2 size={10} /> : <Upload size={10} />}
                      {isAdding ? '…' : isAdded ? 'Adicionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#58413c] leading-relaxed mt-2 line-clamp-3">{entry.summary}</p>
              </div>
            )
          })}
        </div>
      )}

      {!loading && results.length === 0 && q && (
        <p className="text-sm text-center text-[#58413c] py-8">Clique em &quot;Buscar&quot; para pesquisar.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function BibliotecaPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>('parametros')
  const [busca, setBusca] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)

  const paramsFiltered = PARAMS_GUIDE.filter(p =>
    busca === '' ||
    p.param.toLowerCase().includes(busca.toLowerCase()) ||
    p.desc.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Library size={16} className="text-[#003223]" />
            <h1 className="text-2xl font-bold">Biblioteca</h1>
          </div>
          {abaAtiva === 'parametros' && (
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58413c]" />
              <input type="text" placeholder="Buscar parâmetro..."
                value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#fff8f1] border border-[#e5d9c1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003223]/10 placeholder:text-[#bfc9c2]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="section-alt border-b border-[#e5d9c1] px-8">
        <div className="max-w-4xl mx-auto flex gap-1 py-2 overflow-x-auto">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => { setAbaAtiva(id as AbaId); setBusca('') }}
              className={abaAtiva === id ? 'tab-pill-active flex items-center gap-1.5 whitespace-nowrap' : 'tab-pill-inactive flex items-center gap-1.5 whitespace-nowrap'}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-6">

        {/* PARÂMETROS */}
        {abaAtiva === 'parametros' && (
          <div className="space-y-2">
            <p className="text-xs text-[#58413c] mb-4">
              Guia técnico de parâmetros de impressão 3D de alimentos com extrusão por seringa de deslocamento positivo.
              Clique em cada parâmetro para expandir a explicação completa.
            </p>
            {paramsFiltered.map(p => {
              const open = expandido === p.param
              return (
                <div key={p.param} className="bg-white border border-[#e5d9c1] rounded-xl overflow-hidden">
                  <button onClick={() => setExpandido(open ? null : p.param)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#fff8f1] transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{p.param}</p>
                        <p className="text-xs text-[#003223] font-mono mt-0.5">{p.range}</p>
                      </div>
                      {!open && (
                        <p className="text-xs text-[#58413c] hidden sm:block truncate max-w-xs">{p.desc.slice(0, 80)}…</p>
                      )}
                    </div>
                    {open ? <ChevronUp size={15} className="text-[#58413c] flex-shrink-0 ml-3" /> : <ChevronDown size={15} className="text-[#58413c] flex-shrink-0 ml-3" />}
                  </button>

                  {open && (
                    <div className="border-t border-[#e5d9c1] px-5 py-4 space-y-3">
                      {p.formula !== '—' && (
                        <div className="bg-[#fff8f1] rounded-lg px-4 py-2 font-mono text-sm text-[#003223] text-center border border-[#e5d9c1]">
                          {p.formula}
                        </div>
                      )}
                      <p className="text-sm text-[#58413c] leading-relaxed">{p.desc}</p>
                      <div className="bg-[#003223]/5 border border-[#003223]/10 rounded-lg px-4 py-2.5">
                        <p className="text-xs font-semibold text-[#003223] mb-0.5">Dica pratica</p>
                        <p className="text-xs text-[#003223]/80 leading-relaxed">{p.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {paramsFiltered.length === 0 && (
              <p className="text-center text-sm text-[#58413c] py-12">Nenhum parâmetro encontrado para &quot;{busca}&quot;</p>
            )}
          </div>
        )}

        {/* TACO */}
        {abaAtiva === 'taco' && <TacoSearch />}

        {/* ARTIGOS KB */}
        {abaAtiva === 'artigos' && <ArtigosKB />}

        {/* PESQUISAR */}
        {abaAtiva === 'pesquisar' && <PesquisarArxiv />}
      </div>
    </div>
  )
}
