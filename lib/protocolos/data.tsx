import React from 'react'

export interface Secao { titulo: string; conteudo: string | string[] }
export interface Referencia { autores: string; ano: number; titulo: string; revista: string; doi?: string }
export interface Formula { label: string; expr: string }

export interface Protocolo {
  id: string
  titulo: string
  descricao: string
  versao: string
  emissao: string
  diagrama: React.ReactNode
  secoes: Secao[]
  formulas: Formula[]
  referencias: Referencia[]
}

// ─── DIAGRAMAS SVG (web) ────────────────────────────────────────────

export function DiagramaColapso() {
  return (
    <svg viewBox="0 0 320 130" className="w-full max-w-md">
      <rect x="0" y="105" width="320" height="20" fill="#fff2da" />
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 30 + i * (i + 1) * 4 + i * 30
        return <rect key={i} x={x} y="50" width="14" height="55" fill="#003223" />
      })}
      <path
        d="M 30 50 Q 60 56 90 50 Q 130 64 168 50 Q 215 78 250 50 Q 290 95 320 50"
        stroke="#c8ee4f" strokeWidth="3.5" fill="none"
      />
      {['1', '2', '3', '4', '5', '6'].map((mm, i) => {
        const x = 30 + i * (i + 1) * 4 + i * 30 + 18
        return <text key={i} x={x} y="125" fontSize="9" fill="#58413c" textAnchor="middle">{mm}mm</text>
      })}
    </svg>
  )
}

export function DiagramaTPA() {
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs">
      <rect x="100" y="10" width="40" height="35" fill="#003223" rx="2" />
      <line x1="120" y1="45" x2="120" y2="58" stroke="#003223" strokeWidth="2" strokeDasharray="3,3" />
      <text x="155" y="32" fontSize="9" fill="#58413c">Sonda P/35R</text>
      <text x="155" y="44" fontSize="8" fill="#707974">∅ 45 mm</text>
      <ellipse cx="120" cy="80" rx="60" ry="8" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="60" y="80" width="120" height="35" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="120" cy="115" rx="60" ry="8" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <path d="M 120 56 L 120 75 M 116 70 L 120 75 L 124 70" stroke="#c8ee4f" strokeWidth="2" fill="none" />
      <text x="10" y="100" fontSize="9" fill="#58413c">Deformação</text>
      <text x="10" y="112" fontSize="9" fill="#58413c">80%</text>
    </svg>
  )
}

export function DiagramaSinerese() {
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs">
      <ellipse cx="80" cy="40" rx="35" ry="6" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="45" y="40" width="70" height="60" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="80" cy="100" rx="35" ry="6" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <text x="50" y="125" fontSize="9" fill="#58413c">∅ 20 × 10 mm</text>
      <path d="M 130 70 L 165 70 M 160 66 L 165 70 L 160 74" stroke="#003223" strokeWidth="1.5" fill="none" />
      <text x="135" y="65" fontSize="8" fill="#003223">-18°C / 24h</text>
      <text x="135" y="80" fontSize="8" fill="#003223">25°C / 8h</text>
      <ellipse cx="200" cy="42" rx="30" ry="5" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="170" y="42" width="60" height="55" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="200" cy="97" rx="30" ry="5" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <circle cx="216" cy="108" r="4" fill="#516600" opacity="0.6" />
      <circle cx="206" cy="113" r="3" fill="#516600" opacity="0.5" />
    </svg>
  )
}

export function DiagramaFidelidade() {
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-xs">
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="#003223" strokeWidth="2" />
      {[0, 1, 2].map(r => [0, 1, 2].map(c => (
        <rect
          key={`${r}-${c}`}
          x={30 + c * 50} y={30 + r * 50} width="40" height="40"
          fill="#fff2da" stroke="#58413c" strokeWidth="0.7"
        />
      )))}
      <text x="100" y="195" fontSize="10" fill="#58413c" textAnchor="middle">22 × 22 mm</text>
      <text x="100" y="14" fontSize="9" fill="#707974" textAnchor="middle">unidade interna ≈ 22,56 mm²</text>
    </svg>
  )
}

export function DiagramaPrecisao() {
  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-md">
      <g>
        <polygon points="30,30 100,30 100,100 30,100" fill="#fff8f1" stroke="#003223" strokeWidth="1.5" />
        <polygon points="30,30 50,15 120,15 100,30" fill="#fff2da" stroke="#003223" strokeWidth="1.5" />
        <polygon points="100,30 120,15 120,85 100,100" fill="#f9edd4" stroke="#003223" strokeWidth="1.5" />
        <text x="65" y="120" fontSize="9" fill="#58413c" textAnchor="middle">Cubo 15×15×15 mm</text>
        <text x="65" y="132" fontSize="8" fill="#707974" textAnchor="middle">precisão (PA)</text>
      </g>
      <g>
        <ellipse cx="240" cy="30" rx="40" ry="7" fill="#fff2da" stroke="#003223" strokeWidth="1.5" />
        <line x1="200" y1="30" x2="200" y2="100" stroke="#003223" strokeWidth="1.5" />
        <line x1="280" y1="30" x2="280" y2="100" stroke="#003223" strokeWidth="1.5" />
        <ellipse cx="240" cy="100" rx="40" ry="7" fill="#fff8f1" stroke="#003223" strokeWidth="1.5" />
        <ellipse cx="240" cy="30" rx="30" ry="5" fill="#fff8f1" stroke="#58413c" strokeWidth="0.7" />
        <text x="240" y="120" fontSize="9" fill="#58413c" textAnchor="middle">Cilindro oco ∅ 28 mm</text>
        <text x="240" y="132" fontSize="8" fill="#707974" textAnchor="middle">altura máxima</text>
      </g>
    </svg>
  )
}

// ─── DADOS ──────────────────────────────────────────────────────────

export const PROTOCOLOS: Protocolo[] = [
  {
    id: 'colapso_filamento',
    titulo: 'Teste de Colapso de Filamento',
    descricao: 'Avaliação de sustentação estrutural por análise de pontes sobre vãos de 1 a 6 mm.',
    versao: '1.0',
    emissao: 'Abril/2026',
    diagrama: <DiagramaColapso />,
    secoes: [
      { titulo: 'Objetivo', conteudo: 'Avaliar a capacidade de sustentação e estabilidade estrutural de formulações alimentícias para impressão 3D, por meio da análise do comportamento de um filamento extrudado sobre vãos livres.' },
      { titulo: 'Princípio do método', conteudo: 'O teste consiste na deposição de um único filamento sobre uma plataforma contendo pilares com diferentes espaçamentos. O material forma pontes suspensas, permitindo avaliar sua capacidade de resistir à deformação gravitacional. A deflexão do filamento está diretamente relacionada a propriedades reológicas como tensão de escoamento, coesão estrutural e recuperação tixotrópica.' },
      { titulo: 'Geometria da ponte de colapso', conteudo: 'Plataforma com 6 pilares paralelos de altura uniforme, separados por vãos de distâncias crescentes (1, 2, 3, 4, 5 e 6 mm). A geometria padronizada garante reprodutibilidade do ensaio e permite comparação direta entre formulações.' },
      { titulo: 'Procedimento experimental', conteudo: [
        'Carregar a formulação na impressora.',
        'Posicionar a plataforma de teste na mesa de impressão.',
        'Ajustar parâmetros de impressão (velocidade de extrusão, temperatura, diâmetro do bico, altura de camada).',
        'Extrudar um único filamento sobre os pilares, formando pontes sobre os vãos.',
        'Garantir que o filamento atravesse todos os espaçamentos em uma única deposição contínua.',
        'Registrar imagens imediatamente após a impressão, evitando influência do tempo na deformação.',
      ]},
      { titulo: 'Análise dos resultados', conteudo: 'Determinação das áreas via ImageJ/Fiji com escala calibrada. At = área teórica (linha reta entre pilares). Ar = área real ocupada pelo filamento, incluindo curvatura do colapso. Calcular individualmente para cada vão e cada replicata. Registrar média e desvio padrão.' },
      { titulo: 'Interpretação dos resultados', conteudo: [
        'Cf próximo a 0%: colapso total — material muito fluido, baixa viscosidade.',
        'Cf entre 20% e 70%: sustentação parcial — pode exigir ajuste na formulação.',
        'Cf > 70%: ponte estável — ideal para impressão 3D.',
        'Cf elevado → maior tensão de escoamento e melhor recuperação tixotrópica.',
        'Cf reduzido → reformular com hidrocolóides, amidos ou proteínas.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'Mínimo 3 repetições independentes por formulação, mesmos parâmetros de impressão. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Garantir consistência na extrusão (evitar pulsação).',
        'Controlar a temperatura ambiente durante o teste.',
        'Padronizar o tempo entre impressão e captura de imagem.',
        'Evitar vibrações na mesa durante o procedimento.',
      ]},
    ],
    formulas: [{ label: 'Fator de Colapso', expr: 'Cf (%) = (At / Ar) × 100' }],
    referencias: [
      { autores: 'Sviech, F., Silva, M. F., Goldbeck, R., Andreola, K., & Prata, A. S.', ano: 2025, titulo: 'Rheology and prebiotic activity of Ora-pro-Nobis for the development of functional ingredients by 3D food printing', revista: 'Food Bioscience, 72, 107519', doi: '10.1016/j.fbio.2025.107519' },
    ],
  },
  {
    id: 'tpa_cooking_loss',
    titulo: 'TPA + Perda de Massa no Cozimento',
    descricao: 'Análise de Perfil de Textura por dupla compressão e perda de massa após cozimento.',
    versao: '1.0',
    emissao: 'Abril/2026',
    diagrama: <DiagramaTPA />,
    secoes: [
      { titulo: 'Objetivo', conteudo: 'Avaliar as propriedades texturais e a estabilidade estrutural de formulações alimentícias impressas em 3D, por meio da Análise de Perfil de Textura (TPA) e da determinação da perda de massa durante o cozimento.' },
      { titulo: 'Princípio — TPA', conteudo: 'A TPA simula mecanicamente o processo de mastigação, permitindo obter parâmetros como dureza, coesividade, elasticidade, gomosidade e mastigabilidade. Esses parâmetros estão diretamente relacionados à estrutura interna do material e sua aceitabilidade sensorial.' },
      { titulo: 'Princípio — Cooking Loss', conteudo: 'Avalia a capacidade da matriz alimentar em reter água e outros constituintes durante o tratamento térmico. A liberação de líquidos está associada à estabilidade da rede estrutural formada por proteínas, polissacarídeos e outros componentes.' },
      { titulo: 'Equipamento', conteudo: 'Analisador de textura TA.XT Plus (Stable Micro Systems, UK). Sonda cilíndrica de alumínio com base plana (P/35R, diâmetro 45 mm).' },
      { titulo: 'Condições das amostras', conteudo: ['Amostras cruas.', 'Amostras assadas (10 minutos a 180 °C).'] },
      { titulo: 'Parâmetros TPA sugeridos', conteudo: [
        'Velocidade pré-teste: 10 mm/s',
        'Velocidade de teste: 18 mm/s',
        'Velocidade pós-teste: 18 mm/s',
        'Força de disparo (trigger): 0,049 N',
        'Deformação: 80%',
      ]},
      { titulo: 'Parâmetros avaliados (TPA)', conteudo: [
        'Dureza (Hardness)',
        'Coesividade (Cohesiveness)',
        'Elasticidade (Springiness)',
        'Gomosidade (Gumminess)',
        'Mastigabilidade (Chewiness)',
      ]},
      { titulo: 'Procedimento — Cooking Loss', conteudo: [
        'Pesar a amostra antes do cozimento (M₀).',
        'Assar (~10 minutos a 180 °C).',
        'Resfriar até temperatura ambiente (~25 °C).',
        'Remover excesso de líquido com papel absorvente.',
        'Pesar novamente (Ma).',
      ]},
      { titulo: 'Interpretação — TPA', conteudo: [
        'Alta dureza → estrutura mais rígida.',
        'Alta coesividade → maior integridade interna.',
        'Alta elasticidade → maior recuperação após deformação.',
        'Alta mastigabilidade → maior energia para mastigação.',
        'Bom desempenho: equilíbrio entre dureza e coesividade.',
      ]},
      { titulo: 'Interpretação — Cooking Loss', conteudo: [
        'CL elevado → baixa retenção, estrutura instável.',
        'CL intermediário → retenção moderada.',
        'CL baixo → alta estabilidade e retenção de água.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'TPA: mínimo 5 repetições. Cooking Loss: mínimo 3 repetições. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar tamanho e geometria das amostras.',
        'Controlar temperatura antes da análise.',
        'Evitar desidratação antes da pesagem final.',
        'Garantir contato uniforme da sonda no TPA.',
      ]},
    ],
    formulas: [
      { label: 'Coesividade', expr: 'Coes = Área₂ / Área₁' },
      { label: 'Elasticidade', expr: 'Elast = D₂ / D₁' },
      { label: 'Gomosidade', expr: 'Gom = Dureza × Coes' },
      { label: 'Mastigabilidade', expr: 'Mast = Gom × Elast' },
      { label: 'Cooking Loss', expr: 'CL (%) = ((M₀ - Ma) / M₀) × 100' },
    ],
    referencias: [
      { autores: 'Demircan, E., Aydar, E. F., Mertdinç, Z., Kasapoğlu, K. N., & Özçelik, B.', ano: 2023, titulo: '3D printable vegan plant-based meat analogue: Fortification with three different mushrooms, investigation of printability, and characterization', revista: 'Food Research International, 173(Part 1)', doi: '10.1016/j.foodres.2023.113259' },
    ],
  },
  {
    id: 'sinerese',
    titulo: 'Sinérese (Congelamento-Descongelamento)',
    descricao: 'Avaliação da estabilidade estrutural após estresse térmico por ciclo de congelamento.',
    versao: '1.0',
    emissao: 'Abril/2026',
    diagrama: <DiagramaSinerese />,
    secoes: [
      { titulo: 'Objetivo', conteudo: 'Avaliar a estabilidade estrutural e a capacidade de retenção de água de formulações alimentícias impressas em 3D submetidas a ciclos de congelamento e descongelamento, por meio da determinação da sinérese.' },
      { titulo: 'Princípio do método', conteudo: 'A sinérese corresponde à liberação de água da matriz alimentar após aplicação de estresses físicos. Durante o congelamento, a formação de cristais de gelo pode causar danos à estrutura do gel, promovendo separação de fases. Após o descongelamento, formulações menos estáveis apresentam maior liberação de água.' },
      { titulo: 'Geometria das amostras', conteudo: ['Diâmetro: 20 mm', 'Altura: 10 mm', 'Padronização essencial para garantir comparabilidade.'] },
      { titulo: 'Procedimento experimental', conteudo: [
        'Imprimir as amostras cilíndricas com dimensões padronizadas.',
        'Pesar imediatamente após a impressão (W₀).',
        'Submeter ao congelamento a -18 °C por 24 horas.',
        'Transferir para ambiente a 25 °C e descongelar por 8 horas.',
        'Após descongelamento, remover suavemente o excesso de líquido superficial (sem pressionar).',
        'Pesar novamente as amostras (Wa).',
      ]},
      { titulo: 'Interpretação dos resultados', conteudo: [
        'Sinérese elevada: alta liberação de água, estrutura instável, baixa interação entre componentes.',
        'Sinérese intermediária: estabilidade moderada.',
        'Baixa sinérese: alta retenção de água, estrutura estável.',
        'Hidrocolóides (mucilagem de ora-pro-nóbis, goma guar e xantana) tendem a apresentar menor sinérese.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'Mínimo 3 repetições independentes por formulação. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar o tempo entre impressão e pesagem inicial.',
        'Evitar perda de umidade antes da primeira pesagem.',
        'Não aplicar pressão ao remover o líquido após descongelamento.',
        'Garantir controle rigoroso de temperatura.',
      ]},
    ],
    formulas: [{ label: 'Sinérese', expr: 'Syneresis (%) = ((W₀ - Wa) / W₀) × 100' }],
    referencias: [
      { autores: 'Xie, F., Ren, X., Wu, H., Zhang, H., Wu, Y., Song, Z., & Ai, L.', ano: 2022, titulo: 'Pectins of different resources influence cold storage properties of corn starch gels: Structure-property relationships', revista: 'Food Hydrocolloids, 124(Part A), 107287', doi: '10.1016/j.foodhyd.2021.107287' },
    ],
  },
  {
    id: 'fidelidade_dimensional',
    titulo: 'Fidelidade Dimensional',
    descricao: 'Comparação da área medida vs. nominal por análise de imagem em estrutura quadrada padronizada.',
    versao: '1.0',
    emissao: 'Abril/2026',
    diagrama: <DiagramaFidelidade />,
    secoes: [
      { titulo: 'Objetivo', conteudo: 'Avaliar a precisão geométrica de estruturas impressas em 3D, por meio da comparação entre as dimensões do modelo projetado (CAD) e do objeto impresso, utilizando a métrica de fidelidade dimensional.' },
      { titulo: 'Princípio do método', conteudo: 'A fidelidade dimensional representa o grau de correspondência entre a geometria planejada no modelo digital e a estrutura final impressa. Desvios podem ocorrer devido a propriedades reológicas da formulação, parâmetros de impressão e comportamento de extrusão.' },
      { titulo: 'Geometria do modelo', conteudo: ['Dimensões externas: 22 × 22 mm', 'Área interna de cada unidade quadrada: 22,56 mm²', 'Padronização permite comparação direta entre condições.'] },
      { titulo: 'Parâmetros sugeridos de impressão', conteudo: [
        'Diâmetro do bico: 0,6 mm',
        'Velocidades testadas: 2,5; 5,0; 10,0; 15,0 mm/s',
        'Vazão de extrusão: ajustada proporcionalmente à velocidade',
        'Demais parâmetros: padrão do software de fatiamento',
      ]},
      { titulo: 'Procedimento experimental', conteudo: [
        'Desenvolver o modelo geométrico no software de fatiamento.',
        'Configurar parâmetros de impressão.',
        'Imprimir amostras nas diferentes velocidades estabelecidas.',
        'Ajustar vazão proporcional à velocidade.',
        'Produzir amostras em triplicata para cada condição.',
        'Capturar imagens sob condições padronizadas.',
      ]},
      { titulo: 'Interpretação dos resultados', conteudo: [
        'Próximo de 100%: alta precisão dimensional.',
        'Muito superior a 100%: over-extrusion (excesso de material), baixa viscosidade ou alta vazão.',
        'Muito inferior a 100%: subextrusão ou colapso, alta viscosidade ou baixa vazão.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: '3 repetições independentes por condição. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar rigorosamente a captura de imagem.',
        'Garantir calibração da escala no software de análise.',
        'Evitar deformações durante a remoção da base.',
        'Controlar a consistência da extrusão.',
      ]},
    ],
    formulas: [{ label: 'Fidelidade Dimensional', expr: 'FD (%) = (Am / An) × 100' }],
    referencias: [],
  },
  {
    id: 'precisao_impressao',
    titulo: 'Precisão de Impressão + Altura Máxima',
    descricao: 'Acurácia dimensional de cubos e altura máxima de cilindros ocos antes do colapso.',
    versao: '1.0',
    emissao: 'Abril/2026',
    diagrama: <DiagramaPrecisao />,
    secoes: [
      { titulo: 'Objetivo', conteudo: 'Avaliar a precisão geométrica e a capacidade de construção em altura de formulações alimentícias impressas em 3D.' },
      { titulo: 'Princípio — Precisão', conteudo: 'Representa o grau de correspondência entre as dimensões planejadas no modelo digital e as dimensões reais da estrutura impressa. Considera desvios em altura e comprimento.' },
      { titulo: 'Princípio — Altura Máxima', conteudo: 'Indica a capacidade da formulação em sustentar múltiplas camadas sem colapso estrutural. É feita uma impressão em formato de cilindro oco até que o objeto colapse.' },
      { titulo: 'Geometria — cubo (precisão)', conteudo: ['Dimensões: 15 × 15 × 15 mm', 'Número de camadas: 13', 'Densidade de impressão: 70%'] },
      { titulo: 'Geometria — cilindro (altura máxima)', conteudo: ['Diâmetro: 28 mm', 'Estrutura oca'] },
      { titulo: 'Parâmetros sugeridos de impressão', conteudo: [
        'Diâmetro do bico: 1,2 mm',
        'Velocidade de impressão: 2,5 mm/s',
        'Velocidade de retração: 2,5 mm/s',
        'Densidade de preenchimento: 70%',
      ]},
      { titulo: 'Dimensões medidas (análise de imagem)', conteudo: [
        'l₁: comprimento da base',
        'h₁: altura da borda',
        'h₃: altura do centro',
        'h₂: altura nominal (referência)',
        'l₂: comprimento nominal (referência)',
      ]},
      { titulo: 'Interpretação — Precisão (PA)', conteudo: [
        'PA% próxima de 100%: alta fidelidade dimensional.',
        'PA% baixa: desvios geométricos com possível colapso parcial, sobre-extrusão ou inconsistência.',
      ]},
      { titulo: 'Interpretação — Altura Máxima', conteudo: [
        'Maior número de camadas: melhor sustentação estrutural.',
        'Menor número de camadas: estrutura instável.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'Precisão: mínimo 3 repetições. Altura máxima: 5 repetições.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar as condições de captura de imagem.',
        'Garantir calibração da escala no software.',
        'Evitar deformações durante a remoção das amostras.',
        'Monitorar a estabilidade da extrusão.',
      ]},
    ],
    formulas: [
      { label: 'Precisão de Impressão (PA)', expr: 'PA (%) = (1/3) × { [1 - |h₁-h₂|/h₂] + [1 - |h₃-h₂|/h₂] + [1 - |l₁-l₂|/l₂] } × 100' },
    ],
    referencias: [
      { autores: 'Cheng, Y., Chen, Y., Gao, W., Kang, X., Sui, J., Yu, B., Guo, L., Zhao, L., Yuan, C., & Cui, B.', ano: 2024, titulo: 'Investigation of the mechanism of gelatin to enhance 3D printing accuracy of corn starch gel: From perspective of phase morphological changes', revista: 'International Journal of Biological Macromolecules, 254, 127323', doi: '10.1016/j.ijbiomac.2023.127323' },
      { autores: 'Demircan, E., Aydar, E. F., Mertdinç, Z., Kasapoğlu, K. N., & Özçelik, B.', ano: 2023, titulo: '3D printable vegan plant-based meat analogue: Fortification with three different mushrooms, investigation of printability, and characterization', revista: 'Food Research International, 173(Part 1)', doi: '10.1016/j.foodres.2023.113259' },
    ],
  },
]

export function getProtocolo(id: string): Protocolo | undefined {
  return PROTOCOLOS.find(p => p.id === id)
}
