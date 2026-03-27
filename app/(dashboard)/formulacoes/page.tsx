'use client'
import { useEffect, useState } from 'react'
import { FlaskConical, ChevronRight, X, Download, ShieldCheck, BarChart3, Trash2 } from 'lucide-react'
import Link from 'next/link'
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

export default function FormulacoesPage() {
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
    <div className="h-full overflow-hidden flex">
      {/* Lista */}
      <div className={`${selecionada ? 'w-72 flex-shrink-0' : 'flex-1'} overflow-y-auto p-5 border-r border-border transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-semibold">Formulações</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{formulacoes.length} salvas</p>
          </div>
          <Link
            href="/formular"
            className="flex items-center gap-1.5 text-xs bg-morphe-orange hover:bg-morphe-orange-hover text-white px-3 py-1.5 rounded-md transition-colors"
          >
            <FlaskConical size={12} /> Nova
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-xs">Carregando...</div>
        ) : formulacoes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FlaskConical size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhuma formulação.</p>
            <Link href="/formular" className="text-morphe-orange text-xs hover:underline mt-1 inline-block">
              Criar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {formulacoes.map(f => {
              const isActive = selecionada?.id === f.id
              return (
                <div key={f.id} className={`bg-morphe-dark-2 border rounded-xl p-3.5 transition-colors ${isActive ? 'border-morphe-orange/40 bg-morphe-orange/5' : 'border-border'}`}>
                  <button className="w-full text-left" onClick={() => { setSelecionada(isActive ? null : f); setAbaDetalhe('nutri') }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{f.nome}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{f.ingredientes?.length ?? 0} ingredientes</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(f.created_at), 'dd MMM yyyy', { locale: ptBR })}</p>
                    {!selecionada && (
                      <div className="flex items-center gap-1 text-morphe-orange text-xs mt-2">Ver análise <ChevronRight size={11} /></div>
                    )}
                  </button>
                  <button onClick={() => excluirFormulacao(f.id)} disabled={excluindo === f.id}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 disabled:opacity-40 transition-colors">
                    <Trash2 size={11} /> {excluindo === f.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Painel de detalhe */}
      {selecionada && (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">{selecionada.nome}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selecionada.ingredientes?.length ?? 0} ingredientes ·{' '}
                {format(new Date(selecionada.created_at), "dd 'de' MMMM yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => baixarRelatorio(selecionada)}
                className="flex items-center gap-1.5 text-xs bg-morphe-orange hover:bg-morphe-orange-hover text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <Download size={12} /> Baixar PDF
              </button>
              <button onClick={() => setSelecionada(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-1 mb-5 border-b border-border">
            {[
              { id: 'nutri', label: 'Análise Nutricional', icon: BarChart3 },
              { id: 'anvisa', label: 'Orientação ANVISA', icon: ShieldCheck },
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaDetalhe(aba.id as 'nutri' | 'anvisa')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                  abaDetalhe === aba.id
                    ? 'border-morphe-orange text-morphe-orange'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <aba.icon size={13} />
                {aba.label}
              </button>
            ))}
          </div>

          {/* Ingredientes */}
          <div className="bg-morphe-dark-2 border border-border rounded-xl p-4 mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Composição</h3>
            <div className="space-y-1.5">
              {selecionada.ingredientes?.map((ing, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{ing.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{ing.funcao}</span>
                    <span className="font-medium text-morphe-orange">{ing.percentual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aba Nutricional */}
          {abaDetalhe === 'nutri' && (
            <div className="bg-morphe-dark-2 border border-border rounded-xl p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Tabela Nutricional Estimada (por 100 g)
              </h3>
              <p className="text-xs text-muted-foreground mb-3 italic">
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
                          <td className="py-2 text-muted-foreground">{label}</td>
                          <td className="py-2 text-right font-medium">{valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
              <p className="text-xs text-muted-foreground mt-3">
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
                <div key={o.titulo} className="bg-morphe-dark-2 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-morphe-orange flex-shrink-0" />
                    <h4 className="text-sm font-medium">{o.titulo}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{o.texto}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground px-1">
                As orientações acima são referências gerais. Consulte a legislação vigente e um profissional habilitado para adequação regulatória completa.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
