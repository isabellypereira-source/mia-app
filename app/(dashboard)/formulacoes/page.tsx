'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { FlaskConical, ChevronRight, X, Download, ShieldCheck, BarChart3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Ingrediente {
  nome: string
  percentual: number
  funcao: string
}

interface Formulacao {
  id: string
  nome: string
  ingredientes: Ingrediente[]
  parametros: Record<string, unknown>
  resultado: 'sucesso' | 'falha' | 'em_teste' | null
  created_at: string
  observacoes: string
}

interface NutriInfo {

  calorias: string
  carboidratos: string
  proteinas: string
  gorduras: string
  fibras: string
  umidade: string
}

const ANVISA_ORIENTACOES = [
  { titulo: 'RDC 727/2022 — Rotulagem nutricional', texto: 'Produtos alimentícios embalados devem conter tabela nutricional com porção, VD% e todos os nutrientes obrigatórios. Aplicável a produtos comercializados.' },
  { titulo: 'IN 75/2020 — Padrões de identidade e qualidade', texto: 'Define os critérios mínimos de composição, características sensoriais e parâmetros microbiológicos para categorias de alimentos.' },
  { titulo: 'RDC 331/2019 — Aditivos alimentares', texto: 'Hidrocolóides como xantana, guar e carragena são aditivos espessantes/gelificantes com limites máximos definidos por categoria de alimento.' },
  { titulo: 'Boas Práticas de Fabricação (BPF)', texto: 'RDC 275/2002 e RDC 216/2004 estabelecem requisitos de higiene, controle de temperatura e manipulação aplicáveis ao processamento.' },
]

function calcularNutri(ingredientes: Ingrediente[]): NutriInfo {
  // Estimativa simplificada baseada em funções dos ingredientes
  let carboidratos = 0, proteinas = 0, gorduras = 0, fibras = 0, umidade = 0
  const total = ingredientes.reduce((s, i) => s + i.percentual, 0) || 100

  for (const ing of ingredientes) {
    const frac = ing.percentual / total
    const fn = ing.funcao.toLowerCase()
    if (fn.includes('estruturante') || fn.includes('amido') || fn === 'outro') {
      carboidratos += frac * 70
      umidade += frac * 20
    } else if (fn.includes('proteína')) {
      proteinas += frac * 80
      umidade += frac * 10
    } else if (fn.includes('lipídio') || fn.includes('gordura')) {
      gorduras += frac * 90
    } else if (fn.includes('hidrocolóide') || fn.includes('fibra')) {
      fibras += frac * 60
      umidade += frac * 30
    } else if (fn.includes('plastificante')) {
      carboidratos += frac * 40
      umidade += frac * 50
    } else {
      carboidratos += frac * 30
      umidade += frac * 60
    }
  }

  const calorias = Math.round(carboidratos * 4 + proteinas * 4 + gorduras * 9)

  return {
    calorias: `${calorias} kcal`,
    carboidratos: `${carboidratos.toFixed(1)} g`,
    proteinas: `${proteinas.toFixed(1)} g`,
    gorduras: `${gorduras.toFixed(1)} g`,
    fibras: `${fibras.toFixed(1)} g`,
    umidade: `${Math.min(umidade, 85).toFixed(1)} g`,
  }
}

function FormulacoesInner() {
  const params = useSearchParams()
  const q = params.get('q')?.toLowerCase().trim() || ''
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionada, setSelecionada] = useState<Formulacao | null>(null)
  const [abaDetalhe, setAbaDetalhe] = useState<'nutri' | 'anvisa'>('nutri')
  const [excluindo, setExcluindo] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulacoes')
      .then(r => r.json())
      .then(data => { setFormulacoes(data || []); setLoading(false) })
  }, [])

  const visiveis = useMemo(() => {
    if (!q) return formulacoes
    return formulacoes.filter(f => {
      if (f.nome?.toLowerCase().includes(q)) return true
      return f.ingredientes?.some(i => i.nome?.toLowerCase().includes(q) || i.funcao?.toLowerCase().includes(q))
    })
  }, [formulacoes, q])

  async function excluirFormulacao(id: string) {
    if (!confirm('Excluir esta formulação?')) return
    setExcluindo(id)
    await fetch(`/api/formulacoes?id=${id}`, { method: 'DELETE' })
    setFormulacoes(prev => prev.filter(f => f.id !== id))
    if (selecionada?.id === id) setSelecionada(null)
    setExcluindo(null)
  }

  async function baixarRelatorio(f: Formulacao) {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulacao_id: f.id, tipo: 'ficha_tecnica' }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analise_${f.nome.replace(/\s+/g, '_')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-hidden flex bg-[#fff8f1]">
      {/* Lista */}
      <div className={`${selecionada ? 'w-72 flex-shrink-0' : 'flex-1'} overflow-y-auto section-alt border-r border-[#e5d9c1] transition-all`}>
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#e5d9c1]">
          <div>
            <h1 className="text-base font-bold">Formulações</h1>
            <p className="text-xs text-[#58413c] mt-0.5">
              {q
                ? `${visiveis.length} ${visiveis.length === 1 ? 'resultado' : 'resultados'} para "${q}"`
                : `${formulacoes.length} salvas`}
            </p>
          </div>
          <Link
            href="/formular"
            className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
          >
            <FlaskConical size={12} /> Nova
          </Link>
        </div>
        <div className="p-3">
        {loading ? (
          <div className="text-center py-8 text-[#58413c] text-xs">Carregando...</div>
        ) : formulacoes.length === 0 ? (
          <div className="text-center py-12 text-[#58413c]">
            <FlaskConical size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhuma formulação.</p>
            <Link href="/formular" className="text-[#003223] text-xs hover:underline mt-1 inline-block">
              Criar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {visiveis.map(f => {
              const isActive = selecionada?.id === f.id
              return (
                <div key={f.id} className={`bg-white rounded-2xl shadow-tonal p-3.5 transition-all ${isActive ? '!border-[#e5d9c1]' : ''}`} style={isActive ? {boxShadow:'0 0 0 2px #003223'} : {}}>
                  <button className="w-full text-left" onClick={() => { setSelecionada(isActive ? null : f); setAbaDetalhe('nutri') }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{f.nome}</span>
                    </div>
                    <p className="text-xs text-[#58413c] mt-1">{f.ingredientes?.length ?? 0} ingredientes</p>
                    <p className="text-xs text-[#58413c]">{format(new Date(f.created_at), 'dd MMM yyyy', { locale: ptBR })}</p>
                    {!selecionada && (
                      <div className="flex items-center gap-1 text-[#003223] text-xs mt-2">Ver análise <ChevronRight size={11} /></div>
                    )}
                  </button>
                  <button onClick={() => excluirFormulacao(f.id)} disabled={excluindo === f.id}
                    className="mt-2 flex items-center gap-1 text-xs text-[#58413c] hover:text-red-400 disabled:opacity-40 transition-colors">
                    <Trash2 size={11} /> {excluindo === f.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>

      {/* Painel de detalhe */}
      {selecionada && (
        <div className="flex-1 overflow-y-auto p-6 bg-[#fff8f1]">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">{selecionada.nome}</h2>
              <p className="text-xs text-[#58413c] mt-0.5">
                {selecionada.ingredientes?.length ?? 0} ingredientes ·{' '}
                {format(new Date(selecionada.created_at), "dd 'de' MMMM yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => baixarRelatorio(selecionada)}
                className="flex items-center gap-1.5 text-xs bg-[#003223] hover:bg-[#004d35] text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <Download size={12} /> Baixar PDF
              </button>
              <button onClick={() => setSelecionada(null)} className="text-[#58413c] hover:text-[#211b0c] transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-1 mb-5">
            {[
              { id: 'nutri', label: 'Análise Nutricional', icon: BarChart3 },
              { id: 'anvisa', label: 'Orientação ANVISA', icon: ShieldCheck },
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaDetalhe(aba.id as 'nutri' | 'anvisa')}
                className={`flex items-center gap-1.5 ${abaDetalhe === aba.id ? 'tab-pill-active' : 'tab-pill-inactive'}`}
              >
                <aba.icon size={12} />
                {aba.label}
              </button>
            ))}
          </div>

          {/* Ingredientes */}
          <div className="bg-white rounded-2xl shadow-tonal p-4 mb-4">
            <h3 className="text-xs font-medium text-[#58413c] uppercase tracking-wider mb-3">Composição</h3>
            <div className="space-y-1.5">
              {selecionada.ingredientes?.map((ing, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{ing.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#58413c]">{ing.funcao}</span>
                    <span className="font-medium text-[#003223]">{ing.percentual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aba Nutricional */}
          {abaDetalhe === 'nutri' && (
            <div className="bg-white rounded-2xl shadow-tonal p-4">
              <h3 className="text-xs font-medium text-[#58413c] uppercase tracking-wider mb-3">
                Tabela Nutricional Estimada (por 100 g)
              </h3>
              <p className="text-xs text-[#58413c] mb-3 italic">
                Estimativa baseada na composição declarada e dados da Tabela Brasileira de Composição de Alimentos (TACO). Para valores precisos, realizar análise laboratorial.
              </p>
              {(() => {
                const nutri = calcularNutri(selecionada.ingredientes || [])
                return (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border">
                      {[
                        ['Valor energético', nutri.calorias],
                        ['Carboidratos', nutri.carboidratos],
                        ['Proteínas', nutri.proteinas],
                        ['Gorduras totais', nutri.gorduras],
                        ['Fibra alimentar', nutri.fibras],
                        ['Umidade estimada', nutri.umidade],
                      ].map(([label, valor]) => (
                        <tr key={label}>
                          <td className="py-2 text-[#58413c]">{label}</td>
                          <td className="py-2 text-right font-medium">{valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
              <p className="text-xs text-[#58413c] mt-3">
                * Sólidos totais estimados: {
                  Math.min(
                    selecionada.ingredientes?.reduce((s, i) => s + i.percentual, 0) ?? 0,
                    100
                  ).toFixed(1)
                }%
              </p>
            </div>
          )}

          {/* Aba ANVISA */}
          {abaDetalhe === 'anvisa' && (
            <div className="space-y-3">
              {ANVISA_ORIENTACOES.map(o => (
                <div key={o.titulo} className="bg-white rounded-2xl shadow-tonal p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-[#003223] flex-shrink-0" />
                    <h4 className="text-sm font-medium">{o.titulo}</h4>
                  </div>
                  <p className="text-sm text-[#58413c] leading-relaxed">{o.texto}</p>
                </div>
              ))}
              <p className="text-xs text-[#58413c] px-1">
                As orientações acima são referências gerais. Consulte a legislação vigente e um profissional habilitado para adequação regulatória completa.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FormulacoesPage() {
  return (
    <Suspense fallback={null}>
      <FormulacoesInner />
    </Suspense>
  )
}
