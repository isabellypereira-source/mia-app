'use client'
import { useState, useMemo } from 'react'
import { Search, Library, Droplets, BarChart3, Sliders, Table2, FileText, AlertTriangle, Upload, BookMarked, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react'
import type { ArxivEntry } from '@/app/api/arxiv/route'

/* ─── DADOS ─── */

const HIDROCOLOIDES = [
  {
    nome: 'Xantana',
    concentracao: '0,1–1,5%',
    mecanismo: 'Shear-thinning pronunciado — viscosidade cai sob cisalhamento e recupera',
    uso: 'Agente estruturante universal, sinergismo com goma guar',
    temperatura: 'Temperatura ambiente',
    imprimibilidade: 'Alta',
    cor: 'bg-amber-400',
    obs: 'Acima de 1,5% pode causar excesso de viscosidade. Hidratar antes em água fria.',
  },
  {
    nome: 'HPMC',
    concentracao: '1–4%',
    mecanismo: 'Gelificação térmica reversa: fluidifica ao aquecer (40–60°C), gelifica ao resfriar',
    uso: 'Excelente para impressão a quente — único HC que gelifica com calor',
    temperatura: 'Frio para extrusar, quente para gelificar',
    imprimibilidade: 'Muito alta',
    cor: 'bg-blue-400',
    obs: 'Dispersar a frio primeiro. Evita gelificação prematura durante hidratação.',
  },
  {
    nome: 'Alginato de Sódio',
    concentracao: '1–3%',
    mecanismo: 'Gelificação iônica irreversível com Ca²⁺ — forma gel estável após extrusão',
    uso: 'Estruturas frias, análogos de frutos do mar, encapsulação',
    temperatura: 'Temperatura ambiente ou fria',
    imprimibilidade: 'Alta',
    cor: 'bg-cyan-400',
    obs: 'Adicionar cloreto de cálcio pós-impressão (1–2%) para gelificação. Evitar pré-mistura com Ca²⁺.',
  },
  {
    nome: 'Carragena',
    concentracao: '0,5–2%',
    mecanismo: 'Gel termorreversível — solidifica ao resfriar abaixo de ~40°C (κ) ou ~70°C (ι)',
    uso: 'Produtos lácteos, sobremesas, géis com textura firme',
    temperatura: 'Impressão quente (60–70°C), estruturação a frio',
    imprimibilidade: 'Alta',
    cor: 'bg-indigo-400',
    obs: 'κ-carragena: gel firme e quebradiço. ι-carragena: gel elástico. Escolher conforme aplicação.',
  },
  {
    nome: 'Pectina',
    concentracao: '0,5–2%',
    mecanismo: 'Gel ácido-dependente (pH < 4) com Ca²⁺ ou alto teor de açúcar (HM-pectina)',
    uso: 'Formulações ácidas, análogos de frutas, geleias impressas',
    temperatura: 'Temperatura ambiente',
    imprimibilidade: 'Moderada',
    cor: 'bg-orange-400',
    obs: 'HM-pectina: precisa de açúcar (>55%) e pH < 3,5. LM-pectina: gelifica com Ca²⁺ em qualquer pH.',
  },
  {
    nome: 'Gelatina',
    concentracao: '2–10%',
    mecanismo: 'Gel termorreversível frio — fluidifica acima de ~35°C, gelifica ao resfriar',
    uso: 'Sobremesas, confeitaria, análogos proteicos',
    temperatura: 'Impressão fria (4–15°C)',
    imprimibilidade: 'Alta (fria)',
    cor: 'bg-pink-400',
    obs: 'Manter abaixo de 20°C durante impressão. Evitar temperaturas altas na formulação.',
  },
  {
    nome: 'Metilcelulose',
    concentracao: '1–4%',
    mecanismo: 'Gelificação térmica direta (40–50°C) — comportamento oposto à maioria dos HCs',
    uso: 'Análogos de carne, produtos que precisam manter forma ao cozinhar',
    temperatura: 'Frio para extrusar (<20°C), estrutura com calor',
    imprimibilidade: 'Muito alta',
    cor: 'bg-green-400',
    obs: 'Hidratar sempre a frio (4°C por 12–24h). Único HC que gelifica irreversivelmente ao aquecer.',
  },
]

const AMIDOS = [
  { nome: 'Mandioca (tapioca)', gelatinizacao: '58–70°C', caracteristica: 'Altamente digestível, sabor neutro, pasta coesa' },
  { nome: 'Milho normal', gelatinizacao: '62–72°C', caracteristica: 'Alta amilose — rede mais firme, maior retrogradação' },
  { nome: 'Milho ceroso (waxy)', gelatinizacao: '62–72°C', caracteristica: 'Baixa amilose, pasta coesa, mínima retrogradação' },
  { nome: 'Batata', gelatinizacao: '58–68°C', caracteristica: 'Grânulos grandes, alta viscosidade, sabor neutro' },
  { nome: 'Batata-doce', gelatinizacao: '60–80°C', caracteristica: 'Sabor característico, boa imprimibilidade, digestível' },
  { nome: 'Arroz', gelatinizacao: '68–78°C', caracteristica: 'Sem glúten, sabor neutro, boa para snacks' },
  { nome: 'Aveia', gelatinizacao: '55–65°C', caracteristica: 'Alto β-glucano (funcional), textura coesa' },
]

const TROUBLESHOOTING = [
  {
    problema: 'Material não extrusa / entupimento',
    causas: ['Viscosidade muito alta', 'Ponteira muito fina para granulometria', 'Partícula > 1/3 do diâmetro do bico', 'Temperatura inadequada (muito fria)'],
    solucoes: ['Aumentar ponteira (usar ≥ 1,6 mm)', 'Aumentar temperatura da pasta', 'Processar melhor os ingredientes (moer, peneirar)', 'Aumentar fator de extrusão (5–10%)'],
    icone: '🚫',
  },
  {
    problema: 'Colapso estrutural durante impressão',
    causas: ['Yield stress < 50 Pa (insuficiente)', 'Excesso de fase aquosa livre', 'Hidrocolóide insuficiente ou mal hidratado'],
    solucoes: ['Aumentar concentração de HC estruturante (+0,2–0,5%)', 'Reduzir teor de água da formulação', 'Verificar hidratação do HC (tempo e temperatura)'],
    icone: '🏗️',
  },
  {
    problema: 'Filamento irregular / inconsistente',
    causas: ['Bolhas de ar na pasta', 'Viscosidade instável (sinérese)', 'Pressão inconsistente no cartucho'],
    solucoes: ['Centrifugar pasta antes (500 rpm, 2 min)', 'Purgar o cartucho até fluxo estável', 'Verificar vedação do cartucho'],
    icone: '〰️',
  },
  {
    problema: 'Baixa adesão entre camadas',
    causas: ['Altura de camada muito grande', 'Velocidade de impressão muito alta', 'Temperatura muito baixa (gelatina/metilcelulose)'],
    solucoes: ['Reduzir altura de camada para 50–60% do diâmetro do bico', 'Reduzir velocidade de impressão em 20%', 'Ajustar temperatura de impressão para o material'],
    icone: '📐',
  },
  {
    problema: 'Exsudação / sinérese',
    causas: ['Emulsão instável — falta de emulsificante', 'Retrogradação de amido', 'Temperatura de armazenamento inadequada'],
    solucoes: ['Adicionar lecitina (0,5–2%) ou mono/diglicerídeos', 'Usar amido ceroso (waxy) para reduzir retrogradação', 'Armazenar < 4°C e consumir em 24h'],
    icone: '💧',
  },
  {
    problema: 'Deformação pós-impressão',
    causas: ['Yield stress inadequado para o formato escolhido', 'Temperatura ambiente alta', 'Estrutura sem reforço lateral suficiente'],
    solucoes: ['Imprimir direto em bandeja fria ou câmara fria', 'Aumentar número de perímetros no slicer', 'Adicionar agente gelificante secundário'],
    icone: '🔀',
  },
]

const PARAMETROS_REFERENCIA = [
  { parametro: 'Yield stress ideal (τ₀)', valor: '50–500 Pa', observacao: 'Abaixo de 50 Pa colapsa; acima de 500 Pa pode não extrusar' },
  { parametro: 'Viscosidade aparente', valor: '10³–10⁵ mPa·s', observacao: 'Na taxa de cisalhamento de impressão (10–100 s⁻¹)' },
  { parametro: 'Relação G\' > G\'\'', valor: 'G\'/G\'\' > 1', observacao: 'Comportamento sólido-like garante forma pós-impressão' },
  { parametro: 'tan δ', valor: '< 1', observacao: 'Indica dominância elástica — estrutura estável' },
  { parametro: 'Índice de fluxo (n)', valor: '< 1', observacao: 'Shear-thinning: essencial para extrusão fluida e resolução' },
  { parametro: 'Diâmetro da ponteira', valor: '0,6–3,2 mm', observacao: 'Mais comum: 0,8–1,6 mm para alimentos processados' },
  { parametro: 'Altura de camada', valor: '50–80% do Ø bico', observacao: 'Menor = mais precisão; maior = mais velocidade' },
  { parametro: 'Fator de extrusão', valor: '90–110%', observacao: 'Ajuste fino do fluxo do motor mecânico (não pneumático)' },
  { parametro: 'Velocidade de impressão', valor: '5–30 mm/s', observacao: 'Depende da viscosidade — mais viscoso = mais lento' },
  { parametro: 'Temperatura (géis frios)', valor: '4–15°C', observacao: 'Gelatina, metilcelulose (inversão térmica)' },
  { parametro: 'Temperatura (géis quentes)', valor: '50–80°C', observacao: 'HPMC, carragena, formulações cozidas' },
]

const TACO_DADOS = [
  { nome: 'Água', kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  { nome: 'Arroz integral cru', kcal: 360, prot: 7.3, carb: 77.5, gor: 1.9, fib: 4.8, sod: 8 },
  { nome: 'Arroz tipo 1 cru', kcal: 358, prot: 7.2, carb: 78.8, gor: 0.3, fib: 1.6, sod: 4 },
  { nome: 'Aveia flocos', kcal: 394, prot: 13.9, carb: 66.6, gor: 8.5, fib: 9.1, sod: 5 },
  { nome: 'Batata-doce cozida', kcal: 77, prot: 1.4, carb: 18.4, gor: 0.1, fib: 2.5, sod: 44 },
  { nome: 'Batata-doce crua', kcal: 86, prot: 1.6, carb: 20.1, gor: 0.1, fib: 3.0, sod: 55 },
  { nome: 'Mandioca crua', kcal: 157, prot: 1.4, carb: 38.1, gor: 0.3, fib: 1.9, sod: 14 },
  { nome: 'Farinha de mandioca', kcal: 363, prot: 1.8, carb: 88.0, gor: 0.3, fib: 6.4, sod: 5 },
  { nome: 'Amido de milho', kcal: 381, prot: 0.3, carb: 91.3, gor: 0.1, fib: 0.9, sod: 8 },
  { nome: 'Farinha de trigo', kcal: 360, prot: 9.8, carb: 75.1, gor: 1.4, fib: 2.3, sod: 2 },
  { nome: 'Farinha de arroz', kcal: 361, prot: 6.5, carb: 80.2, gor: 0.5, fib: 1.7, sod: 1 },
  { nome: 'Ervilha cozida', kcal: 81, prot: 5.4, carb: 14.4, gor: 0.4, fib: 5.7, sod: 5 },
  { nome: 'Cenoura crua', kcal: 41, prot: 0.9, carb: 9.6, gor: 0.2, fib: 2.8, sod: 69 },
  { nome: 'Espinafre cru', kcal: 23, prot: 2.9, carb: 3.6, gor: 0.4, fib: 2.2, sod: 79 },
  { nome: 'Proteína de soja', kcal: 338, prot: 80.0, carb: 5.0, gor: 0.5, fib: 3.5, sod: 900 },
  { nome: 'Proteína de ervilha', kcal: 352, prot: 78.0, carb: 6.0, gor: 2.5, fib: 3.0, sod: 280 },
  { nome: 'Gelatina (pó)', kcal: 335, prot: 85.6, carb: 0, gor: 0.1, fib: 0, sod: 196 },
  { nome: 'Óleo vegetal', kcal: 884, prot: 0, carb: 0, gor: 100, fib: 0, sod: 0 },
  { nome: 'Sal', kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 38758 },
  { nome: 'Açúcar refinado', kcal: 387, prot: 0, carb: 99.5, gor: 0, fib: 0, sod: 1 },
  { nome: 'Spirulina', kcal: 290, prot: 57.5, carb: 23.9, gor: 7.7, fib: 3.6, sod: 1048 },
  { nome: 'Tofu', kcal: 76, prot: 8.1, carb: 1.9, gor: 4.2, fib: 0.3, sod: 7 },
  { nome: 'Frango cozido (peito)', kcal: 159, prot: 32.0, carb: 0, gor: 2.5, fib: 0, sod: 77 },
  { nome: 'Atum em água (drenado)', kcal: 119, prot: 26.0, carb: 0, gor: 1.1, fib: 0, sod: 376 },
  { nome: 'Cúrcuma (pó)', kcal: 354, prot: 7.8, carb: 64.9, gor: 9.9, fib: 21.1, sod: 38 },
  { nome: 'Leite integral', kcal: 61, prot: 3.2, carb: 4.5, gor: 3.4, fib: 0, sod: 45 },
  { nome: 'Chocolate em pó', kcal: 312, prot: 17.6, carb: 57.9, gor: 13.7, fib: 26.9, sod: 57 },
]

const ABAS = [
  { id: 'hidrocoloides', label: 'Hidrocolóides', icon: Droplets },
  { id: 'reologia', label: 'Reologia', icon: BarChart3 },
  { id: 'parametros', label: 'Parâmetros', icon: Sliders },
  { id: 'taco', label: 'TACO', icon: Table2 },
  { id: 'troubleshooting', label: 'Diagnóstico', icon: AlertTriangle },
  { id: 'amidos', label: 'Amidos', icon: FileText },
  { id: 'artigos', label: 'Artigos KB', icon: Upload },
  { id: 'pesquisar', label: 'Pesquisar', icon: BookMarked },
]

type AbaId = 'hidrocoloides' | 'reologia' | 'parametros' | 'taco' | 'troubleshooting' | 'amidos' | 'artigos' | 'pesquisar'

// ---------------------------------------------------------------------------
// Queries padrão para impressão alimentar com extrusão por deslocamento positivo
// ---------------------------------------------------------------------------
const QUERIES_SUGERIDAS = [
  'food 3D printing positive displacement extrusion',
  'food bioprinting syringe extrusion hydrocolloid',
  'positive displacement extruder food paste printing',
  'food 3D printing rheology printability',
  'food additive manufacturing texture modification',
]

export default function BibliotecaPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>('hidrocoloides')
  const [busca, setBusca] = useState('')

  // ── Artigos KB ──
  const [artTitle, setArtTitle] = useState('')
  const [artSource, setArtSource] = useState('')
  const [artCategory, setArtCategory] = useState('extrusao-deslocamento')
  const [artContent, setArtContent] = useState('')
  const [artLoading, setArtLoading] = useState(false)
  const [artResult, setArtResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function submeterArtigo() {
    if (artContent.trim().length < 100) { setArtResult({ ok: false, msg: 'Cole pelo menos 100 caracteres de conteúdo.' }); return }
    setArtLoading(true); setArtResult(null)
    try {
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: artTitle, source: artSource, category: artCategory, content: artContent }),
      })
      const data = await res.json()
      if (res.ok) {
        setArtResult({ ok: true, msg: `Indexado com sucesso! ${data.chunks} trecho(s) adicionado(s) à base.` })
        setArtTitle(''); setArtSource(''); setArtContent('')
      } else {
        setArtResult({ ok: false, msg: data.error ?? 'Erro ao indexar.' })
      }
    } catch {
      setArtResult({ ok: false, msg: 'Erro de rede.' })
    }
    setArtLoading(false)
  }

  // ── Pesquisar arXiv ──
  const [arxivQuery, setArxivQuery] = useState(QUERIES_SUGERIDAS[0])
  const [arxivResults, setArxivResults] = useState<ArxivEntry[]>([])
  const [arxivLoading, setArxivLoading] = useState(false)
  const [arxivAdded, setArxivAdded] = useState<Set<string>>(new Set())
  const [arxivAdding, setArxivAdding] = useState<string | null>(null)

  async function buscarArxiv() {
    setArxivLoading(true)
    try {
      const res = await fetch(`/api/arxiv?q=${encodeURIComponent(arxivQuery)}&max=12`)
      const data = await res.json()
      setArxivResults(Array.isArray(data) ? data : [])
    } catch {
      setArxivResults([])
    }
    setArxivLoading(false)
  }

  async function adicionarArxivKB(entry: ArxivEntry) {
    setArxivAdding(entry.id)
    const content = `${entry.title}\n\nAutores: ${entry.authors}\nPublicado: ${entry.published}\nCategoria arXiv: ${entry.categories}\n\n${entry.summary}`
    await fetch('/api/kb/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: entry.title, source: entry.link, category: 'artigo-cientifico', content }),
    })
    setArxivAdded(prev => new Set([...prev, entry.id]))
    setArxivAdding(null)
  }

  const hidroFiltered = useMemo(() =>
    HIDROCOLOIDES.filter(h =>
      busca === '' ||
      h.nome.toLowerCase().includes(busca.toLowerCase()) ||
      h.mecanismo.toLowerCase().includes(busca.toLowerCase()) ||
      h.uso.toLowerCase().includes(busca.toLowerCase())
    ), [busca])

  const tacoFiltered = useMemo(() =>
    TACO_DADOS.filter(t =>
      busca === '' || t.nome.toLowerCase().includes(busca.toLowerCase())
    ), [busca])

  const troubleFiltered = useMemo(() =>
    TROUBLESHOOTING.filter(t =>
      busca === '' ||
      t.problema.toLowerCase().includes(busca.toLowerCase()) ||
      t.causas.some(c => c.toLowerCase().includes(busca.toLowerCase()))
    ), [busca])

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Library size={16} className="text-[#003223]" />
            <h1 className="text-2xl font-bold">Biblioteca</h1>
          </div>
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58413c]" />
            <input
              type="text"
              placeholder="Buscar ingrediente, parâmetro ou problema..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#fff8f1] border border-[#e5d9c1] rounded-lg focus:outline-none focus:border-[#e5d9c1] focus:ring-2 focus:ring-[#003223]/10 text-[#211b0c] placeholder:text-[#bfc9c2] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-alt border-b border-[#e5d9c1] px-8">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto py-2">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setAbaAtiva(id as AbaId); setBusca('') }}
              className={abaAtiva === id ? 'tab-pill-active flex items-center gap-1.5 whitespace-nowrap' : 'tab-pill-inactive flex items-center gap-1.5 whitespace-nowrap'}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-8 py-6">

        {/* HIDROCOLÓIDES */}
        {abaAtiva === 'hidrocoloides' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hidroFiltered.map(h => (
              <div key={h.nome} className="bg-white rounded-2xl shadow-tonal p-5 hover:border-[#e5d9c1] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${h.cor}`} />
                  <div>
                    <h3 className="font-semibold text-sm">{h.nome}</h3>
                    <span className="text-xs text-[#003223] font-mono">{h.concentracao}</span>
                  </div>
                  <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    h.imprimibilidade === 'Muito alta' ? 'border-green-400/30 text-green-400 bg-green-400/10' :
                    h.imprimibilidade === 'Alta' ? 'border-blue-400/30 text-blue-400 bg-blue-400/10' :
                    'border-yellow-400/30 text-yellow-400 bg-yellow-400/10'
                  }`}>
                    {h.imprimibilidade}
                  </span>
                </div>
                <p className="text-xs text-[#58413c] leading-relaxed mb-2">{h.mecanismo}</p>
                <p className="text-xs text-[#211b0c]/70 leading-relaxed mb-2"><span className="text-[#003223]/70 font-medium">Uso:</span> {h.uso}</p>
                <p className="text-xs text-[#003223]/60"><span className="font-medium">Temp:</span> {h.temperatura}</p>
                {h.obs && <p className="text-[11px] text-[#bfc9c2] mt-2 border-t border-[#e5d9c1] pt-2">{h.obs}</p>}
              </div>
            ))}
            {hidroFiltered.length === 0 && (
              <p className="col-span-2 text-center text-sm text-[#58413c] py-12">Nenhum resultado para &quot;{busca}&quot;</p>
            )}
          </div>
        )}

        {/* REOLOGIA */}
        {abaAtiva === 'reologia' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-tonal p-6">
              <h2 className="font-semibold mb-1">Modelo de Herschel-Bulkley</h2>
              <p className="text-xs text-[#58413c] mb-3">Modelo mais completo para fluidos alimentares com yield stress:</p>
              <div className="bg-[#fff8f1] rounded-xl p-4 font-mono text-sm text-[#003223] mb-4 text-center">
                τ = τ₀ + K · γ̇ⁿ
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { simbolo: 'τ₀', nome: 'Yield stress', desc: 'Tensão mínima para escoar. Faixa ideal: 50–500 Pa' },
                  { simbolo: 'K', nome: 'Índice de consistência', desc: 'Resistência ao escoamento após yield. Quanto maior, mais viscoso.' },
                  { simbolo: 'n', nome: 'Índice de fluxo', desc: 'n < 1: shear-thinning (ideal). n = 1: newtoniano. n > 1: shear-thickening.' },
                ].map(({ simbolo, nome, desc }) => (
                  <div key={simbolo} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-3">
                    <span className="text-[#003223] font-mono font-bold text-lg">{simbolo}</span>
                    <p className="text-xs font-medium mt-1">{nome}</p>
                    <p className="text-xs text-[#58413c] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { titulo: 'Viscoelasticidade', conteudo: `G' (módulo elástico) > G'' (módulo viscoso): comportamento sólido-like, necessário para manter forma após impressão.\n\ntan δ = G''/G' < 1: indica estrutura estável que não cede sob o próprio peso.` },
                { titulo: 'Shear-thinning', conteudo: `Propriedade essencial para impressão 3D: o material flui facilmente sob cisalhamento (na ponteira) e recupera a viscosidade ao sair.\n\nAgentes shear-thinning: xantana, goma guar, CMC. Índice n entre 0,1–0,8 é ideal.` },
                { titulo: 'Tixotropia', conteudo: `Recuperação temporal da estrutura após remoção do cisalhamento. Importante para:\n- Colapso pós-impressão (recuperação lenta = colapso)\n- Tempo de estabilização antes da impressão\n\nXantana e géis de amido são tixotrópicos.` },
                { titulo: 'Yield Stress na prática', conteudo: `Como medir sem reômetro:\n1. Teste de placa: colocar pasta entre placas e observar espalhamento\n2. Teste de penetração: usar agulha calibrada\n3. Empiricamente: pasta que mantém sulco = τ₀ > 50 Pa\n\nCorrelação visual: pasta que não cai do garfo invertido ≈ 100–300 Pa.` },
              ].map(({ titulo, conteudo }) => (
                <div key={titulo} className="bg-white rounded-2xl shadow-tonal p-5">
                  <h3 className="font-semibold text-sm mb-2">{titulo}</h3>
                  <p className="text-xs text-[#58413c] leading-relaxed whitespace-pre-line">{conteudo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARÂMETROS */}
        {abaAtiva === 'parametros' && (
          <div className="bg-white rounded-2xl shadow-tonal overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5d9c1] bg-[#fff8f1]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#58413c]">Parâmetro</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#003223]">Faixa / Valor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#58413c] hidden sm:table-cell">Observação</th>
                </tr>
              </thead>
              <tbody>
                {PARAMETROS_REFERENCIA.map((p, i) => (
                  <tr key={p.parametro} className={`border-b border-[#e5d9c1] ${i % 2 === 0 ? '' : 'bg-[#003223]/5'}`}>
                    <td className="px-5 py-3 text-xs font-medium">{p.parametro}</td>
                    <td className="px-5 py-3 text-xs font-mono text-[#003223]">{p.valor}</td>
                    <td className="px-5 py-3 text-xs text-[#58413c] hidden sm:table-cell">{p.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TACO */}
        {abaAtiva === 'taco' && (
          <div>
            <p className="text-xs text-[#58413c] mb-4">Fonte: TACO — Tabela Brasileira de Composição de Alimentos, 4ª edição (UNICAMP). Valores por 100g de parte comestível.</p>
            <div className="bg-white rounded-2xl shadow-tonal overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#e5d9c1] bg-[#fff8f1]">
                      <th className="text-left px-4 py-3 font-semibold text-[#58413c] min-w-[180px]">Alimento</th>
                      <th className="text-right px-3 py-3 font-semibold text-[#003223]">Kcal</th>
                      <th className="text-right px-3 py-3 font-semibold text-blue-400">Prot (g)</th>
                      <th className="text-right px-3 py-3 font-semibold text-yellow-400">Carb (g)</th>
                      <th className="text-right px-3 py-3 font-semibold text-orange-400">Gor (g)</th>
                      <th className="text-right px-3 py-3 font-semibold text-green-400">Fib (g)</th>
                      <th className="text-right px-3 py-3 font-semibold text-red-400">Sód (mg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tacoFiltered.map((t, i) => (
                      <tr key={t.nome} className={`border-b border-[#e5d9c1] ${i % 2 === 0 ? '' : 'bg-[#003223]/5'}`}>
                        <td className="px-4 py-2.5 font-medium">{t.nome}</td>
                        <td className="px-3 py-2.5 text-right text-[#003223] font-mono">{t.kcal}</td>
                        <td className="px-3 py-2.5 text-right text-blue-400 font-mono">{t.prot}</td>
                        <td className="px-3 py-2.5 text-right text-yellow-400 font-mono">{t.carb}</td>
                        <td className="px-3 py-2.5 text-right text-orange-400 font-mono">{t.gor}</td>
                        <td className="px-3 py-2.5 text-right text-green-400 font-mono">{t.fib}</td>
                        <td className="px-3 py-2.5 text-right text-red-400 font-mono">{t.sod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tacoFiltered.length === 0 && (
                <p className="text-center text-sm text-[#58413c] py-8">Nenhum resultado para &quot;{busca}&quot;</p>
              )}
            </div>
          </div>
        )}

        {/* TROUBLESHOOTING */}
        {abaAtiva === 'troubleshooting' && (
          <div className="space-y-4">
            {troubleFiltered.map(t => (
              <div key={t.problema} className="bg-white rounded-2xl shadow-tonal p-5 hover:border-red-400/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{t.icone}</span>
                  <h3 className="font-semibold text-sm">{t.problema}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-2">Possíveis causas</p>
                    <ul className="space-y-1">
                      {t.causas.map((c, i) => (
                        <li key={i} className="text-xs text-[#58413c] flex items-start gap-2">
                          <span className="text-red-400/60 flex-shrink-0 mt-0.5">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wider mb-2">Soluções sugeridas</p>
                    <ul className="space-y-1">
                      {t.solucoes.map((s, i) => (
                        <li key={i} className="text-xs text-[#58413c] flex items-start gap-2">
                          <span className="text-green-400/60 flex-shrink-0 mt-0.5">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            {troubleFiltered.length === 0 && (
              <p className="text-center text-sm text-[#58413c] py-12">Nenhum resultado para &quot;{busca}&quot;</p>
            )}
          </div>
        )}

        {/* AMIDOS */}
        {abaAtiva === 'amidos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AMIDOS.map(a => (
              <div key={a.nome} className="bg-white rounded-2xl shadow-tonal p-5 hover:border-[#e5d9c1] transition-colors">
                <h3 className="font-semibold text-sm mb-1">{a.nome}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono bg-[rgba(0,50,35,0.08)] text-[#003223] px-2 py-0.5 rounded-full border border-[#e5d9c1]">
                    Gelatinização: {a.gelatinizacao}
                  </span>
                </div>
                <p className="text-xs text-[#58413c] leading-relaxed">{a.caracteristica}</p>
              </div>
            ))}
          </div>
        )}

        {/* ARTIGOS KB */}
        {abaAtiva === 'artigos' && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-white rounded-2xl shadow-tonal p-5">
              <h2 className="font-semibold text-sm mb-1">Adicionar artigo à base de conhecimento</h2>
              <p className="text-xs text-[#58413c] mb-4">
                Cole o texto de um artigo científico ou resultado experimental. A MIA fragmenta e indexa automaticamente para usar nas respostas.
                Foco recomendado: <span className="text-[#003223] font-medium">extrusão por deslocamento positivo · impressão de alimentos</span>.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#211b0c] block mb-1">Título</label>
                  <input value={artTitle} onChange={e => setArtTitle(e.target.value)} placeholder="ex: Printability of food gels..."
                    className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#211b0c] block mb-1">Fonte / DOI / URL</label>
                    <input value={artSource} onChange={e => setArtSource(e.target.value)} placeholder="ex: doi:10.1016/..."
                      className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#211b0c] block mb-1">Categoria</label>
                    <select value={artCategory} onChange={e => setArtCategory(e.target.value)}
                      className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20">
                      <option value="extrusao-deslocamento">Extrusão deslocamento positivo</option>
                      <option value="reologia">Reologia</option>
                      <option value="hidrocoloides">Hidrocolóides</option>
                      <option value="experimento">Resultado experimental</option>
                      <option value="artigo-cientifico">Artigo científico (geral)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#211b0c] block mb-1">Conteúdo do artigo</label>
                  <textarea value={artContent} onChange={e => setArtContent(e.target.value)} rows={10}
                    placeholder="Cole aqui o texto completo (abstract, métodos, resultados, conclusão)..."
                    className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20 font-mono resize-y" />
                  <p className="text-[10px] text-[#bfc9c2] mt-1">{artContent.split(/\s+/).filter(Boolean).length} palavras</p>
                </div>
                <button onClick={submeterArtigo} disabled={artLoading}
                  className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                  {artLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {artLoading ? 'Indexando…' : 'Indexar na MIA'}
                </button>
                {artResult && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${artResult.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {artResult.ok ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" /> : <span className="flex-shrink-0">⚠</span>}
                    {artResult.msg}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-[#003223]/5 border border-[#003223]/10 rounded-xl text-xs text-[#58413c] space-y-1.5">
              <p className="font-semibold text-[#003223]">Boas fontes para indexar</p>
              <p>• <strong>Journal of Food Engineering</strong> — imprimibilidade, reologia</p>
              <p>• <strong>Food Hydrocolloids</strong> — hidrocolóides, géis</p>
              <p>• <strong>LWT – Food Science & Technology</strong> — análogos, texturas</p>
              <p>• <strong>arXiv (cs.RO / q-bio)</strong> — bioprintng, extrusão mecânica</p>
              <p>• <strong>Seus próprios resultados</strong> — formulação, parâmetros, fotos, avaliação sensorial</p>
            </div>
          </div>
        )}

        {/* PESQUISAR arXiv */}
        {abaAtiva === 'pesquisar' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-tonal p-5">
              <h2 className="font-semibold text-sm mb-1">Pesquisar artigos científicos</h2>
              <p className="text-xs text-[#58413c] mb-4">Busca no arXiv em tempo real. Encontrou algo relevante? Clique em &quot;Adicionar à MIA&quot; para indexar.</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUERIES_SUGERIDAS.map(q => (
                  <button key={q} onClick={() => setArxivQuery(q)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${arxivQuery === q ? 'bg-[#003223] text-white border-[#003223]' : 'border-[#e5d9c1] text-[#58413c] hover:border-[#003223]/30'}`}>
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={arxivQuery} onChange={e => setArxivQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarArxiv()}
                  placeholder="Ex: food 3D printing rheology..."
                  className="flex-1 bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/20" />
                <button onClick={buscarArxiv} disabled={arxivLoading}
                  className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  {arxivLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  {arxivLoading ? 'Buscando…' : 'Buscar'}
                </button>
              </div>
            </div>

            {arxivResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-[#58413c]">{arxivResults.length} resultado(s) — clique em &quot;Adicionar à MIA&quot; nos que forem relevantes.</p>
                {arxivResults.map(entry => {
                  const added = arxivAdded.has(entry.id)
                  const adding = arxivAdding === entry.id
                  return (
                    <div key={entry.id} className="bg-white rounded-2xl shadow-tonal p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold leading-snug mb-1">{entry.title}</h3>
                          <p className="text-xs text-[#58413c] mb-1">{entry.authors} · {entry.published}</p>
                          {entry.categories && (
                            <span className="text-[10px] font-mono bg-[rgba(0,50,35,0.06)] text-[#003223] px-1.5 py-0.5 rounded border border-[#e5d9c1] mr-2">{entry.categories}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <a href={entry.link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-[#58413c] hover:text-[#211b0c] border border-[#e5d9c1] px-2 py-1 rounded-lg transition-colors">
                            <ExternalLink size={10} /> Ver artigo
                          </a>
                          <button onClick={() => !added && adicionarArxivKB(entry)} disabled={added || adding}
                            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors ${added ? 'bg-green-50 border border-green-200 text-green-700 cursor-default' : 'bg-[#003223] hover:bg-[#004d35] text-white'} disabled:opacity-60`}>
                            {adding ? <Loader2 size={10} className="animate-spin" /> : added ? <CheckCircle2 size={10} /> : <Upload size={10} />}
                            {adding ? 'Adicionando…' : added ? 'Adicionado' : 'Adicionar à MIA'}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#58413c] leading-relaxed mt-2 line-clamp-3">{entry.summary}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {!arxivLoading && arxivResults.length === 0 && arxivQuery && (
              <p className="text-center text-sm text-[#58413c] py-8">Clique em &quot;Buscar&quot; para pesquisar no arXiv.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
