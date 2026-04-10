'use client'
import { useState } from 'react'
import { Microscope, Sparkles, Download, ChevronRight } from 'lucide-react'

type SecaoId =
  | 'reologia'
  | 'precisao'
  | 'colapso'
  | 'textura'
  | 'angulo'
  | 'superficie'
  | 'estabilidade'
  | 'cor'

interface Secao {
  id: SecaoId
  titulo: string
  descricao: string
  campos: { id: string; label: string; unidade: string; placeholder: string }[]
  protocolo: string
}

const SECOES: Secao[] = [
  {
    id: 'reologia',
    titulo: 'Análise Reológica',
    descricao: 'Insira os dados de viscosidade e comportamento de fluxo para determinar o índice de comportamento e consistência.',
    campos: [
      { id: 'viscosidade_1', label: 'Viscosidade a 1 rpm', unidade: 'mPa·s', placeholder: 'ex: 12500' },
      { id: 'viscosidade_10', label: 'Viscosidade a 10 rpm', unidade: 'mPa·s', placeholder: 'ex: 6800' },
      { id: 'viscosidade_100', label: 'Viscosidade a 100 rpm', unidade: 'mPa·s', placeholder: 'ex: 2100' },
      { id: 'tensao_escoamento', label: 'Tensão de escoamento (σ₀)', unidade: 'Pa', placeholder: 'ex: 45' },
      { id: 'temperatura', label: 'Temperatura de medição', unidade: '°C', placeholder: 'ex: 25' },
    ],
    protocolo: 'Reômetro rotacional ou viscosímetro Brookfield. Medições em 1, 5, 10, 50 e 100 rpm. Temperatura controlada. Aguardar 60 s antes de cada leitura.',
  },
  {
    id: 'precisao',
    titulo: 'Precisão Dimensional',
    descricao: 'Avalie a fidelidade geométrica do objeto impresso em relação ao modelo STL.',
    campos: [
      { id: 'dim_x_real', label: 'Dimensão X real', unidade: 'mm', placeholder: 'ex: 19.8' },
      { id: 'dim_x_stl', label: 'Dimensão X do STL', unidade: 'mm', placeholder: 'ex: 20.0' },
      { id: 'dim_y_real', label: 'Dimensão Y real', unidade: 'mm', placeholder: 'ex: 19.7' },
      { id: 'dim_y_stl', label: 'Dimensão Y do STL', unidade: 'mm', placeholder: 'ex: 20.0' },
      { id: 'dim_z_real', label: 'Dimensão Z real', unidade: 'mm', placeholder: 'ex: 9.9' },
      { id: 'dim_z_stl', label: 'Dimensão Z do STL', unidade: 'mm', placeholder: 'ex: 10.0' },
    ],
    protocolo: 'Paquímetro digital (resolução 0,01 mm). Medir 3 pontos por eixo. Calcular média e desvio padrão. Comparar com o arquivo STL de referência.',
  },
  {
    id: 'colapso',
    titulo: 'Índice de Colapso',
    descricao: 'Quantifica a perda de altura e deformação estrutural após a impressão e durante o armazenamento.',
    campos: [
      { id: 'altura_inicial', label: 'Altura inicial (recém-impresso)', unidade: 'mm', placeholder: 'ex: 20.0' },
      { id: 'altura_10min', label: 'Altura após 10 min', unidade: 'mm', placeholder: 'ex: 19.2' },
      { id: 'altura_30min', label: 'Altura após 30 min', unidade: 'mm', placeholder: 'ex: 18.5' },
      { id: 'altura_60min', label: 'Altura após 60 min', unidade: 'mm', placeholder: 'ex: 17.8' },
    ],
    protocolo: 'Fotografar lateralmente com régua de referência a 0, 10, 30 e 60 min. Medir altura com paquímetro. IC (%) = (H₀ - Hₜ) / H₀ × 100.',
  },
  {
    id: 'textura',
    titulo: 'Análise de Textura Instrumental (TPA)',
    descricao: 'Perfil de textura por dupla compressão: dureza, coesividade, elasticidade, mastigabilidade.',
    campos: [
      { id: 'dureza', label: 'Dureza (pico 1ª compressão)', unidade: 'N', placeholder: 'ex: 12.4' },
      { id: 'coesividade', label: 'Coesividade', unidade: 'adimensional', placeholder: 'ex: 0.72' },
      { id: 'elasticidade', label: 'Elasticidade', unidade: 'adimensional', placeholder: 'ex: 0.85' },
      { id: 'mastigabilidade', label: 'Mastigabilidade', unidade: 'N', placeholder: 'ex: 7.6' },
      { id: 'adesividade', label: 'Adesividade', unidade: 'N·s', placeholder: 'ex: -2.1' },
    ],
    protocolo: 'Texturômetro TA-XT Plus ou similar. Sonda cilíndrica P/36R. Deformação 50%, velocidade pré-teste 1 mm/s, teste 1 mm/s, pós-teste 1 mm/s. Tempo entre ciclos: 5 s.',
  },
  {
    id: 'angulo',
    titulo: 'Ângulo de Impressão (Overhang)',
    descricao: 'Avalia a capacidade do material de suportar estruturas em balanço sem colapso.',
    campos: [
      { id: 'angulo_maximo', label: 'Ângulo máximo suportado', unidade: '°', placeholder: 'ex: 45' },
      { id: 'angulo_colapso', label: 'Ângulo de início de colapso', unidade: '°', placeholder: 'ex: 55' },
      { id: 'deformacao_30', label: 'Deformação a 30°', unidade: 'mm', placeholder: 'ex: 0.3' },
      { id: 'deformacao_45', label: 'Deformação a 45°', unidade: 'mm', placeholder: 'ex: 0.8' },
    ],
    protocolo: 'Imprimir modelo de overhang escalonado (15°, 30°, 45°, 60°). Fotografar e medir o afastamento do plano teórico com paquímetro ou análise de imagem.',
  },
  {
    id: 'superficie',
    titulo: 'Avaliação de Superfície e Textura Visual',
    descricao: 'Avalia a qualidade da superfície impressa por inspeção visual e análise de imagem.',
    campos: [
      { id: 'rugosidade_visual', label: 'Rugosidade visual (1–5)', unidade: 'score', placeholder: 'ex: 3' },
      { id: 'visibilidade_camadas', label: 'Visibilidade de camadas (1–5)', unidade: 'score', placeholder: 'ex: 2' },
      { id: 'uniformidade', label: 'Uniformidade de extrusão (1–5)', unidade: 'score', placeholder: 'ex: 4' },
      { id: 'defeitos', label: 'Nº de defeitos visíveis', unidade: 'contagem', placeholder: 'ex: 2' },
    ],
    protocolo: 'Fotografia padronizada (mesma câmera, distância e iluminação). Escala: 1 (péssimo) a 5 (excelente). Avaliação por 3 julgadores treinados. Calcular média e desvio padrão.',
  },
  {
    id: 'estabilidade',
    titulo: 'Estabilidade Pós-Impressão',
    descricao: 'Avalia a manutenção de forma e características ao longo do tempo de armazenamento.',
    campos: [
      { id: 'sinérese_24h', label: 'Sinérese em 24 h', unidade: '%', placeholder: 'ex: 3.2' },
      { id: 'perda_massa_24h', label: 'Perda de massa em 24 h', unidade: '%', placeholder: 'ex: 1.5' },
      { id: 'variacao_cor_24h', label: 'Variação de cor ΔE em 24 h', unidade: 'CIE ΔE', placeholder: 'ex: 2.1' },
      { id: 'tempo_estavel', label: 'Tempo de estabilidade aceitável', unidade: 'horas', placeholder: 'ex: 48' },
    ],
    protocolo: 'Armazenar a 4 °C e temperatura ambiente. Avaliar a cada 4, 8, 24 e 48 h. Medir massa em balança analítica. Sinérese: absorver e pesar papel filtro.',
  },
  {
    id: 'cor',
    titulo: 'Análise de Cor e Aparência',
    descricao: 'Quantificação objetiva da cor pelo sistema CIELab (L*, a*, b*).',
    campos: [
      { id: 'L', label: 'L* (luminosidade)', unidade: '0–100', placeholder: 'ex: 72.5' },
      { id: 'a', label: 'a* (vermelho–verde)', unidade: '-128–+127', placeholder: 'ex: 8.3' },
      { id: 'b', label: 'b* (amarelo–azul)', unidade: '-128–+127', placeholder: 'ex: 22.1' },
      { id: 'delta_e', label: 'ΔE (vs. referência)', unidade: 'CIE ΔE', placeholder: 'ex: 3.4' },
    ],
    protocolo: 'Colorímetro ou espectrofotômetro. Iluminante D65, observador 10°. Calibrar com placas branca/preta. Medir 5 pontos diferentes. Calcular média e ΔE vs. referência.',
  },
]

function calcularResultados(secaoId: SecaoId, valores: Record<string, string>): string {
  if (secaoId === 'reologia') {
    const v1 = parseFloat(valores.viscosidade_1 || '0')
    const v100 = parseFloat(valores.viscosidade_100 || '0')
    if (v1 > 0 && v100 > 0) {
      const n = Math.log(v100 / v1) / Math.log(100)
      const tipo = n < 1 ? 'pseudoplástico (shear-thinning)' : n > 1 ? 'dilatante' : 'newtoniano'
      return `Índice de comportamento estimado: n ≈ ${n.toFixed(2)} → comportamento ${tipo}. ${n < 1 ? 'Favorável para extrusão 3D.' : 'Pode dificultar a extrusão uniforme.'}`
    }
  }
  if (secaoId === 'precisao') {
    const erros = ['x', 'y', 'z'].map(eixo => {
      const real = parseFloat(valores[`dim_${eixo}_real`] || '0')
      const stl = parseFloat(valores[`dim_${eixo}_stl`] || '1')
      return stl > 0 ? Math.abs((real - stl) / stl * 100) : 0
    }).filter(e => e > 0)
    if (erros.length > 0) {
      const media = erros.reduce((a, b) => a + b, 0) / erros.length
      return `Erro dimensional médio: ${media.toFixed(2)}%. ${media < 5 ? 'Excelente precisão.' : media < 10 ? 'Precisão aceitável.' : 'Alta deformação — revisar parâmetros.'}`
    }
  }
  if (secaoId === 'colapso') {
    const h0 = parseFloat(valores.altura_inicial || '0')
    const h60 = parseFloat(valores.altura_60min || '0')
    if (h0 > 0 && h60 > 0) {
      const ic = (h0 - h60) / h0 * 100
      return `Índice de colapso (60 min): IC = ${ic.toFixed(1)}%. ${ic < 5 ? 'Excelente estabilidade estrutural.' : ic < 15 ? 'Estabilidade moderada.' : 'Alto colapso — aumentar concentração de agente gelificante.'}`
    }
  }
  if (secaoId === 'cor') {
    const L = parseFloat(valores.L || '0')
    const a = parseFloat(valores.a || '0')
    const b = parseFloat(valores.b || '0')
    if (L > 0) {
      const chroma = Math.sqrt(a * a + b * b)
      return `Luminosidade: ${L.toFixed(1)} | Croma: ${chroma.toFixed(1)} | ${L > 60 ? 'Cor clara/brilhante' : 'Cor escura/opaca'}. ${chroma > 20 ? 'Cor saturada' : 'Cor dessaturada/acromática'}.`
    }
  }
  return ''
}

export default function CaracterizacaoPage() {
  const [secaoAberta, setSecaoAberta] = useState<SecaoId | null>('reologia')
  const [valores, setValores] = useState<Partial<Record<SecaoId, Record<string, string>>>>({})
  const [resultados, setResultados] = useState<Partial<Record<SecaoId, string>>>({})

  function updateValor(secaoId: SecaoId, campo: string, valor: string) {
    setValores(prev => ({
      ...prev,
      [secaoId]: { ...(prev[secaoId] ?? {}), [campo]: valor },
    }))
  }

  function calcular(secaoId: SecaoId) {
    const vals = valores[secaoId] ?? {}
    const resultado = calcularResultados(secaoId, vals)
    setResultados(prev => ({ ...prev, [secaoId]: resultado || 'Preencha os campos para calcular.' }))
  }

  function baixarProtocolo(secao: Secao) {
    const conteudo = `PROTOCOLO — ${secao.titulo.toUpperCase()}\nMIA by Morphê Foods\n\n${secao.protocolo}\n\nCAMPOS DE MEDIÇÃO:\n${secao.campos.map(c => `• ${c.label} (${c.unidade})`).join('\n')}`
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
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
          Insira dados das análises para calcular índices e obter protocolos.
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-8">
        <div className="mb-6">

        <div className="space-y-2">
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
                    <p className="text-xs text-[#58413c] mb-4">{secao.descricao}</p>

                    {/* Protocolo */}
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
                    </div>

                    {/* Campos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {secao.campos.map(campo => (
                        <div key={campo.id}>
                          <label className="text-xs text-[#58413c] block mb-1">
                            {campo.label} <span className="text-[#003223]/70">({campo.unidade})</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={valores[secao.id]?.[campo.id] ?? ''}
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
                        <p className="text-sm text-[#58413c] leading-relaxed">{resultados[secao.id]}</p>
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
    </div>
  )
}
