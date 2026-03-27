import { tool } from 'ai'
import { z } from 'zod'

// Tabela nutricional de ingredientes comuns (por 100g) — baseado em TACO 4ª edição (UNICAMP)
const TABELA_NUTRI: Record<string, { kcal: number; prot: number; carb: number; gor: number; fib: number; sod: number }> = {
  // Vegetais e tubérculos
  'batata-doce': { kcal: 86, prot: 1.6, carb: 20.1, gor: 0.1, fib: 3.0, sod: 55 },
  'mandioca': { kcal: 157, prot: 1.4, carb: 38.1, gor: 0.3, fib: 1.9, sod: 14 },
  'batata': { kcal: 82, prot: 1.7, carb: 18.9, gor: 0.1, fib: 1.8, sod: 7 },
  'cenoura': { kcal: 41, prot: 0.9, carb: 9.6, gor: 0.2, fib: 2.8, sod: 69 },
  'espinafre': { kcal: 23, prot: 2.9, carb: 3.6, gor: 0.4, fib: 2.2, sod: 79 },
  'beterraba': { kcal: 39, prot: 1.5, carb: 8.8, gor: 0.1, fib: 2.0, sod: 58 },
  'abobrinha': { kcal: 21, prot: 1.3, carb: 4.4, gor: 0.1, fib: 1.3, sod: 2 },
  'ervilha': { kcal: 81, prot: 5.4, carb: 14.4, gor: 0.4, fib: 5.7, sod: 5 },
  'tomate': { kcal: 15, prot: 0.9, carb: 3.1, gor: 0.2, fib: 1.2, sod: 4 },

  // Cereais e farinhas
  'arroz': { kcal: 358, prot: 7.2, carb: 78.8, gor: 0.3, fib: 1.6, sod: 4 },
  'farinha de arroz': { kcal: 361, prot: 6.5, carb: 80.2, gor: 0.5, fib: 1.7, sod: 1 },
  'farinha de trigo': { kcal: 360, prot: 9.8, carb: 75.1, gor: 1.4, fib: 2.3, sod: 2 },
  'farinha de mandioca': { kcal: 363, prot: 1.8, carb: 88.0, gor: 0.3, fib: 6.4, sod: 5 },
  'milho': { kcal: 362, prot: 8.1, carb: 78.7, gor: 0.8, fib: 2.3, sod: 2 },
  'aveia': { kcal: 394, prot: 13.9, carb: 66.6, gor: 8.5, fib: 9.1, sod: 5 },
  'quinoa': { kcal: 374, prot: 13.8, carb: 64.2, gor: 6.1, fib: 7.0, sod: 5 },

  // Amidos
  'amido de milho': { kcal: 381, prot: 0.3, carb: 91.3, gor: 0.1, fib: 0.9, sod: 8 },
  'amido de mandioca': { kcal: 350, prot: 0.2, carb: 86.4, gor: 0.2, fib: 0.4, sod: 3 },
  'amido de batata': { kcal: 334, prot: 0.1, carb: 83.0, gor: 0.1, fib: 0.2, sod: 7 },
  'tapioca': { kcal: 350, prot: 0.2, carb: 86.4, gor: 0.2, fib: 0.4, sod: 3 },

  // Proteínas vegetais
  'proteina de soja': { kcal: 338, prot: 80.0, carb: 5.0, gor: 0.5, fib: 3.5, sod: 900 },
  'proteina de ervilha': { kcal: 352, prot: 78.0, carb: 6.0, gor: 2.5, fib: 3.0, sod: 280 },
  'tofu': { kcal: 76, prot: 8.1, carb: 1.9, gor: 4.2, fib: 0.3, sod: 7 },
  'soja': { kcal: 338, prot: 36.5, carb: 19.9, gor: 18.9, fib: 20.2, sod: 3 },

  // Proteínas animais
  'frango': { kcal: 159, prot: 32.0, carb: 0, gor: 2.5, fib: 0, sod: 77 },
  'atum': { kcal: 119, prot: 26.0, carb: 0, gor: 1.1, fib: 0, sod: 376 },
  'gelatina': { kcal: 335, prot: 85.6, carb: 0, gor: 0.1, fib: 0, sod: 196 },
  'leite': { kcal: 61, prot: 3.2, carb: 4.5, gor: 3.4, fib: 0, sod: 45 },
  'proteina do leite': { kcal: 385, prot: 88.0, carb: 4.0, gor: 1.5, fib: 0, sod: 350 },

  // Lipídios
  'oleo vegetal': { kcal: 884, prot: 0, carb: 0, gor: 100, fib: 0, sod: 0 },
  'azeite': { kcal: 884, prot: 0, carb: 0, gor: 100, fib: 0, sod: 0 },
  'oleo de coco': { kcal: 862, prot: 0, carb: 0, gor: 100, fib: 0, sod: 0 },
  'lecitina': { kcal: 763, prot: 0.3, carb: 0, gor: 94.0, fib: 0, sod: 0 },

  // Hidrocolóides e aditivos funcionais (contribuição nutricional negligenciável)
  'xantana': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'goma guar': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'metilcelulose': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'hpmc': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'alginato': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'carragena': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'pectina': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'glicerol': { kcal: 312, prot: 0, carb: 87.0, gor: 0, fib: 0, sod: 0 },

  // Outros
  'sal': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 38758 },
  'acucar': { kcal: 387, prot: 0, carb: 99.5, gor: 0, fib: 0, sod: 1 },
  'açúcar': { kcal: 387, prot: 0, carb: 99.5, gor: 0, fib: 0, sod: 1 },
  'agua': { kcal: 0, prot: 0, carb: 0, gor: 0, fib: 0, sod: 0 },
  'chocolate em po': { kcal: 312, prot: 17.6, carb: 57.9, gor: 13.7, fib: 26.9, sod: 57 },
  'spirulina': { kcal: 290, prot: 57.5, carb: 23.9, gor: 7.7, fib: 3.6, sod: 1048 },
  'curcuma': { kcal: 354, prot: 7.8, carb: 64.9, gor: 9.9, fib: 21.1, sod: 38 },
  'cúrcuma': { kcal: 354, prot: 7.8, carb: 64.9, gor: 9.9, fib: 21.1, sod: 38 },
}

export const miaTools = {
  calcular_tabela_nutricional: tool({
    description: 'Calcula a tabela nutricional de uma formulação com base nos ingredientes e percentuais fornecidos. Use sempre que o usuário fornecer uma formulação com ingredientes e quantidades.',
    parameters: z.object({
      ingredientes: z.array(z.object({
        nome: z.string().describe('Nome do ingrediente (em minúsculas, sem acentos)'),
        percentual: z.number().describe('Percentual na formulação (0-100)'),
      })).describe('Lista de ingredientes com percentuais que somam ~100'),
      porcao_g: z.number().default(100).describe('Porção de referência em gramas'),
    }),
    execute: async ({ ingredientes, porcao_g }) => {
      let totalKcal = 0, totalProt = 0, totalCarb = 0, totalGor = 0, totalFib = 0, totalSod = 0

      const detalhes = ingredientes.map(({ nome, percentual }) => {
        const key = Object.keys(TABELA_NUTRI).find(k => nome.toLowerCase().includes(k) || k.includes(nome.toLowerCase()))
        const base = key ? TABELA_NUTRI[key] : null
        const fator = (percentual / 100) * (porcao_g / 100)

        if (base) {
          totalKcal += base.kcal * fator
          totalProt += base.prot * fator
          totalCarb += base.carb * fator
          totalGor += base.gor * fator
          totalFib += base.fib * fator
          totalSod += base.sod * fator
          return { nome, percentual, encontrado: true }
        }
        return { nome, percentual, encontrado: false }
      })

      return {
        porcao_g,
        energia_kcal: Math.round(totalKcal),
        proteinas_g: +totalProt.toFixed(1),
        carboidratos_g: +totalCarb.toFixed(1),
        gorduras_totais_g: +totalGor.toFixed(1),
        fibras_g: +totalFib.toFixed(1),
        sodio_mg: Math.round(totalSod),
        ingredientes_nao_encontrados: detalhes.filter(d => !d.encontrado).map(d => d.nome),
        aviso: detalhes.some(d => !d.encontrado) ? 'Alguns ingredientes não foram encontrados na base. Valores podem estar incompletos.' : null,
      }
    },
  }),

  calcular_reologia_estimada: tool({
    description: 'Estima propriedades reológicas de uma formulação com base nos hidrocolóides e concentrações. Fornece yield stress estimado, comportamento esperado e recomendação de imprimibilidade.',
    parameters: z.object({
      hidrocoloides: z.array(z.object({
        nome: z.string(),
        concentracao_percentual: z.number(),
      })),
      solidos_totais_percentual: z.number().describe('Percentual total de sólidos na formulação'),
      tem_amido: z.boolean().default(false),
      concentracao_amido_percentual: z.number().optional(),
    }),
    execute: async ({ hidrocoloides, solidos_totais_percentual, tem_amido, concentracao_amido_percentual }) => {
      let yieldStressEstimado = 0
      let comportamento = ''
      const observacoes: string[] = []

      for (const hc of hidrocoloides) {
        const nome = hc.nome.toLowerCase()
        const conc = hc.concentracao_percentual

        if (nome.includes('xantana')) {
          yieldStressEstimado += conc * 120
          comportamento = 'shear-thinning pronunciado'
          if (conc > 1.5) observacoes.push('Xantana acima de 1,5% pode causar excesso de viscosidade a baixas taxas de cisalhamento')
        } else if (nome.includes('metilcelulose') || nome.includes('hpmc')) {
          yieldStressEstimado += conc * 80
          comportamento = 'gelificação térmica reversa — fluidifica ao aquecer'
          observacoes.push(`${nome}: gelifica entre 40–60°C, trabalhar frio para extrusar`)
        } else if (nome.includes('alginato')) {
          yieldStressEstimado += conc * 60
          comportamento = 'gelificação iônica — estável após extrusão com Ca²⁺'
        } else if (nome.includes('carragena')) {
          yieldStressEstimado += conc * 90
          comportamento = 'gel termorreversível — resfriar para estruturar'
        } else if (nome.includes('gelatina')) {
          yieldStressEstimado += conc * 50
          comportamento = 'gel termorreversível — imprimir frio (4–15°C)'
          observacoes.push('Gelatina: manter abaixo de 20°C durante impressão')
        } else if (nome.includes('pectina')) {
          yieldStressEstimado += conc * 70
          comportamento = 'gel ácido com Ca²⁺'
        }
      }

      if (tem_amido && concentracao_amido_percentual) {
        yieldStressEstimado += concentracao_amido_percentual * 15
        observacoes.push('Amido gelatinizado contribui para a rede estrutural — gelatinizar antes de imprimir')
      }

      yieldStressEstimado += solidos_totais_percentual * 2

      const imprimibilidade =
        yieldStressEstimado < 30 ? { score: 2, descricao: 'Baixa — estrutura pode colapsar pós-impressão' }
        : yieldStressEstimado < 80 ? { score: 5, descricao: 'Moderada — pode precisar ajustes' }
        : yieldStressEstimado < 300 ? { score: 9, descricao: 'Boa — faixa ideal para extrusão' }
        : { score: 6, descricao: 'Alta — pode ter dificuldade de extrusão, verificar pressão/bico' }

      return {
        yield_stress_estimado_Pa: Math.round(yieldStressEstimado),
        comportamento_esperado: comportamento || 'estrutura dependente dos sólidos totais',
        score_imprimibilidade: imprimibilidade,
        observacoes,
        recomendacao_bico_mm: yieldStressEstimado > 200 ? '1,5–3mm' : '0,8–1,5mm',
      }
    },
  }),

  gerar_protocolo: tool({
    description: 'Gera um protocolo de preparo ou ensaio passo a passo. Use quando o usuário pedir protocolo de gelatinização, hidratação de hidrocolóide, emulsificação ou análise.',
    parameters: z.object({
      tipo: z.enum(['gelatinizacao_amido', 'hidratacao_hidrocoloide', 'emulsificacao', 'tpa', 'yield_stress', 'preparo_impressao']),
      ingrediente: z.string().describe('Ingrediente principal do protocolo'),
      concentracao: z.number().optional().describe('Concentração em %'),
      massa_total_g: z.number().optional().default(500).describe('Massa total da formulação em gramas'),
    }),
    execute: async ({ tipo, ingrediente, concentracao, massa_total_g }) => {
      const protocolos: Record<string, object> = {
        gelatinizacao_amido: {
          titulo: `Protocolo de Gelatinização — ${ingrediente}`,
          tipo,
          passos: [
            { numero: 1, descricao: 'Pesar o amido em balança analítica', parametros: `${concentracao ? (concentracao * (massa_total_g ?? 500) / 100).toFixed(1) : 'X'} g de amido` },
            { numero: 2, descricao: 'Dispersar o amido em parte da água fria (30% do total)', parametros: 'Agitar até dispersão homogênea, sem grumos' },
            { numero: 3, descricao: 'Aquecer sob agitação constante até atingir temperatura de gelatinização', parametros: ingrediente.includes('mandioca') ? '65–72°C' : ingrediente.includes('batata') ? '60–70°C' : '62–72°C' },
            { numero: 4, descricao: 'Manter na temperatura por 10 minutos sob agitação', parametros: 'Garantir gelatinização completa — pasta deve ficar translúcida' },
            { numero: 5, descricao: 'Adicionar os demais ingredientes da formulação com agitação', parametros: 'Adicionar hidrocolóides dispersos previamente' },
            { numero: 6, descricao: 'Resfriar até temperatura de impressão', parametros: 'Banho de gelo ou geladeira — monitorar viscosidade' },
            { numero: 7, descricao: 'Descansar 30–60 min antes de imprimir', parametros: 'Aguardar estabilização da rede estrutural (tixotropia)' },
          ],
          equipamentos: ['Balança analítica (0,01g)', 'Termômetro ou termopar', 'Agitador magnético ou mecânico', 'Banho termostatizado ou placa de aquecimento'],
        },
        hidratacao_hidrocoloide: {
          titulo: `Protocolo de Hidratação — ${ingrediente}`,
          tipo,
          passos: [
            { numero: 1, descricao: 'Pesar o hidrocolóide com precisão', parametros: `${concentracao ? (concentracao * (massa_total_g ?? 500) / 100).toFixed(2) : 'X'} g` },
            { numero: 2, descricao: 'Dispersar em pequena quantidade de etanol (5–10 mL) antes de adicionar à água', parametros: 'Evita formação de grumos (lumping)' },
            { numero: 3, descricao: 'Adicionar à água sob agitação vigorosa (vórtex ou Ultra-Turrax)', parametros: '1000–5000 rpm por 2–3 min' },
            { numero: 4, descricao: 'Agitar por tempo adequado à temperatura correta', parametros: ingrediente.includes('xantana') ? '25°C, 30 min agitação suave' : '25°C, 60 min ou conforme ficha técnica' },
            { numero: 5, descricao: 'Verificar hidratação: ausência de partículas visíveis', parametros: 'Observar em lâmina ou luz polarizada se disponível' },
            { numero: 6, descricao: 'Descansar 12–24h em geladeira para hidratação completa', parametros: 'Tampado para evitar evaporação' },
          ],
          equipamentos: ['Balança analítica', 'Agitador magnético ou Ultra-Turrax', 'Etanol PA (opcional)', 'Béquer + filme plástico'],
        },
        preparo_impressao: {
          titulo: `Protocolo de Preparo para Impressão — ${ingrediente}`,
          tipo,
          passos: [
            { numero: 1, descricao: 'Preparar a pasta conforme formulação estabelecida', parametros: 'Verificar consistência visual' },
            { numero: 2, descricao: 'Eliminar bolhas de ar — centrifugar ou usar vácuo', parametros: '500–1000 rpm por 2 min ou vácuo 30s' },
            { numero: 3, descricao: 'Transferir para cartucho/seringa de impressão', parametros: 'Evitar incorporação de ar durante transferência' },
            { numero: 4, descricao: 'Selecionar ponteira adequada para a viscosidade', parametros: 'Alta viscosidade: ≥1,5mm | Baixa viscosidade: 0,8–1mm' },
            { numero: 5, descricao: 'Realizar purga inicial (5–10mm de extrusão)', parametros: 'Descartar material inicial até fluxo estável' },
            { numero: 6, descricao: 'Imprimir objeto de teste (cubo 20×20×10mm)', parametros: 'Avaliar: uniformidade do filamento, colapso de camadas, precisão' },
            { numero: 7, descricao: 'Ajustar parâmetros conforme necessário e iniciar impressão', parametros: 'Documentar parâmetros finais' },
          ],
          equipamentos: ['Impressora 3D de alimentos', 'Cartucho/seringa', 'Ponteiras calibradas', 'Paquímetro digital', 'Câmera para documentação'],
        },
      }

      return protocolos[tipo] ?? {
        titulo: `Protocolo: ${tipo}`,
        tipo,
        passos: [{ numero: 1, descricao: 'Protocolo específico a ser desenvolvido', parametros: 'Consultar literatura ou entrar em contato com a Morphê' }],
        equipamentos: [],
      }
    },
  }),

  buscar_formulacoes_similares: tool({
    description: 'Busca no banco de dados formulações similares à descrição fornecida. Use quando o usuário mencionar um ingrediente base ou tipo de formulação.',
    parameters: z.object({
      descricao: z.string().describe('Descrição do tipo de formulação ou ingrediente principal'),
      limite: z.number().default(3).describe('Número máximo de resultados'),
    }),
    execute: async ({ descricao, limite }) => {
      // Em produção: busca vetorial no Supabase
      // Por ora retorna placeholder para estrutura
      return {
        encontradas: [],
        mensagem: `Busca por "${descricao}" — banco de formulações ainda sendo populado. Formule do zero com base nas suas informações.`,
        limite,
      }
    },
  }),
}
