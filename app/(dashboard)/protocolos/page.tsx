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
    id: 'colapso_filamento',
    titulo: 'Teste de Colapso de Filamento',
    descricao: 'Avaliação de sustentação estrutural por análise de pontes sobre vãos de 1 a 6 mm.',
    referencia: 'Sviech et al., 2025',
    conteudo: `TESTE DE COLAPSO DE FILAMENTO PARA IMPRESSÃO 3D DE ALIMENTOS
Versão: 1.0  |  Emissão: Abril/2026  |  Referência: Sviech et al., 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJETIVO
Avaliar a capacidade de sustentação e estabilidade estrutural de formulações alimentícias para impressão 3D, por meio da análise do comportamento de um filamento extrudado sobre vãos livres.

2. PRINCÍPIO DO MÉTODO
O teste consiste na deposição de um único filamento sobre uma plataforma contendo pilares com diferentes espaçamentos. O material forma pontes suspensas, permitindo avaliar sua capacidade de resistir à deformação gravitacional. A deflexão do filamento está diretamente relacionada a propriedades reológicas como tensão de escoamento, coesão estrutural e recuperação tixotrópica.

3. GEOMETRIA DA PONTE DE COLAPSO
Plataforma com 6 pilares paralelos de altura uniforme, separados por vãos de distâncias crescentes (1, 2, 3, 4, 5 e 6 mm). A geometria padronizada garante reprodutibilidade do ensaio e permite comparação direta entre formulações.

4. PROCEDIMENTO EXPERIMENTAL
1. Carregar a formulação na impressora.
2. Posicionar a plataforma de teste na mesa de impressão.
3. Ajustar parâmetros de impressão (velocidade de extrusão, temperatura, diâmetro do bico, altura de camada).
4. Extrudar um único filamento sobre os pilares, formando pontes sobre os vãos.
5. Garantir que o filamento atravesse todos os espaçamentos em uma única deposição contínua.
6. Registrar imagens imediatamente após a impressão, evitando influência do tempo na deformação.

5. ANÁLISE DOS RESULTADOS
Determinação das áreas (ImageJ/Fiji com escala calibrada):
• At = área teórica = região ideal do filamento sem deformação (linha reta entre pilares)
• Ar = área real = região efetivamente ocupada pelo filamento impresso, incluindo curvatura do colapso

Cálculo do Fator de Colapso:
    Cf (%) = (At / Ar) × 100

Calcular individualmente para cada vão e cada replicata. Registrar média e desvio padrão por vão e formulação.

6. INTERPRETAÇÃO DOS RESULTADOS
• Cf próximo a 0%: colapso total — material muito fluido, baixa viscosidade ou tensão de escoamento
• Cf entre 20% e 70%: sustentação parcial — estrutura moderadamente estável, pode exigir ajuste
• Cf > 70%: ausência de colapso significativo, ponte estável — ideal para impressão 3D

Cf elevado → maior tensão de escoamento e melhor recuperação tixotrópica.
Cf reduzido → necessita reformulação com agentes estruturantes (hidrocolóides, amidos, proteínas).

7. REPETIÇÕES E TRATAMENTO ESTATÍSTICO
Mínimo de 3 repetições independentes por formulação, mantendo os mesmos parâmetros de impressão. Resultados expressos como média ± desvio padrão.

8. OBSERVAÇÕES IMPORTANTES
• Garantir consistência na extrusão (evitar pulsação)
• Controlar a temperatura ambiente durante o teste
• Padronizar o tempo entre impressão e captura de imagem
• Evitar vibrações na mesa durante o procedimento

9. REFERÊNCIA
Sviech, F., Silva, M. F., Goldbeck, R., Andreola, K., & Prata, A. S. (2025). Rheology and prebiotic activity of Ora-pro-Nobis for the development of functional ingredients by 3D food printing. Food Bioscience, 72, 107519. https://doi.org/10.1016/j.fbio.2025.107519`,
  },
  {
    id: 'tpa_cooking_loss',
    titulo: 'TPA + Perda de Massa no Cozimento',
    descricao: 'Análise de Perfil de Textura por dupla compressão e perda de massa após cozimento.',
    referencia: 'Demircan et al., 2023',
    conteudo: `ANÁLISE DE PERFIL DE TEXTURA (TPA) E PERDA DE MASSA NO COZIMENTO
PARA IMPRESSÃO 3D DE ALIMENTOS
Versão: 1.0  |  Emissão: Abril/2026  |  Referência: Demircan et al., 2023

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJETIVO
Avaliar as propriedades texturais e a estabilidade estrutural de formulações alimentícias impressas em 3D, por meio da Análise de Perfil de Textura (TPA) e da determinação da perda de massa durante o cozimento.

2. PRINCÍPIO DO MÉTODO

Análise de Perfil de Textura (TPA):
A TPA simula mecanicamente o processo de mastigação, permitindo obter parâmetros como dureza, coesividade, elasticidade, gomosidade e mastigabilidade. Esses parâmetros estão diretamente relacionados à estrutura interna do material e sua aceitabilidade sensorial.

Perda de massa no cozimento (Cooking Loss):
Avalia a capacidade da matriz alimentar em reter água e outros constituintes durante o tratamento térmico. A liberação de líquidos está associada à estabilidade da rede estrutural formada por proteínas, polissacarídeos e outros componentes.

3. EQUIPAMENTO
Analisador de textura TA.XT Plus (Stable Micro Systems, UK)
Sonda cilíndrica de alumínio com base plana (P/35R, diâmetro 45 mm)

4. CONDIÇÕES DAS AMOSTRAS
Análises devem ser realizadas em:
• Amostras cruas
• Amostras assadas (10 minutos a 180 °C)

5. PROCEDIMENTO EXPERIMENTAL — TPA

Parâmetros sugeridos:
• Velocidade pré-teste: 10 mm/s
• Velocidade de teste: 18 mm/s
• Velocidade pós-teste: 18 mm/s
• Força de disparo (trigger): 0,049 N
• Deformação: 80%

Procedimento:
1. Posicionar a amostra centralizada no equipamento.
2. Realizar dupla compressão (ciclo TPA).
3. Registrar parâmetros texturais.
4. Repetir para todas as amostras.

6. PARÂMETROS AVALIADOS (TPA)
• Dureza (Hardness)
• Coesividade (Cohesiveness)
• Elasticidade (Springiness)
• Gomosidade (Gumminess)
• Mastigabilidade (Chewiness)

7. PROCEDIMENTO PARA PERDA DE MASSA NO COZIMENTO
1. Pesar a amostra antes do cozimento (M₀).
2. Assar as amostras (~10 minutos a 180 °C).
3. Resfriar até temperatura ambiente (~25 °C).
4. Remover excesso de líquido com papel absorvente.
5. Pesar novamente a amostra (Ma).

Cálculo:
    CL (%) = ((M₀ - Ma) / M₀) × 100

Onde M₀ = massa inicial (g) e Ma = massa após cozimento (g).

8. INTERPRETAÇÃO DOS RESULTADOS

TPA — refletem a integridade estrutural da matriz:
• Alta dureza → estrutura mais rígida
• Alta coesividade → maior integridade interna
• Alta elasticidade → maior recuperação após deformação
• Alta mastigabilidade → maior energia para mastigação

Formulações com bom desempenho estrutural apresentam equilíbrio entre dureza e coesividade, sem comportamento excessivamente rígido ou frágil.

Cooking Loss — capacidade de retenção de água:
• CL elevado → baixa retenção, estrutura instável
• CL intermediário → retenção moderada
• CL baixo → alta estabilidade e retenção de água

Valores reduzidos de CL geralmente associados à maior interação entre proteínas e hidrocolóides.

9. REPETIÇÕES E TRATAMENTO ESTATÍSTICO
• TPA: mínimo de 5 repetições (quintuplicata)
• Cooking Loss: mínimo de 3 repetições
• Resultados expressos como média ± desvio padrão

10. OBSERVAÇÕES IMPORTANTES
• Padronizar tamanho e geometria das amostras
• Controlar temperatura antes da análise
• Evitar desidratação antes da pesagem final
• Garantir contato uniforme da sonda no TPA
• Manter consistência no tempo entre preparo e análise

11. REFERÊNCIA
Demircan, E., Aydar, E. F., Mertdinç, Z., Kasapoğlu, K. N., & Özçelik, B. (2023). 3D printable vegan plant-based meat analogue: Fortification with three different mushrooms, investigation of printability, and characterization. Food Research International, 173(Part 1). https://doi.org/10.1016/j.foodres.2023.113259`,
  },
  {
    id: 'sinerese',
    titulo: 'Sinérese (Congelamento-Descongelamento)',
    descricao: 'Avaliação da estabilidade estrutural após estresse térmico por ciclo de congelamento.',
    referencia: 'Xie et al., 2022',
    conteudo: `ANÁLISE DE SINÉRESE POR CICLO DE CONGELAMENTO-DESCONGELAMENTO
Versão: 1.0  |  Emissão: Abril/2026  |  Referência: Xie et al., 2022

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJETIVO
Avaliar a estabilidade estrutural e a capacidade de retenção de água de formulações alimentícias impressas em 3D submetidas a ciclos de congelamento e descongelamento, por meio da determinação da sinérese.

2. PRINCÍPIO DO MÉTODO
A sinérese corresponde à liberação de água da matriz alimentar após aplicação de estresses físicos, como congelamento e descongelamento. Está diretamente relacionada à integridade da rede estrutural formada por proteínas e hidrocolóides.

Durante o congelamento, a formação de cristais de gelo pode causar danos à estrutura do gel, promovendo separação de fases. Após o descongelamento, formulações menos estáveis apresentam maior liberação de água, refletindo menor capacidade de retenção hídrica.

3. GEOMETRIA DAS AMOSTRAS
Amostras impressas em forma de cilindros padronizados:
• Diâmetro: 20 mm
• Altura: 10 mm

A padronização geométrica é essencial para garantir comparabilidade entre formulações.

4. PROCEDIMENTO EXPERIMENTAL
1. Imprimir as amostras cilíndricas com dimensões padronizadas.
2. Pesar imediatamente após a impressão (W₀).
3. Submeter ao congelamento a -18 °C por 24 horas.
4. Transferir para ambiente a 25 °C e descongelar por 8 horas.
5. Após descongelamento, remover suavemente o excesso de líquido superficial (sem pressionar a amostra).
6. Pesar novamente as amostras (Wa).

Cálculo da sinérese:
    Syneresis (%) = ((W₀ - Wa) / W₀) × 100

Onde W₀ = massa após impressão (g) e Wa = massa após o ciclo de congelamento-descongelamento (g).

5. INTERPRETAÇÃO DOS RESULTADOS
A sinérese é um indicador direto da estabilidade da matriz alimentar frente ao estresse térmico:

• Sinérese elevada: alta liberação de água, estrutura instável, baixa interação entre componentes
• Sinérese intermediária: estabilidade moderada, estrutura parcialmente preservada
• Baixa sinérese: alta retenção de água, estrutura estável, boa interação entre proteínas e hidrocolóides

Formulações contendo hidrocolóides (mucilagem de ora-pro-nóbis, goma guar, goma xantana) tendem a apresentar menor sinérese devido à maior capacidade de retenção de água e formação de redes estruturais resistentes ao dano causado pelo gelo.

6. REPETIÇÕES E TRATAMENTO ESTATÍSTICO
• Mínimo de 3 repetições independentes por formulação
• Resultados expressos como média ± desvio padrão

7. OBSERVAÇÕES IMPORTANTES
• Padronizar o tempo entre impressão e pesagem inicial
• Evitar perda de umidade antes da primeira pesagem
• Não aplicar pressão ao remover o líquido após descongelamento
• Garantir controle rigoroso de temperatura durante congelamento e descongelamento
• Evitar variações no tamanho e geometria das amostras

8. REFERÊNCIA
Xie, F., Ren, X., Wu, H., Zhang, H., Wu, Y., Song, Z., & Ai, L. (2022). Pectins of different resources influence cold storage properties of corn starch gels: Structure-property relationships. Food Hydrocolloids, 124(Part A), 107287. https://doi.org/10.1016/j.foodhyd.2021.107287`,
  },
  {
    id: 'fidelidade_dimensional',
    titulo: 'Fidelidade Dimensional',
    descricao: 'Comparação da área medida vs. nominal por análise de imagem em estrutura quadrada padronizada.',
    referencia: 'Versão própria MIA',
    conteudo: `ANÁLISE DE FIDELIDADE DIMENSIONAL (%) EM IMPRESSÃO 3D DE ALIMENTOS
Versão: 1.0  |  Emissão: Abril/2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJETIVO
Avaliar a precisão geométrica de estruturas impressas em 3D, por meio da comparação entre as dimensões do modelo projetado (CAD) e do objeto impresso, utilizando a métrica de fidelidade dimensional.

2. PRINCÍPIO DO MÉTODO
A fidelidade dimensional representa o grau de correspondência entre a geometria planejada no modelo digital e a estrutura final impressa. Desvios podem ocorrer devido a propriedades reológicas da formulação, parâmetros de impressão e comportamento de extrusão.

A análise compara a área interna de uma estrutura geométrica padronizada com sua área nominal, permitindo quantificar a precisão do processo.

3. GEOMETRIA DO MODELO
Estrutura quadrada com:
• Dimensões externas: 22 × 22 mm
• Área interna de cada unidade quadrada: 22,56 mm²

A padronização permite comparação direta entre diferentes condições de impressão.

4. PARÂMETROS SUGERIDOS DE IMPRESSÃO
• Diâmetro do bico: 0,6 mm
• Velocidades de impressão: 2,5; 5,0; 10,0; 15,0 mm/s
• Vazão de extrusão: ajustada proporcionalmente à velocidade
• Demais parâmetros: padrão do software de fatiamento

5. PROCEDIMENTO EXPERIMENTAL
1. Desenvolver o modelo geométrico no software de fatiamento.
2. Configurar parâmetros de impressão.
3. Imprimir amostras nas diferentes velocidades estabelecidas.
4. Ajustar vazão de extrusão proporcional à velocidade.
5. Produzir amostras em triplicata para cada condição.
6. Capturar imagens sob condições padronizadas (iluminação, distância, enquadramento).

6. DETERMINAÇÃO DAS ÁREAS
Análise de imagem com software adequado (ex.: ImageJ), com calibração de escala.
• Área nominal (An): 22,56 mm²
• Área medida (Am): obtida da imagem da amostra impressa

7. CÁLCULO DA FIDELIDADE DIMENSIONAL
    Fidelidade Dimensional (%) = (Am / An) × 100

Onde Am = área medida da estrutura impressa (mm²) e An = área nominal do modelo (mm²).

8. INTERPRETAÇÃO DOS RESULTADOS
• Valores próximos de 100%: alta precisão dimensional
• Valores muito superiores a 100%: excesso de material (over-extrusion), possível baixa viscosidade ou alta vazão
• Valores muito inferiores a 100%: subextrusão ou colapso estrutural, possível alta viscosidade ou baixa vazão

A fidelidade dimensional está diretamente relacionada ao equilíbrio entre propriedades reológicas da formulação e parâmetros de processo, especialmente velocidade de impressão e vazão de extrusão.

9. REPETIÇÕES E TRATAMENTO ESTATÍSTICO
• 3 repetições independentes por condição experimental
• Resultados expressos como média ± desvio padrão

10. OBSERVAÇÕES IMPORTANTES
• Padronizar rigorosamente as condições de captura de imagem
• Garantir calibração correta da escala no software de análise
• Evitar deformações durante a remoção da amostra da base
• Controlar a consistência da extrusão durante a impressão
• Avaliar possíveis efeitos de espalhamento do material após deposição`,
  },
  {
    id: 'precisao_impressao',
    titulo: 'Precisão de Impressão + Altura Máxima',
    descricao: 'Acurácia dimensional de cubos e altura máxima de cilindros ocos antes do colapso.',
    referencia: 'Demircan et al., 2023; Cheng et al., 2024',
    conteudo: `ANÁLISE DE PRECISÃO DE IMPRESSÃO (%) E ALTURA MÁXIMA IMPRIMÍVEL
EM IMPRESSÃO 3D DE ALIMENTOS
Versão: 1.0  |  Emissão: Abril/2026  |  Referências: Demircan et al., 2023; Cheng et al., 2024

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OBJETIVO
Avaliar a precisão geométrica e a capacidade de construção em altura de formulações alimentícias impressas em 3D, por meio da análise da acurácia dimensional de estruturas cúbicas e da determinação da altura máxima imprimível.

2. PRINCÍPIO DO MÉTODO

Precisão de impressão:
Representa o grau de correspondência entre as dimensões planejadas no modelo digital e as dimensões reais da estrutura impressa. Considera desvios em altura e comprimento, refletindo a estabilidade do empilhamento de camadas e a qualidade da deposição do material.

Altura máxima imprimível:
Indica a capacidade da formulação em sustentar múltiplas camadas sem colapso estrutural, diretamente influenciada pelas propriedades reológicas e resistência mecânica do material após deposição. É feita uma impressão em formato de cilindro oco até que o objeto colapse.

3. GEOMETRIA DOS MODELOS

Modelo cúbico (precisão de impressão):
• Dimensões: 15 × 15 × 15 mm
• Número de camadas: 13
• Densidade de impressão: 70%

Modelo cilíndrico (altura máxima):
• Diâmetro: 28 mm
• Estrutura oca

4. PARÂMETROS SUGERIDOS DE IMPRESSÃO
• Diâmetro do bico: 1,2 mm
• Velocidade de impressão: 2,5 mm/s
• Velocidade de retração: 2,5 mm/s
• Densidade de preenchimento: 70%

5. CÁLCULO DA PRECISÃO DE IMPRESSÃO

    PA (%) = (1/3) × {[1 - |h₁ - h₂|/h₂] + [1 - |h₃ - h₂|/h₂] + [1 - |l₁ - l₂|/l₂]} × 100

Dimensões obtidas por análise de imagem:
• l₁ = comprimento da base
• h₁ = altura da borda
• h₃ = altura do centro

Valores de referência do modelo:
• h₂ = altura nominal (15 mm)
• l₂ = comprimento nominal (15 mm)

6. INTERPRETAÇÃO DOS RESULTADOS

Precisão de Impressão (PA):
• PA% próxima de 100%: alta fidelidade dimensional, impressão precisa e estável
• PA% baixa: desvios geométricos com possível colapso parcial, sobre-extrusão ou inconsistência de deposição

Diretamente associada à capacidade de empilhamento das camadas e ao equilíbrio entre viscosidade, tensão de escoamento e parâmetros de processo.

Altura Máxima Imprimível:
• Maior número de camadas: melhor capacidade de sustentação estrutural, alta resistência ao colapso
• Menor número de camadas: estrutura instável, baixa capacidade de suporte vertical

Complementa a análise de printabilidade, especialmente em estruturas tridimensionais complexas.

7. REPETIÇÕES E TRATAMENTO ESTATÍSTICO
• Precisão de impressão: mínimo 3 repetições
• Altura máxima imprimível: 5 repetições
• Resultados expressos como média ± desvio padrão

8. OBSERVAÇÕES IMPORTANTES
• Padronizar as condições de captura de imagem
• Garantir calibração da escala no software de análise
• Evitar deformações durante a remoção das amostras
• Monitorar a estabilidade da extrusão durante toda a impressão
• Avaliar visualmente o início do colapso estrutural na análise de altura

9. REFERÊNCIAS
Cheng, Y., Chen, Y., Gao, W., Kang, X., Sui, J., Yu, B., Guo, L., Zhao, L., Yuan, C., & Cui, B. (2024). Investigation of the mechanism of gelatin to enhance 3D printing accuracy of corn starch gel: From perspective of phase morphological changes. International Journal of Biological Macromolecules, 254, 127323. https://doi.org/10.1016/j.ijbiomac.2023.127323

Demircan, E., Aydar, E. F., Mertdinç, Z., Kasapoğlu, K. N., & Özçelik, B. (2023). 3D printable vegan plant-based meat analogue: Fortification with three different mushrooms, investigation of printability, and characterization. Food Research International, 173(Part 1). https://doi.org/10.1016/j.foodres.2023.113259`,
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

  function baixarProtocoloCaracterizacao(p: typeof PROTOCOLOS_CARACTERIZACAO[number]) {
    setBaixando(p.id)
    downloadTxt(p.conteudo, `protocolo_${p.id}_mia.txt`)
    setTimeout(() => setBaixando(null), 500)
  }

  function baixarTodosProtocolos() {
    setBaixando('all')
    const conteudo = PROTOCOLOS_CARACTERIZACAO.map(p =>
      `${'═'.repeat(80)}\n${p.titulo.toUpperCase()}\n${'═'.repeat(80)}\n\n${p.conteudo}\n\n`
    ).join('\n')
    downloadTxt(conteudo, 'protocolos_caracterizacao_completo_mia.txt')
    setTimeout(() => setBaixando(null), 500)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Protocolos</h1>
        <p className="text-sm text-[#58413c] mt-1">
          Baixe protocolos metodológicos e documentos por formulação.
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-8 mb-6">

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
                desc: 'Procedimento Operacional Padrão para replicação do processo.',
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Microscope size={15} className="text-[#003223]" />
              <h2 className="text-sm font-semibold">Protocolos de caracterização</h2>
            </div>
            <button
              onClick={baixarTodosProtocolos}
              disabled={baixando === 'all'}
              className="flex items-center gap-1.5 text-xs bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <Download size={11} />
              {baixando === 'all' ? '...' : 'Baixar todos'}
            </button>
          </div>
          <p className="text-xs text-[#58413c] mb-4">
            Cinco protocolos validados por literatura científica. Baixe individualmente ou todos em um único arquivo.
          </p>

          <div className="space-y-2">
            {PROTOCOLOS_CARACTERIZACAO.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-tonal p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <FileDown size={15} className="text-[#58413c] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.titulo}</p>
                      <p className="text-xs text-[#58413c] leading-relaxed mt-0.5">{p.descricao}</p>
                      <p className="text-[10px] text-[#707974] mt-1.5 italic">Ref.: {p.referencia}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => baixarProtocoloCaracterizacao(p)}
                    disabled={baixando === p.id}
                    className="flex items-center gap-1.5 flex-shrink-0 text-xs bg-[#fff8f1] border border-[#e5d9c1] hover:border-[#003223]/30 hover:text-[#003223] text-[#58413c] px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Download size={11} />
                    {baixando === p.id ? '...' : 'Baixar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
