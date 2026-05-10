'use client'
import { useEffect, useState } from 'react'
import { Download, FileText, FlaskConical, Microscope, BookOpen, ChevronDown, ExternalLink } from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
  ingredientes: Array<{ nome: string; percentual: number; funcao: string }>
  observacoes: string
  created_at: string
}

interface Secao { titulo: string; conteudo: string | string[] }
interface Referencia { autores: string; ano: number; titulo: string; revista: string; doi?: string }
interface Protocolo {
  id: string
  titulo: string
  descricao: string
  versao: string
  emissao: string
  diagrama: React.ReactNode
  secoes: Secao[]
  formulas: { label: string; expr: string }[]
  referencias: Referencia[]
}

// ─── DIAGRAMAS SVG ──────────────────────────────────────────────────

function DiagramaColapso() {
  return (
    <svg viewBox="0 0 320 130" className="w-full max-w-md">
      <rect x="0" y="105" width="320" height="20" fill="#fff2da" />
      {/* 6 pilares */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 30 + i * (i + 1) * 4 + i * 30
        return <rect key={i} x={x} y="50" width="14" height="55" fill="#003223" />
      })}
      {/* Filamento curvo (pontes com colapso crescente) */}
      <path
        d="M 30 50 Q 60 56 90 50 Q 130 64 168 50 Q 215 78 250 50 Q 290 95 320 50"
        stroke="#c8ee4f" strokeWidth="3.5" fill="none"
      />
      {/* Labels de vão */}
      {['1','2','3','4','5','6'].map((mm, i) => {
        const x = 30 + i * (i + 1) * 4 + i * 30 + 18
        return (
          <text key={i} x={x} y="125" fontSize="9" fill="#58413c" textAnchor="middle">
            {mm}mm
          </text>
        )
      })}
    </svg>
  )
}

function DiagramaTPA() {
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs">
      {/* Sonda cilíndrica */}
      <rect x="100" y="10" width="40" height="35" fill="#003223" rx="2" />
      <line x1="120" y1="45" x2="120" y2="58" stroke="#003223" strokeWidth="2" strokeDasharray="3,3" />
      <text x="155" y="32" fontSize="9" fill="#58413c">Sonda P/35R</text>
      <text x="155" y="44" fontSize="8" fill="#707974">∅ 45 mm</text>
      {/* Amostra cilíndrica */}
      <ellipse cx="120" cy="80" rx="60" ry="8" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="60" y="80" width="120" height="35" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="120" cy="115" rx="60" ry="8" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      {/* Setas de compressão */}
      <path d="M 120 56 L 120 75 M 116 70 L 120 75 L 124 70" stroke="#c8ee4f" strokeWidth="2" fill="none" />
      <text x="10" y="100" fontSize="9" fill="#58413c">Deformação</text>
      <text x="10" y="112" fontSize="9" fill="#58413c">80%</text>
    </svg>
  )
}

function DiagramaSinerese() {
  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-xs">
      {/* Cilindro impresso */}
      <ellipse cx="80" cy="40" rx="35" ry="6" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="45" y="40" width="70" height="60" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="80" cy="100" rx="35" ry="6" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <text x="50" y="125" fontSize="9" fill="#58413c">∅ 20 × 10 mm</text>
      {/* Setas de processo */}
      <path d="M 130 70 L 165 70 M 160 66 L 165 70 L 160 74" stroke="#003223" strokeWidth="1.5" fill="none" />
      <text x="135" y="65" fontSize="8" fill="#003223">-18°C / 24h</text>
      <text x="135" y="80" fontSize="8" fill="#003223">25°C / 8h</text>
      {/* Cilindro pós ciclo + gota */}
      <ellipse cx="200" cy="42" rx="30" ry="5" fill="#fff2da" stroke="#58413c" strokeWidth="1" />
      <rect x="170" y="42" width="60" height="55" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <ellipse cx="200" cy="97" rx="30" ry="5" fill="#fff8f1" stroke="#58413c" strokeWidth="1" />
      <circle cx="216" cy="108" r="4" fill="#516600" opacity="0.6" />
      <circle cx="206" cy="113" r="3" fill="#516600" opacity="0.5" />
    </svg>
  )
}

function DiagramaFidelidade() {
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-xs">
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="#003223" strokeWidth="2" />
      {/* Grid interno (unidades de 22.56mm²) */}
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

function DiagramaPrecisao() {
  return (
    <svg viewBox="0 0 320 160" className="w-full max-w-md">
      {/* Cubo (precisão) */}
      <g>
        <polygon points="30,30 100,30 100,100 30,100" fill="#fff8f1" stroke="#003223" strokeWidth="1.5" />
        <polygon points="30,30 50,15 120,15 100,30" fill="#fff2da" stroke="#003223" strokeWidth="1.5" />
        <polygon points="100,30 120,15 120,85 100,100" fill="#f9edd4" stroke="#003223" strokeWidth="1.5" />
        <text x="65" y="120" fontSize="9" fill="#58413c" textAnchor="middle">Cubo 15×15×15 mm</text>
        <text x="65" y="132" fontSize="8" fill="#707974" textAnchor="middle">precisão (PA)</text>
      </g>
      {/* Cilindro oco (altura máxima) */}
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

// ─── PROTOCOLOS ─────────────────────────────────────────────────────

const PROTOCOLOS: Protocolo[] = [
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
    formulas: [
      { label: 'Fator de Colapso', expr: 'Cf (%) = (At / Ar) × 100' },
    ],
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
        'Bom desempenho: equilíbrio entre dureza e coesividade, sem rigidez excessiva.',
      ]},
      { titulo: 'Interpretação — Cooking Loss', conteudo: [
        'CL elevado → baixa retenção, estrutura instável.',
        'CL intermediário → retenção moderada.',
        'CL baixo → alta estabilidade e retenção de água.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'TPA: mínimo 5 repetições (quintuplicata). Cooking Loss: mínimo 3 repetições. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar tamanho e geometria das amostras.',
        'Controlar temperatura antes da análise.',
        'Evitar desidratação antes da pesagem final.',
        'Garantir contato uniforme da sonda no TPA.',
        'Manter consistência no tempo entre preparo e análise.',
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
      { titulo: 'Princípio do método', conteudo: 'A sinérese corresponde à liberação de água da matriz alimentar após aplicação de estresses físicos. Durante o congelamento, a formação de cristais de gelo pode causar danos à estrutura do gel, promovendo separação de fases. Após o descongelamento, formulações menos estáveis apresentam maior liberação de água, refletindo menor capacidade de retenção hídrica.' },
      { titulo: 'Geometria das amostras', conteudo: ['Diâmetro: 20 mm', 'Altura: 10 mm', 'Padronização essencial para garantir comparabilidade entre formulações.'] },
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
        'Sinérese intermediária: estabilidade moderada, estrutura parcialmente preservada.',
        'Baixa sinérese: alta retenção de água, estrutura estável, boa interação proteínas-hidrocolóides.',
        'Hidrocolóides como mucilagem de ora-pro-nóbis, goma guar e xantana tendem a apresentar menor sinérese.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'Mínimo 3 repetições independentes por formulação. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar o tempo entre impressão e pesagem inicial.',
        'Evitar perda de umidade antes da primeira pesagem.',
        'Não aplicar pressão ao remover o líquido após descongelamento.',
        'Garantir controle rigoroso de temperatura.',
        'Evitar variações no tamanho e geometria das amostras.',
      ]},
    ],
    formulas: [
      { label: 'Sinérese', expr: 'Syneresis (%) = ((W₀ - Wa) / W₀) × 100' },
    ],
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
        'Avaliar efeitos de espalhamento após deposição.',
      ]},
    ],
    formulas: [
      { label: 'Fidelidade Dimensional', expr: 'FD (%) = (Am / An) × 100' },
    ],
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
      { titulo: 'Objetivo', conteudo: 'Avaliar a precisão geométrica e a capacidade de construção em altura de formulações alimentícias impressas em 3D, por meio da análise da acurácia dimensional de estruturas cúbicas e da determinação da altura máxima imprimível.' },
      { titulo: 'Princípio — Precisão', conteudo: 'Representa o grau de correspondência entre as dimensões planejadas no modelo digital e as dimensões reais da estrutura impressa. Considera desvios em altura e comprimento, refletindo a estabilidade do empilhamento de camadas.' },
      { titulo: 'Princípio — Altura Máxima', conteudo: 'Indica a capacidade da formulação em sustentar múltiplas camadas sem colapso estrutural, diretamente influenciada pelas propriedades reológicas. É feita uma impressão em formato de cilindro oco até que o objeto colapse.' },
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
        'PA% próxima de 100%: alta fidelidade dimensional, impressão precisa e estável.',
        'PA% baixa: desvios geométricos com possível colapso parcial, sobre-extrusão ou inconsistência de deposição.',
      ]},
      { titulo: 'Interpretação — Altura Máxima', conteudo: [
        'Maior número de camadas: melhor sustentação estrutural, alta resistência ao colapso.',
        'Menor número de camadas: estrutura instável, baixa capacidade de suporte vertical.',
      ]},
      { titulo: 'Repetições e tratamento estatístico', conteudo: 'Precisão: mínimo 3 repetições. Altura máxima: 5 repetições. Resultados expressos como média ± desvio padrão.' },
      { titulo: 'Observações importantes', conteudo: [
        'Padronizar as condições de captura de imagem.',
        'Garantir calibração da escala no software de análise.',
        'Evitar deformações durante a remoção das amostras.',
        'Monitorar a estabilidade da extrusão.',
        'Avaliar visualmente o início do colapso na análise de altura.',
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

// ─── HELPERS ────────────────────────────────────────────────────────

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
INGREDIENTES (para 100 g)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${f.ingredientes?.map(i => `• ${i.nome}: ${i.percentual} g — ${i.funcao}`).join('\n') ?? 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREPARO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Pesar todos os ingredientes em balança analítica.
2. Hidratar hidrocolóides em água fria por 30 min.
3. Incorporar demais ingredientes conforme ordem de adição.
4. Homogeneizar (mixer ou agitação) por 5 min.
5. Verificar viscosidade antes de carregar na seringa.
6. Deixar descansar 15 min para eliminar bolhas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPRESSÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Carregar a seringa evitando incorporação de ar.
2. Purgar até material sair uniformemente.
3. Nivelar a plataforma de impressão.
4. Configurar parâmetros conforme indicado na aba Parâmetros.
5. Iniciar impressão e monitorar as primeiras camadas.
6. Registrar na aba Experimentos o resultado obtido.

Versão: 1.0  |  Data: ${new Date().toLocaleDateString('pt-BR')}`
}

function protocoloToText(p: Protocolo): string {
  const linhas: string[] = []
  linhas.push(p.titulo.toUpperCase())
  linhas.push(`Versão: ${p.versao}  |  Emissão: ${p.emissao}`)
  linhas.push('')
  linhas.push('━'.repeat(70))
  linhas.push('')
  for (const sec of p.secoes) {
    linhas.push(sec.titulo.toUpperCase())
    if (Array.isArray(sec.conteudo)) {
      for (const item of sec.conteudo) linhas.push('• ' + item)
    } else {
      linhas.push(sec.conteudo)
    }
    linhas.push('')
  }
  linhas.push('FÓRMULAS')
  for (const f of p.formulas) linhas.push(`${f.label}: ${f.expr}`)
  linhas.push('')
  if (p.referencias.length > 0) {
    linhas.push('REFERÊNCIAS')
    for (const r of p.referencias) {
      linhas.push(`${r.autores} (${r.ano}). ${r.titulo}. ${r.revista}.${r.doi ? ' https://doi.org/' + r.doi : ''}`)
    }
  }
  return linhas.join('\n')
}

// ─── COMPONENTES ────────────────────────────────────────────────────

function ProtocoloCard({ p, aberto, onToggle, onBaixar, baixando }: {
  p: Protocolo
  aberto: boolean
  onToggle: () => void
  onBaixar: () => void
  baixando: boolean
}) {
  return (
    <div className="bg-white rounded-2xl shadow-tonal overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-4">
        <button onClick={onToggle} className="flex items-start gap-3 min-w-0 flex-1 text-left">
          <ChevronDown size={15} className={`text-[#58413c] flex-shrink-0 mt-0.5 transition-transform ${aberto ? 'rotate-180' : ''}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{p.titulo}</p>
            <p className="text-xs text-[#58413c] leading-relaxed mt-0.5">{p.descricao}</p>
            {p.referencias.length > 0 && (
              <p className="text-[10px] text-[#707974] mt-1.5 italic">
                Ref.: {p.referencias.map(r => r.autores.split(',')[0] + ' et al., ' + r.ano).join(' · ')}
              </p>
            )}
          </div>
        </button>
        <button
          onClick={onBaixar}
          disabled={baixando}
          className="flex items-center gap-1.5 flex-shrink-0 text-xs bg-[#fff8f1] border border-[#e5d9c1] hover:border-[#003223]/30 hover:text-[#003223] text-[#58413c] px-3 py-1.5 rounded-md transition-colors"
          title="Baixar como TXT"
        >
          <Download size={11} />
          {baixando ? '...' : 'Baixar'}
        </button>
      </div>

      {aberto && (
        <div className="border-t border-[#e5d9c1] px-5 py-5 space-y-5 bg-[#fff8f1]/40">
          {/* Cabeçalho com versão */}
          <div className="flex items-center gap-3 flex-wrap text-[10px]">
            <span className="bg-[rgba(0,50,35,0.08)] text-[#003223] px-2 py-0.5 rounded-full">v{p.versao}</span>
            <span className="text-[#707974]">Emissão: {p.emissao}</span>
          </div>

          {/* Diagrama */}
          <div className="bg-white rounded-xl border border-[#e5d9c1] p-4 flex flex-col items-center">
            {p.diagrama}
            <p className="text-[10px] text-[#707974] mt-2 italic text-center">Figura: representação esquemática</p>
          </div>

          {/* Seções */}
          {p.secoes.map((sec, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-2">{sec.titulo}</h3>
              {Array.isArray(sec.conteudo) ? (
                <ul className="space-y-1">
                  {sec.conteudo.map((item, j) => (
                    <li key={j} className="text-xs text-[#58413c] leading-relaxed flex gap-2">
                      <span className="text-[#003223] flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#58413c] leading-relaxed">{sec.conteudo}</p>
              )}
            </div>
          ))}

          {/* Fórmulas */}
          {p.formulas.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-2">Fórmulas</h3>
              <div className="space-y-2">
                {p.formulas.map((f, i) => (
                  <div key={i} className="bg-white border border-[#e5d9c1] rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-[#707974] uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="text-sm text-[#003223] font-mono">{f.expr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referências */}
          {p.referencias.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-2">Referências</h3>
              <div className="space-y-2">
                {p.referencias.map((r, i) => (
                  <div key={i} className="text-xs text-[#58413c] leading-relaxed">
                    {r.autores} ({r.ano}). <span className="italic">{r.titulo}</span>. {r.revista}.{' '}
                    {r.doi && (
                      <a
                        href={`https://doi.org/${r.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[#003223] hover:underline"
                      >
                        DOI <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA ─────────────────────────────────────────────────────────

export default function ProtocolosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [formulacaoId, setFormulacaoId] = useState('')
  const [baixando, setBaixando] = useState<string | null>(null)
  const [aberto, setAberto] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
  }, [])

  function downloadTxt(conteudo: string, nome: string) {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = nome; a.click()
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
        a.href = url; a.download = `${tipo === 'ficha' ? 'ficha_tecnica' : 'pop'}_${form.nome.replace(/\s+/g, '_')}.pdf`; a.click()
        URL.revokeObjectURL(url)
      } else throw new Error('API indisponível')
    } catch {
      const conteudo = tipo === 'ficha' ? gerarFichaTecnica(form) : gerarPOP(form)
      downloadTxt(conteudo, `${tipo === 'ficha' ? 'ficha_tecnica' : 'pop'}_${form.nome.replace(/\s+/g, '_')}.txt`)
    }
    setBaixando(null)
  }

  function baixarProtocolo(p: Protocolo) {
    setBaixando(p.id)
    downloadTxt(protocoloToText(p), `protocolo_${p.id}_mia.txt`)
    setTimeout(() => setBaixando(null), 500)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Protocolos</h1>
        <p className="text-sm text-[#58413c] mt-1">
          Leia ou baixe protocolos metodológicos. Cada protocolo é validado por literatura científica.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-8 mb-8">
        {/* Documentos por formulação */}
        <div className="mb-8">
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
              {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
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
              { tipo: 'ficha' as const, titulo: 'Ficha Técnica', desc: 'Composição, processo, tabela nutricional estimada e informações regulatórias.', icon: BookOpen },
              { tipo: 'pop' as const, titulo: 'POP', desc: 'Procedimento Operacional Padrão para replicação do processo.', icon: FileText },
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
            Clique em um protocolo para ler o conteúdo completo (figuras, fórmulas e referências). Use o botão Baixar para salvar como arquivo de texto.
          </p>

          <div className="space-y-3">
            {PROTOCOLOS.map(p => (
              <ProtocoloCard
                key={p.id}
                p={p}
                aberto={aberto === p.id}
                onToggle={() => setAberto(aberto === p.id ? null : p.id)}
                onBaixar={() => baixarProtocolo(p)}
                baixando={baixando === p.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
