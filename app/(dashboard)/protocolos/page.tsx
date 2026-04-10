'use client'
import { useEffect, useState } from 'react'
import { FileDown, Download, FileText, FlaskConical, Microscope, BookOpen } from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
  ingredientes: Array<{ nome: string; percentual: number; funcao: string }>
  observacoes: string
  created_at: string
}

const PROTOCOLOS_CARACTERIZACAO = [
  {
    id: 'reologia',
    titulo: 'Protocolo de Análise Reológica',
    descricao: 'Medição de viscosidade, índice de comportamento e tensão de escoamento.',
    conteudo: `PROTOCOLO DE ANÁLISE REOLÓGICA
MIA by Morphê Foods — v1.0

EQUIPAMENTO: Reômetro rotacional ou viscosímetro Brookfield LV/RV/HA.

PROCEDIMENTO:
1. Calibrar o equipamento com fluido de referência.
2. Ajustar temperatura para 25 °C (banho termostático).
3. Usar spindle adequado à faixa de viscosidade esperada.
4. Medir viscosidade nas rotações: 1, 5, 10, 50, 100 rpm.
5. Aguardar 60 s de equilíbrio antes de cada leitura.
6. Repetir em triplicata. Calcular média e desvio padrão.

CÁLCULOS:
- Índice de comportamento (n): n = log(η₁₀₀/η₁) / log(100)
- Índice de consistência (K): K = η / (γ̇^(n-1))
- n < 1 → pseudoplástico (favorável para extrusão 3D)
- n = 1 → newtoniano
- n > 1 → dilatante

EXPRESSÃO DOS RESULTADOS:
Reportar: viscosidade aparente (mPa·s), n, K, tensão de escoamento (Pa), temperatura (°C).`,
  },
  {
    id: 'precisao_dimensional',
    titulo: 'Protocolo de Precisão Dimensional',
    descricao: 'Avaliação da fidelidade geométrica do objeto impresso vs. STL.',
    conteudo: `PROTOCOLO DE PRECISÃO DIMENSIONAL
MIA by Morphê Foods — v1.0

EQUIPAMENTO: Paquímetro digital (resolução 0,01 mm).

PROCEDIMENTO:
1. Imprimir o modelo STL de referência com os parâmetros registrados.
2. Aguardar 10 min para estabilização da peça.
3. Medir largura (X), comprimento (Y) e altura (Z) em 3 pontos distintos cada.
4. Calcular média e desvio padrão por eixo.
5. Comparar com as dimensões nominais do STL.

CÁLCULO DO ERRO DIMENSIONAL:
Erro (%) = |Dreal - DSTL| / DSTL × 100

CRITÉRIOS DE ACEITAÇÃO:
- Erro < 5%: excelente
- 5–10%: aceitável
- > 10%: necessita ajuste de parâmetros

EXPRESSÃO DOS RESULTADOS:
Reportar: dimensões nominais e reais (mm), erro por eixo (%), desvio padrão.`,
  },
  {
    id: 'indice_colapso',
    titulo: 'Protocolo de Índice de Colapso',
    descricao: 'Quantificação da perda de altura estrutural ao longo do tempo.',
    conteudo: `PROTOCOLO DE ÍNDICE DE COLAPSO
MIA by Morphê Foods — v1.0

EQUIPAMENTO: Paquímetro digital ou câmera com régua de referência.

PROCEDIMENTO:
1. Medir a altura imediatamente após a impressão (H₀).
2. Manter a peça em temperatura ambiente.
3. Medir altura nos tempos: 10, 30 e 60 min.
4. Fotografar lateralmente com régua em cada medição.
5. Repetir em triplicata.

CÁLCULO:
IC(t) (%) = (H₀ - Hₜ) / H₀ × 100

INTERPRETAÇÃO:
- IC < 5%: excelente estabilidade
- IC 5–15%: moderada
- IC > 15%: necessita aumento de agente gelificante

EXPRESSÃO DOS RESULTADOS:
Reportar: H₀ (mm), H₁₀, H₃₀, H₆₀ (mm), IC por tempo (%).`,
  },
  {
    id: 'tpa',
    titulo: 'Protocolo de Análise de Textura (TPA)',
    descricao: 'Perfil de textura por dupla compressão — dureza, coesividade, elasticidade.',
    conteudo: `PROTOCOLO DE ANÁLISE DE TEXTURA INSTRUMENTAL (TPA)
MIA by Morphê Foods — v1.0

EQUIPAMENTO: Texturômetro TA-XT Plus ou equivalente. Sonda P/36R (cilíndrica, 36 mm).

CONDIÇÕES:
- Velocidade pré-teste: 1,0 mm/s
- Velocidade de teste: 1,0 mm/s
- Velocidade pós-teste: 1,0 mm/s
- Deformação: 50% da altura da amostra
- Tempo entre ciclos: 5 s
- Temperatura: 25 °C

PROCEDIMENTO:
1. Posicionar a amostra centralizada sob a sonda.
2. Executar dupla compressão automaticamente.
3. Registrar curva força × tempo.
4. Repetir em 5 amostras.

PARÂMETROS CALCULADOS AUTOMATICAMENTE:
- Dureza (N): pico da 1ª compressão
- Coesividade: Área₂ / Área₁
- Elasticidade: D₂ / D₁
- Mastigabilidade (N): Dureza × Coesividade × Elasticidade
- Adesividade (N·s): área negativa entre compressões

EXPRESSÃO DOS RESULTADOS:
Reportar média ± desvio padrão para cada parâmetro.`,
  },
  {
    id: 'overhang',
    titulo: 'Protocolo de Ângulo de Impressão (Overhang)',
    descricao: 'Avaliação da capacidade de imprimir estruturas em balanço.',
    conteudo: `PROTOCOLO DE ÂNGULO DE IMPRESSÃO (OVERHANG)
MIA by Morphê Foods — v1.0

MODELO STL: Escada de overhang com ângulos: 15°, 30°, 45°, 60°, 75° (cada degrau = 10 mm).

PROCEDIMENTO:
1. Imprimir o modelo de teste com os parâmetros padrão.
2. Fotografar lateralmente a 90° do eixo de impressão.
3. Para cada ângulo, medir o afastamento do plano teórico.
4. Registrar o ângulo máximo sem deformação visível.
5. Registrar o ângulo de início de colapso.

MEDIÇÃO:
- Usar paquímetro ou análise de imagem (ImageJ).
- Deformação (mm): distância entre posição real e teórica.

INTERPRETAÇÃO:
- Ângulo máximo > 45°: excelente capacidade de overhang
- 30–45°: boa
- < 30°: necessita ajuste de formulação/velocidade

EXPRESSÃO DOS RESULTADOS:
Reportar ângulo máximo suportado (°), ângulo de início de colapso (°), deformação por ângulo (mm).`,
  },
  {
    id: 'cor',
    titulo: 'Protocolo de Análise de Cor (CIELab)',
    descricao: 'Medição objetiva de cor pelo sistema L*, a*, b*.',
    conteudo: `PROTOCOLO DE ANÁLISE DE COR (CIELab)
MIA by Morphê Foods — v1.0

EQUIPAMENTO: Colorímetro ou espectrofotômetro. Iluminante D65, observador 10°.

PROCEDIMENTO:
1. Calibrar com placa branca e preta padrão.
2. Medir a superfície da amostra em 5 pontos distintos.
3. Registrar L*, a*, b* para cada ponto.
4. Calcular média e desvio padrão.
5. Calcular ΔE em relação à referência (se disponível).

CÁLCULO ΔE:
ΔE = √[(ΔL*)² + (Δa*)² + (Δb*)²]
ΔE < 1: diferença imperceptível
ΔE 1–3: diferença pequena
ΔE > 3: diferença perceptível

EXPRESSÃO DOS RESULTADOS:
Reportar: L* (0–100), a* (-128 a +127), b* (-128 a +127), Croma = √(a*²+b*²), ΔE (se aplicável).`,
  },
]

function gerarFichaTecnica(f: Formulacao): string {
  return `FICHA TÉCNICA
${f.nome.toUpperCase()}
MIA by Morphê Foods — gerado em ${new Date().toLocaleDateString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPOSIÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${f.ingredientes?.map(i => `• ${i.nome}: ${i.percentual}% — ${i.funcao}`).join('\n') ?? 'Não informado'}

Total de sólidos: ${f.ingredientes?.reduce((s, i) => s + i.percentual, 0).toFixed(1) ?? '0'}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMAÇÕES TÉCNICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data de criação: ${new Date(f.created_at).toLocaleDateString('pt-BR')}
Aplicação: Impressão 3D de alimentos (FDM adaptado)
Conservação: Refrigerado (4 °C), usar em até 24 h após preparo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${f.observacoes || 'Nenhuma observação registrada.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVISO REGULATÓRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este documento é gerado automaticamente pela plataforma MIA para fins de pesquisa e desenvolvimento.
Não substitui análise laboratorial ou consultoria regulatória profissional.
Para comercialização, adequar conforme RDC 727/2022 (ANVISA).`
}

function gerarPOP(f: Formulacao): string {
  return `PROCEDIMENTO OPERACIONAL PADRÃO (POP)
${f.nome.toUpperCase()}
MIA by Morphê Foods — gerado em ${new Date().toLocaleDateString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Descrever o procedimento padrão de preparo e impressão 3D desta formulação.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INGREDIENTES (para 100 g de formulação)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${f.ingredientes?.map(i => `• ${i.nome}: ${i.percentual} g — ${i.funcao}`).join('\n') ?? 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREPARO DA FORMULAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Pesar todos os ingredientes em balança analítica.
2. Hidratar hidrocolóides em água fria por 30 min.
3. Incorporar demais ingredientes conforme ordem de adição.
4. Homogeneizar (mixer ou agitação mecânica) por 5 min.
5. Verificar viscosidade antes de carregar na seringa.
6. Deixar descansar 15 min para eliminar bolhas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESSO DE IMPRESSÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Carregar a seringa evitando incorporação de ar.
2. Purgar até material sair uniformemente.
3. Nivelar a plataforma de impressão.
4. Configurar parâmetros conforme indicado na aba Parâmetros.
5. Iniciar impressão e monitorar as primeiras camadas.
6. Registrar na aba Experimentos o resultado obtido.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTROLE DE QUALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Verificar uniformidade visual da extrusão
• Avaliar aderência entre camadas
• Medir dimensões finais com paquímetro
• Registrar observações no sistema MIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSÁVEL / REVISÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gerado por: MIA — Morphê Foods
Data: ${new Date().toLocaleDateString('pt-BR')}
Versão: 1.0`
}

export default function ProtocolosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [formulacaoId, setFormulacaoId] = useState('')
  const [baixando, setBaixando] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulacoes')
      .then(r => r.json())
      .then(data => setFormulacoes(data || []))
  }, [])

  function downloadTxt(conteudo: string, nomeArquivo: string) {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nomeArquivo
    a.click()
    URL.revokeObjectURL(url)
  }

  async function baixarDocFormulacao(tipo: 'ficha' | 'pop') {
    const form = formulacoes.find(f => f.id === formulacaoId)
    if (!form) return
    setBaixando(tipo)

    // Tenta API de export (PDF), senão gera TXT
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formulacao_id: formulacaoId, tipo: tipo === 'ficha' ? 'ficha_tecnica' : 'pop' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tipo === 'ficha' ? 'ficha_tecnica' : 'pop'}_${form.nome.replace(/\s+/g, '_')}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        throw new Error('API indisponível')
      }
    } catch {
      const conteudo = tipo === 'ficha' ? gerarFichaTecnica(form) : gerarPOP(form)
      downloadTxt(conteudo, `${tipo === 'ficha' ? 'ficha_tecnica' : 'pop'}_${form.nome.replace(/\s+/g, '_')}.txt`)
    }

    setBaixando(null)
  }

  function baixarProtocoloCaracterizacao(p: typeof PROTOCOLOS_CARACTERIZACAO[0]) {
    setBaixando(p.id)
    downloadTxt(p.conteudo, `protocolo_${p.id}_mia.txt`)
    setTimeout(() => setBaixando(null), 500)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Protocolos</h1>
        <p className="text-sm text-[#58413c] mt-1">
          Baixe documentos gerados: protocolos de caracterização, POP e ficha técnica.
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-8">
        <div className="mb-6">

        {/* Documentos por formulação */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={15} className="text-[#003223]" />
            <h2 className="text-sm font-semibold">Documentos da formulação</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-tonal p-4 mb-3">
            <label className="text-xs text-[#58413c] block mb-1.5">Selecione a formulação</label>
            <select
              value={formulacaoId}
              onChange={e => setFormulacaoId(e.target.value)}
              className="input-premium focus:ring-[#003223]/30"
            >
              <option value="">Selecione...</option>
              {formulacoes.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
            {formulacoes.length === 0 && (
              <p className="text-xs text-[#58413c] mt-1">
                Nenhuma formulação salva.{' '}
                <a href="/formular" className="text-[#003223] hover:underline">Criar agora</a>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                tipo: 'ficha' as const,
                titulo: 'Ficha Técnica',
                desc: 'Composição, processo, tabela nutricional estimada e informações regulatórias.',
                icon: BookOpen,
              },
              {
                tipo: 'pop' as const,
                titulo: 'POP',
                desc: 'Procedimento Operacional Padrão para replicação do processo de preparo e impressão.',
                icon: FileText,
              },
            ].map(doc => (
              <div key={doc.tipo} className="bg-white rounded-2xl shadow-tonal p-4">
                <div className="flex items-center gap-2 mb-2">
                  <doc.icon size={14} className="text-[#003223]" />
                  <h3 className="text-sm font-medium">{doc.titulo}</h3>
                </div>
                <p className="text-xs text-[#58413c] mb-4 leading-relaxed">{doc.desc}</p>
                <button
                  onClick={() => baixarDocFormulacao(doc.tipo)}
                  disabled={!formulacaoId || baixando === doc.tipo}
                  className="w-full flex items-center justify-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-md transition-colors"
                >
                  <Download size={12} />
                  {baixando === doc.tipo ? 'Gerando...' : `Baixar ${doc.titulo}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Protocolos de caracterização */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Microscope size={15} className="text-[#003223]" />
            <h2 className="text-sm font-semibold">Protocolos de caracterização</h2>
          </div>
          <p className="text-xs text-[#58413c] mb-4">
            Protocolos metodológicos para todas as análises disponíveis na aba Caracterização.
          </p>

          <div className="space-y-2">
            {PROTOCOLOS_CARACTERIZACAO.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-tonal p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileDown size={15} className="text-[#58413c] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.titulo}</p>
                    <p className="text-xs text-[#58413c] truncate">{p.descricao}</p>
                  </div>
                </div>
                <button
                  onClick={() => baixarProtocoloCaracterizacao(p)}
                  disabled={baixando === p.id}
                  className="flex items-center gap-1.5 flex-shrink-0 text-xs bg-[#fff8f1] border border-[#e5d9c1] hover:border-[#e5d9c1] hover:text-[#003223] text-[#58413c] px-3 py-1.5 rounded-md transition-colors"
                >
                  <Download size={11} />
                  {baixando === p.id ? '...' : 'Baixar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
