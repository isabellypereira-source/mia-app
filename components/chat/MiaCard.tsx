'use client'
import { FlaskConical, AlertTriangle, ClipboardList, BarChart3, Save } from 'lucide-react'

interface Props {
  data: Record<string, unknown>
}

export function MiaCard({ data }: Props) {
  const type = data.__type as string

  if (type === 'formulacao') {
    return <FormulacaoCard data={data} />
  }
  if (type === 'diagnostico') {
    return <DiagnosticoCard data={data} />
  }
  if (type === 'protocolo') {
    return <ProtocoloCard data={data} />
  }
  if (type === 'nutricional') {
    return <NutricionalCard data={data} />
  }
  return null
}

function FormulacaoCard({ data }: Props) {
  const ingredientes = data.ingredientes as Array<{ nome: string; percentual: number; funcao: string }>
  const parametros = data.parametros as { ponteira_mm?: number; velocidade_mm_s?: number; temperatura_c?: number }

  async function salvar() {
    await fetch('/api/formulacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: data.nome, ingredientes, parametros }),
    })
    alert('Formulação salva!')
  }

  return (
    <div className="mia-card border-[#003223]/30 bg-[#003223]/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical size={14} className="text-[#003223]" />
          <span className="text-xs font-medium text-[#003223] uppercase tracking-wide">Formulação</span>
        </div>
        <button
          onClick={salvar}
          className="flex items-center gap-1 text-xs text-[#58413c] hover:text-[#003223] transition-colors"
        >
          <Save size={12} /> Salvar
        </button>
      </div>
      <h3 className="font-semibold text-base mb-3">{data.nome as string}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[#58413c] border-b border-[#e5d9c1]">
            <th className="text-left pb-2">Ingrediente</th>
            <th className="text-right pb-2">%</th>
            <th className="text-left pb-2 pl-4">Função</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes?.map((ing, i) => (
            <tr key={i} className="border-b border-[#e5d9c1]">
              <td className="py-1.5 font-medium">{ing.nome}</td>
              <td className="text-right text-[#003223] font-mono">{ing.percentual}%</td>
              <td className="py-1.5 pl-4 text-[#58413c]">{ing.funcao}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {parametros && (
        <div className="mt-3 pt-3 border-t border-[#e5d9c1] flex gap-4 text-xs text-[#58413c]">
          {parametros.ponteira_mm && <span>Bico: <strong className="text-[#211b0c]">{parametros.ponteira_mm}mm</strong></span>}
          {parametros.velocidade_mm_s && <span>Velocidade: <strong className="text-[#211b0c]">{parametros.velocidade_mm_s}mm/s</strong></span>}
          {parametros.temperatura_c && <span>Temperatura: <strong className="text-[#211b0c]">{parametros.temperatura_c}°C</strong></span>}
        </div>
      )}
      {data.obs ? <p className="mt-2 text-xs text-[#58413c]">{String(data.obs)}</p> : null}
    </div>
  )
}

function DiagnosticoCard({ data }: Props) {
  const causas = data.causas as Array<{ causa: string; probabilidade: string }>
  const solucoes = data.solucoes as Array<{ passo: number; acao: string; parametro: string }>
  const probColor = (p: string) =>
    p === 'alta' ? 'text-red-400' : p === 'média' ? 'text-yellow-400' : 'text-[#58413c]'

  return (
    <div className="mia-card border-yellow-500/30 bg-yellow-500/5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-yellow-400" />
        <span className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Diagnóstico</span>
      </div>
      <h3 className="font-semibold mb-3">{data.problema as string}</h3>
      <div className="space-y-1 mb-3">
        <p className="text-xs text-[#58413c] font-medium mb-1">Possíveis causas:</p>
        {causas?.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span>{c.causa}</span>
            <span className={`font-medium ${probColor(c.probabilidade)}`}>{c.probabilidade}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#e5d9c1] pt-3 space-y-2">
        <p className="text-xs text-[#58413c] font-medium">Soluções:</p>
        {solucoes?.map((s) => (
          <div key={s.passo} className="flex gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-[#003223]/15 text-[#003223] flex-shrink-0 flex items-center justify-center font-mono">{s.passo}</span>
            <div>
              <span className="font-medium">{s.acao}</span>
              {s.parametro && <span className="text-[#58413c]"> — {s.parametro}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProtocoloCard({ data }: Props) {
  const passos = data.passos as Array<{ numero: number; descricao: string; parametros: string }>
  const equipamentos = data.equipamentos as string[]

  return (
    <div className="mia-card border-blue-500/30 bg-blue-500/5">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Protocolo</span>
      </div>
      <h3 className="font-semibold mb-3">{data.titulo as string}</h3>
      <div className="space-y-2">
        {passos?.map((p) => (
          <div key={p.numero} className="flex gap-3 text-xs">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 flex items-center justify-center font-mono text-[10px]">{p.numero}</span>
            <div>
              <span>{p.descricao}</span>
              {p.parametros && <span className="text-[#58413c] ml-1">({p.parametros})</span>}
            </div>
          </div>
        ))}
      </div>
      {equipamentos?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#e5d9c1]">
          <p className="text-xs text-[#58413c] mb-1">Equipamentos:</p>
          <p className="text-xs">{equipamentos.join(' · ')}</p>
        </div>
      )}
    </div>
  )
}

function NutricionalCard({ data }: Props) {
  const items = [
    { label: 'Energia', value: `${data.energia_kcal} kcal` },
    { label: 'Proteínas', value: `${data.proteinas_g}g` },
    { label: 'Carboidratos', value: `${data.carboidratos_g}g` },
    { label: 'Gorduras totais', value: `${data.gorduras_totais_g}g` },
    { label: 'Fibras', value: `${data.fibras_g}g` },
    { label: 'Sódio', value: `${data.sodio_mg}mg` },
  ]

  return (
    <div className="mia-card border-purple-500/30 bg-purple-500/5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-purple-400" />
        <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">Tabela Nutricional</span>
      </div>
      <p className="text-xs text-[#58413c] mb-2">Porção: {data.porcao_g as number}g</p>
      <div className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs border-b border-[#e5d9c1] py-1">
            <span className="text-[#58413c]">{label}</span>
            <span className="font-medium font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
