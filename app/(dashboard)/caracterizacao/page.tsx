'use client'
import { useState } from 'react'
import { Microscope, Sparkles, Download, ChevronRight } from 'lucide-react'

type SecaoId =
  | 'reologia'
  | 'colapso_filamento'
  | 'tpa_cooking_loss'
  | 'sinerese'
  | 'fidelidade_dimensional'
  | 'precisao_impressao'

interface Campo {
  id: string
  label: string
  unidade: string
  placeholder: string
  defaultValue?: string
}

interface Secao {
  id: SecaoId
  titulo: string
  descricao: string
  campos: Campo[]
  protocolo: string
  referencia?: string
}

const SECOES: Secao[] = [
  {
    id: 'reologia',
    titulo: 'Análise Reológica',
    descricao: 'Insira viscosidade e tensão de escoamento para determinar o índice de comportamento (n) e classificar o material para extrusão 3D.',
    campos: [
      { id: 'viscosidade_1', label: 'Viscosidade a 1 rpm', unidade: 'mPa·s', placeholder: 'ex: 12500' },
      { id: 'viscosidade_10', label: 'Viscosidade a 10 rpm', unidade: 'mPa·s', placeholder: 'ex: 6800' },
      { id: 'viscosidade_100', label: 'Viscosidade a 100 rpm', unidade: 'mPa·s', placeholder: 'ex: 2100' },
      { id: 'tensao_escoamento', label: 'Tensão de escoamento (σ₀)', unidade: 'Pa', placeholder: 'ex: 45' },
      { id: 'temperatura', label: 'Temperatura de medição', unidade: '°C', placeholder: 'ex: 25' },
    ],
    protocolo: 'Reômetro rotacional ou viscosímetro Brookfield. Medições em 1, 5, 10, 50 e 100 rpm. Temperatura controlada a 25 °C. Aguardar 60 s antes de cada leitura. Triplicata.',
  },
  {
    id: 'colapso_filamento',
    titulo: 'Teste de Colapso de Filamento (Cf)',
    descricao: 'Avalia a capacidade de sustentação estrutural por análise de pontes de filamento extrudado sobre vãos de 1 a 6 mm. Insira as áreas medidas (ImageJ/Fiji).',
    campos: [
      { id: 'at_1mm', label: 'Área teórica vão 1 mm (At)', unidade: 'mm²', placeholder: 'ex: 1.20' },
      { id: 'ar_1mm', label: 'Área real vão 1 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 1.25' },
      { id: 'at_2mm', label: 'Área teórica vão 2 mm (At)', unidade: 'mm²', placeholder: 'ex: 2.40' },
      { id: 'ar_2mm', label: 'Área real vão 2 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 2.60' },
      { id: 'at_3mm', label: 'Área teórica vão 3 mm (At)', unidade: 'mm²', placeholder: 'ex: 3.60' },
      { id: 'ar_3mm', label: 'Área real vão 3 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 4.20' },
      { id: 'at_4mm', label: 'Área teórica vão 4 mm (At)', unidade: 'mm²', placeholder: 'ex: 4.80' },
      { id: 'ar_4mm', label: 'Área real vão 4 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 6.10' },
      { id: 'at_5mm', label: 'Área teórica vão 5 mm (At)', unidade: 'mm²', placeholder: 'ex: 6.00' },
      { id: 'ar_5mm', label: 'Área real vão 5 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 8.50' },
      { id: 'at_6mm', label: 'Área teórica vão 6 mm (At)', unidade: 'mm²', placeholder: 'ex: 7.20' },
      { id: 'ar_6mm', label: 'Área real vão 6 mm (Ar)', unidade: 'mm²', placeholder: 'ex: 11.40' },
    ],
    protocolo: 'Plataforma com 6 pilares paralelos, vãos de 1, 2, 3, 4, 5 e 6 mm. Extrudar filamento único atravessando todos os vãos em deposição contínua. Fotografar imediatamente. Calcular áreas no ImageJ/Fiji. Cf(%) = (At/Ar) × 100. Mínimo 3 repetições.',
    referencia: 'Sviech et al., 2025 — Food Bioscience, 72, 107519.',
  },
  {
    id: 'tpa_cooking_loss',
    titulo: 'TPA + Perda de Massa no Cozimento',
    descricao: 'Análise de Perfil de Textura (TPA) por dupla compressão e perda de massa após cozimento (180 °C / 10 min).',
    campos: [
      { id: 'dureza', label: 'Dureza (1ª compressão)', unidade: 'N', placeholder: 'ex: 12.4' },
      { id: 'area1', label: 'Área 1ª compressão', unidade: 'N·s', placeholder: 'ex: 8.20' },
      { id: 'area2', label: 'Área 2ª compressão', unidade: 'N·s', placeholder: 'ex: 5.90' },
      { id: 'd1', label: 'Distância 1ª (D₁)', unidade: 'mm', placeholder: 'ex: 8.0' },
      { id: 'd2', label: 'Distância 2ª (D₂)', unidade: 'mm', placeholder: 'ex: 6.8' },
      { id: 'massa_inicial', label: 'Massa inicial (M₀)', unidade: 'g', placeholder: 'ex: 5.00' },
      { id: 'massa_final', label: 'Massa após cozimento (Ma)', unidade: 'g', placeholder: 'ex: 4.30' },
    ],
    protocolo: 'Texturômetro TA.XT Plus, sonda P/35R (cilíndrica 45 mm). Velocidade pré-teste 10 mm/s, teste 18 mm/s, pós-teste 18 mm/s. Trigger 0,049 N. Deformação 80%. TPA: mín. 5 repetições. Cooking Loss: assar 10 min a 180 °C, mín. 3 repetições.',
    referencia: 'Demircan et al., 2023 — Food Research International, 173.',
  },
  {
    id: 'sinerese',
    titulo: 'Sinérese (Congelamento-Descongelamento)',
    descricao: 'Avalia a capacidade de retenção de água da matriz alimentar após estresse térmico (-18 °C / 24 h → 25 °C / 8 h). Cilindros padronizados 20 × 10 mm.',
    campos: [
      { id: 'w0', label: 'Massa após impressão (W₀)', unidade: 'g', placeholder: 'ex: 3.80' },
      { id: 'wa', label: 'Massa após ciclo (Wa)', unidade: 'g', placeholder: 'ex: 3.42' },
    ],
    protocolo: 'Imprimir cilindros (∅ 20 mm × 10 mm). Pesar imediatamente (W₀). Congelar a -18 °C por 24 h. Descongelar a 25 °C por 8 h. Remover líquido superficial sem pressionar. Pesar (Wa). Syneresis(%) = ((W₀-Wa)/W₀) × 100. Mín. 3 repetições.',
    referencia: 'Xie et al., 2022 — Food Hydrocolloids, 124, 107287.',
  },
  {
    id: 'fidelidade_dimensional',
    titulo: 'Fidelidade Dimensional',
    descricao: 'Compara a área medida da estrutura impressa com a área nominal (22,56 mm²) usando análise de imagem.',
    campos: [
      { id: 'area_medida', label: 'Área medida (Am)', unidade: 'mm²', placeholder: 'ex: 22.10' },
      { id: 'area_nominal', label: 'Área nominal (An)', unidade: 'mm²', placeholder: '22.56', defaultValue: '22.56' },
    ],
    protocolo: 'Modelo quadrado externo 22 × 22 mm com unidades internas de 22,56 mm². Bico 0,6 mm. Velocidades testadas: 2,5; 5,0; 10,0; 15,0 mm/s (vazão proporcional). Fotografia padronizada. ImageJ com escala calibrada. FD(%) = (Am/An) × 100. Triplicata por condição.',
  },
  {
    id: 'precisao_impressao',
    titulo: 'Precisão de Impressão + Altura Máxima',
    descricao: 'Cubo 15×15×15 mm para precisão dimensional + cilindro oco 28 mm para determinar altura máxima imprimível antes do colapso.',
    campos: [
      { id: 'l1', label: 'Comprimento medido (l₁)', unidade: 'mm', placeholder: 'ex: 14.8' },
      { id: 'l2', label: 'Comprimento nominal (l₂)', unidade: 'mm', placeholder: '15', defaultValue: '15' },
      { id: 'h1', label: 'Altura medida na borda (h₁)', unidade: 'mm', placeholder: 'ex: 14.5' },
      { id: 'h2', label: 'Altura nominal (h₂)', unidade: 'mm', placeholder: '15', defaultValue: '15' },
      { id: 'h3', label: 'Altura medida no centro (h₃)', unidade: 'mm', placeholder: 'ex: 14.7' },
      { id: 'altura_max_camadas', label: 'Camadas até colapso (cilindro oco)', unidade: 'camadas', placeholder: 'ex: 38' },
    ],
    protocolo: 'Cubo 15×15×15 mm, 13 camadas, densidade 70%. Cilindro oco ∅ 28 mm impresso continuamente até colapso. Bico 1,2 mm, velocidade 2,5 mm/s. PA(%) = [(1-|h₁-h₂|/h₂) + (1-|h₃-h₂|/h₂) + (1-|l₁-l₂|/l₂)]/3 × 100. Precisão: mín. 3 repetições. Altura máxima: 5 repetições.',
    referencia: 'Demircan et al., 2023; Cheng et al., 2024 — Int. J. Biological Macromolecules, 254.',
  },
]

function fmt(n: number, casas = 2) { return Number.isFinite(n) ? n.toFixed(casas) : '—' }

function calcularResultados(secaoId: SecaoId, v: Record<string, string>): string {
  const num = (k: string) => parseFloat(v[k] || '0')

  if (secaoId === 'reologia') {
    const v1 = num('viscosidade_1'), v100 = num('viscosidade_100')
    if (v1 > 0 && v100 > 0) {
      const n = Math.log(v100 / v1) / Math.log(100) + 1
      const tipo = n < 1 ? 'pseudoplástico (shear-thinning)' : n > 1 ? 'dilatante' : 'newtoniano'
      const recomendacao = n < 1 ? 'Favorável para extrusão 3D — boa recuperação após cisalhamento.' : 'Pode dificultar a extrusão uniforme.'
      return `Índice de comportamento: n ≈ ${fmt(n)} → ${tipo}. ${recomendacao}`
    }
  }

  if (secaoId === 'colapso_filamento') {
    const vaos = ['1mm', '2mm', '3mm', '4mm', '5mm', '6mm']
    const cfs = vaos.map(vao => {
      const at = num(`at_${vao}`), ar = num(`ar_${vao}`)
      return ar > 0 ? (at / ar) * 100 : null
    }).filter((x): x is number => x !== null && Number.isFinite(x))

    if (cfs.length === 0) return 'Preencha as áreas teórica e real de pelo menos um vão.'
    const media = cfs.reduce((s, x) => s + x, 0) / cfs.length
    const detalhes = vaos.map((vao, i) => {
      const at = num(`at_${vao}`), ar = num(`ar_${vao}`)
      return ar > 0 ? `${vao}: Cf = ${fmt((at / ar) * 100, 1)}%` : null
    }).filter(Boolean).join(' | ')

    let interp: string
    if (media < 20) interp = 'colapso total — material muito fluido, baixa tensão de escoamento. Adicionar agentes estruturantes (hidrocolóides, amidos, proteínas).'
    else if (media < 70) interp = 'sustentação parcial — estrutura moderadamente estável. Considerar ajuste fino na formulação.'
    else interp = 'ponte estável — material ideal para impressão 3D. Boa tensão de escoamento e recuperação tixotrópica.'

    return `Cf médio = ${fmt(media, 1)}% → ${interp}\n\n${detalhes}`
  }

  if (secaoId === 'tpa_cooking_loss') {
    const dureza = num('dureza')
    const a1 = num('area1'), a2 = num('area2')
    const d1 = num('d1'), d2 = num('d2')
    const m0 = num('massa_inicial'), ma = num('massa_final')

    const partes: string[] = []

    if (a1 > 0 && a2 > 0) {
      const coes = a2 / a1
      partes.push(`Coesividade = ${fmt(coes, 3)}`)
      if (d1 > 0 && d2 > 0 && dureza > 0) {
        const elast = d2 / d1
        const gomos = dureza * coes
        const mast = gomos * elast
        partes.push(`Elasticidade = ${fmt(elast, 3)}`)
        partes.push(`Gomosidade = ${fmt(gomos)} N`)
        partes.push(`Mastigabilidade = ${fmt(mast)} N`)
      }
    }

    if (m0 > 0 && ma >= 0) {
      const cl = ((m0 - ma) / m0) * 100
      let interpCL: string
      if (cl < 5) interpCL = 'baixa perda — alta estabilidade estrutural e retenção de água'
      else if (cl < 15) interpCL = 'perda moderada — retenção intermediária'
      else interpCL = 'alta perda — estrutura instável, baixa retenção'
      partes.push(`Cooking Loss = ${fmt(cl, 1)}% → ${interpCL}`)
    }

    return partes.length > 0 ? partes.join(' | ') : 'Preencha pelo menos massa inicial e final, ou áreas das compressões.'
  }

  if (secaoId === 'sinerese') {
    const w0 = num('w0'), wa = num('wa')
    if (w0 > 0 && wa >= 0) {
      const syn = ((w0 - wa) / w0) * 100
      let interp: string
      if (syn < 5) interp = 'baixa sinérese — alta retenção de água, estrutura estável, boa interação proteínas-hidrocolóides'
      else if (syn < 15) interp = 'sinérese moderada — estabilidade parcial'
      else interp = 'alta sinérese — estrutura instável, baixa interação entre componentes. Considerar adicionar mucilagem (ora-pro-nóbis), goma guar ou xantana'
      return `Sinérese = ${fmt(syn, 2)}% → ${interp}`
    }
  }

  if (secaoId === 'fidelidade_dimensional') {
    const am = num('area_medida'), an = num('area_nominal') || 22.56
    if (am > 0 && an > 0) {
      const fd = (am / an) * 100
      let interp: string
      if (fd >= 95 && fd <= 105) interp = 'alta precisão dimensional — equilíbrio reológico/processo adequado'
      else if (fd > 105) interp = 'over-extrusion — excesso de material. Reduzir vazão ou aumentar velocidade'
      else interp = 'subextrusão ou colapso — viscosidade alta ou vazão insuficiente. Aumentar vazão ou reduzir velocidade'
      return `Fidelidade Dimensional = ${fmt(fd, 1)}% → ${interp}`
    }
  }

  if (secaoId === 'precisao_impressao') {
    const l1 = num('l1'), l2 = num('l2') || 15
    const h1 = num('h1'), h2 = num('h2') || 15, h3 = num('h3')
    const camadas = num('altura_max_camadas')

    const partes: string[] = []
    if (l1 > 0 && h1 > 0 && h3 > 0 && l2 > 0 && h2 > 0) {
      const t1 = 1 - Math.abs(h1 - h2) / h2
      const t2 = 1 - Math.abs(h3 - h2) / h2
      const t3 = 1 - Math.abs(l1 - l2) / l2
      const pa = ((t1 + t2 + t3) / 3) * 100
      let interp: string
      if (pa >= 90) interp = 'alta fidelidade dimensional, impressão precisa e estável'
      else if (pa >= 75) interp = 'precisão aceitável com pequenos desvios geométricos'
      else interp = 'desvios significativos — possível colapso parcial, sobre-extrusão ou inconsistência de deposição'
      partes.push(`Precisão de Impressão (PA) = ${fmt(pa, 1)}% → ${interp}`)
    }
    if (camadas > 0) {
      let interpA: string
      if (camadas >= 30) interpA = 'excelente capacidade de sustentação vertical, alta resistência ao colapso'
      else if (camadas >= 15) interpA = 'sustentação intermediária'
      else interpA = 'estrutura instável, baixa capacidade de suporte vertical'
      partes.push(`Altura máxima = ${camadas} camadas → ${interpA}`)
    }
    return partes.length > 0 ? partes.join('\n\n') : 'Preencha l₁, h₁, h₃ ou nº de camadas.'
  }

  return 'Preencha os campos para calcular.'
}

export default function CaracterizacaoPage() {
  const [secaoAberta, setSecaoAberta] = useState<SecaoId | null>('colapso_filamento')
  const [valores, setValores] = useState<Partial<Record<SecaoId, Record<string, string>>>>({})
  const [resultados, setResultados] = useState<Partial<Record<SecaoId, string>>>({})

  function getValor(secaoId: SecaoId, campo: Campo): string {
    const v = valores[secaoId]?.[campo.id]
    if (v !== undefined) return v
    return campo.defaultValue ?? ''
  }

  function updateValor(secaoId: SecaoId, campo: string, valor: string) {
    setValores(prev => ({ ...prev, [secaoId]: { ...(prev[secaoId] ?? {}), [campo]: valor } }))
  }

  function calcular(secaoId: SecaoId) {
    const secao = SECOES.find(s => s.id === secaoId)!
    const vals = { ...valores[secaoId] }
    // aplica defaults faltantes
    for (const c of secao.campos) {
      if ((vals[c.id] === undefined || vals[c.id] === '') && c.defaultValue) {
        vals[c.id] = c.defaultValue
      }
    }
    const r = calcularResultados(secaoId, vals as Record<string, string>)
    setResultados(prev => ({ ...prev, [secaoId]: r }))
  }

  function baixarProtocolo(secao: Secao) {
    const linhas = [
      `PROTOCOLO — ${secao.titulo.toUpperCase()}`,
      `MIA by Morphê Foods`,
      ``,
      `OBJETIVO`,
      secao.descricao,
      ``,
      `PROCEDIMENTO`,
      secao.protocolo,
      ``,
      `CAMPOS DE MEDIÇÃO`,
      ...secao.campos.map(c => `• ${c.label} (${c.unidade})`),
    ]
    if (secao.referencia) {
      linhas.push('', 'REFERÊNCIA', secao.referencia)
    }
    const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protocolo_${secao.id}_mia.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Caracterização</h1>
        <p className="text-sm text-[#58413c] mt-1">
          Insira dados experimentais para calcular índices de printabilidade, textura e estabilidade.
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-8">
        <div className="space-y-2 mb-6">
          {SECOES.map(secao => {
            const aberta = secaoAberta === secao.id
            const temResultado = !!resultados[secao.id]
            return (
              <div key={secao.id} className="bg-white rounded-2xl shadow-tonal overflow-hidden">
                <button
                  onClick={() => setSecaoAberta(aberta ? null : secao.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f9edd4] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Microscope size={15} className={temResultado ? 'text-[#003223]' : 'text-[#58413c]'} />
                    <span className="text-sm font-medium">{secao.titulo}</span>
                    {temResultado && (
                      <span className="text-[10px] bg-[rgba(0,50,35,0.1)] text-[#003223] px-2 py-0.5 rounded-full">calculado</span>
                    )}
                  </div>
                  <ChevronRight size={14} className={`text-[#58413c] transition-transform ${aberta ? 'rotate-90' : ''}`} />
                </button>

                {aberta && (
                  <div className="px-4 pb-4 border-t border-[#e5d9c1] pt-4">
                    <p className="text-xs text-[#58413c] mb-4 leading-relaxed">{secao.descricao}</p>

                    <div className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-[#003223]">Protocolo de medição</p>
                        <button
                          onClick={() => baixarProtocolo(secao)}
                          className="flex items-center gap-1 text-[10px] text-[#58413c] hover:text-[#003223] transition-colors"
                        >
                          <Download size={10} /> Baixar
                        </button>
                      </div>
                      <p className="text-xs text-[#58413c] leading-relaxed">{secao.protocolo}</p>
                      {secao.referencia && (
                        <p className="text-[10px] text-[#707974] mt-2 italic">Ref.: {secao.referencia}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {secao.campos.map(campo => (
                        <div key={campo.id}>
                          <label className="text-xs text-[#58413c] block mb-1">
                            {campo.label} {campo.unidade && <span className="text-[#003223]/70">({campo.unidade})</span>}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={getValor(secao.id, campo)}
                            onChange={e => updateValor(secao.id, campo.id, e.target.value)}
                            placeholder={campo.placeholder}
                            className="w-full bg-[#fff8f1] border border-[#e5d9c1] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#003223]/30"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => calcular(secao.id)}
                      className="flex items-center gap-2 bg-[#003223] hover:bg-[#004d35] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors mb-3"
                    >
                      <Sparkles size={13} /> Calcular
                    </button>

                    {resultados[secao.id] && (
                      <div className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg p-3">
                        <p className="text-xs font-medium text-[#003223] mb-1">Resultado</p>
                        <p className="text-sm text-[#58413c] leading-relaxed whitespace-pre-line">{resultados[secao.id]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
