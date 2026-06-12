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

type NutriResp = {
  total: { kcal: number; proteina_g: number; carboidrato_g: number; gordura_g: number; fibra_g: number; umidade_g: number; sodio_mg: number }
  matches: { nome: string; percentual: number; matched: { nome: string } | null }[]
  missing: string[]
}

function FormulacoesInner() {
  const params = useSearchParams()
  const q = params.get('q')?.toLowerCase().trim() || ''
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionada, setSelecionada] = useState<Formulacao | null>(null)
  const [abaDetalhe, setAbaDetalhe] = useState<'nutri' | 'anvisa'>('nutri')
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [nutriData, setNutriData] = useState<NutriResp | null>(null)
  const [nutriLoading, setNutriLoading] = useState(false)
  const [customOpen, setCustomOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!selecionada || abaDetalhe !== 'nutri') return
    setNutriLoading(true)
    setNutriData(null)
    fetch('/api/foods/nutri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientes: selecionada.ingredientes || [], peso_g: 100 }),
    })
      .then(r => r.json())
      .then((d: NutriResp) => setNutriData(d))
      .finally(() => setNutriLoading(false))
  }, [selecionada, abaDetalhe])

  const refetchNutri = async () => {
    if (!selecionada) return
    setNutriLoading(true)
    const res = await fetch('/api/foods/nutri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientes: selecionada.ingredientes || [], peso_g: 100 }),
    })
    setNutriData(await res.json())
    setNutriLoading(false)
  }

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
              {nutriLoading && (
                <p className="text-xs text-[#58413c] mb-3">Calculando…</p>
              )}
              {nutriData && nutriData.missing && nutriData.missing.length > 0 && (
                <div style={{ background: 'rgba(250,85,40,.08)', border: '1px solid rgba(250,85,40,.25)', borderRadius: 12, padding: 12, marginBottom: 14 }}>
                  <p style={{ fontSize: 12.5, color: 'var(--orange,#fa5528)', fontWeight: 600, margin: 0, marginBottom: 6 }}>
                    {nutriData.missing.length === 1 ? 'Ingrediente não encontrado na base' : 'Ingredientes não encontrados'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginBottom: 8 }}>
                    Informe os valores manualmente para que a MIA inclua esses itens no cálculo.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {nutriData.missing.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCustomOpen(n)}
                        style={{
                          background: 'var(--accent,#abd032)', color: 'var(--accent-text-on,#054a37)',
                          border: 'none', borderRadius: 999, padding: '6px 12px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        + Informar valores de {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {nutriData && (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {[
                      ['Valor energético', `${nutriData.total.kcal} kcal`],
                      ['Carboidratos', `${nutriData.total.carboidrato_g.toFixed(1)} g`],
                      ['Proteínas', `${nutriData.total.proteina_g.toFixed(1)} g`],
                      ['Gorduras totais', `${nutriData.total.gordura_g.toFixed(1)} g`],
                      ['Fibra alimentar', `${nutriData.total.fibra_g.toFixed(1)} g`],
                      ['Sódio', `${nutriData.total.sodio_mg} mg`],
                      ['Umidade estimada', `${nutriData.total.umidade_g.toFixed(1)} g`],
                    ].map(([label, valor]) => (
                      <tr key={label}>
                        <td className="py-2 text-[#58413c]">{label}</td>
                        <td className="py-2 text-right font-medium">{valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-xs text-[#58413c] mt-3">
                * Sólidos totais declarados: {
                  Math.min(
                    selecionada.ingredientes?.reduce((s, i) => s + i.percentual, 0) ?? 0,
                    100
                  ).toFixed(1)
                }%
              </p>
            </div>
          )}

          {customOpen && (
            <CustomFoodModal
              nome={customOpen}
              onClose={() => setCustomOpen(null)}
              onSaved={async () => { setCustomOpen(null); await refetchNutri() }}
            />
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

function CustomFoodModal({
  nome,
  onClose,
  onSaved,
}: {
  nome: string
  onClose: () => void
  onSaved: () => void
}) {
  const [kcal, setKcal] = useState('')
  const [prot, setProt] = useState('')
  const [carb, setCarb] = useState('')
  const [gord, setGord] = useState('')
  const [fib, setFib] = useState('')
  const [umid, setUmid] = useState('')
  const [sod, setSod] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        kcal: parseFloat(kcal) || 0,
        proteina_g: parseFloat(prot) || 0,
        carboidrato_g: parseFloat(carb) || 0,
        gordura_g: parseFloat(gord) || 0,
        fibra_g: parseFloat(fib) || 0,
        umidade_g: parseFloat(umid) || 0,
        sodio_mg: parseFloat(sod) || 0,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error || 'Falha ao salvar')
      return
    }
    onSaved()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(3,56,42,.6)',
        backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'var(--cream,#fff1d9)', borderRadius: 20, padding: 28, width: 'min(480px,92vw)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,.4)',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif),serif', fontStyle: 'italic', fontSize: 24, color: 'var(--green-deep,#03382a)' }}>
          Informar valores
        </h3>
        <p style={{ margin: '4px 0 18px', fontSize: 13.5, color: 'var(--green-mid,#196454)' }}>
          Para <b>{nome}</b>. Insira valores por 100 g do ingrediente.
        </p>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Energia (kcal)" value={kcal} onChange={setKcal} />
          <Field label="Proteína (g)" value={prot} onChange={setProt} />
          <Field label="Carboidrato (g)" value={carb} onChange={setCarb} />
          <Field label="Gordura (g)" value={gord} onChange={setGord} />
          <Field label="Fibra (g)" value={fib} onChange={setFib} />
          <Field label="Umidade (g)" value={umid} onChange={setUmid} />
          <Field label="Sódio (mg)" value={sod} onChange={setSod} />
          {err && <p style={{ gridColumn: '1 / -1', color: 'var(--orange,#fa5528)', fontSize: 12.5, margin: 0 }}>{err}</p>}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--green-deep,#03382a)', color: 'var(--cream,#fff1d9)',
                border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14,
              }}
            >
              {saving ? 'Salvando…' : 'Salvar valores'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent', color: 'var(--green-mid,#196454)',
                border: '1px solid rgba(5,74,55,.15)', borderRadius: 10, padding: '11px 22px',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--green-mid,#196454)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <input
        type="number"
        step="0.1"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: '#fff', border: '1px solid rgba(5,74,55,.15)', borderRadius: 8,
          padding: '9px 12px', fontSize: 14, color: 'var(--green-deep,#03382a)', outline: 'none',
        }}
      />
    </label>
  )
}

export default function FormulacoesPage() {
  return (
    <Suspense fallback={null}>
      <FormulacoesInner />
    </Suspense>
  )
}
