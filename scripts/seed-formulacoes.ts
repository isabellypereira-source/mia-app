/**
 * Seed de formulações de exemplo para demo.
 * Uso: npm run seed
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

const FORMULACOES_DEMO = [
  {
    nome: 'Pasta de Batata-Doce Base',
    ingredientes: [
      { nome: 'Batata-doce cozida e amassada', percentual: 60, funcao: 'base alimentar' },
      { nome: 'Amido de mandioca', percentual: 12, funcao: 'estrutura e coesão' },
      { nome: 'Goma xantana', percentual: 0.5, funcao: 'agente estruturante, shear-thinning' },
      { nome: 'Água', percentual: 27, funcao: 'ajuste de umidade' },
      { nome: 'Sal', percentual: 0.5, funcao: 'sabor' },
    ],
    parametros: { ponteira_mm: 1.5, velocidade_mm_s: 15, temperatura_c: 20 },
    resultado: 'sucesso',
    observacoes: 'Yield stress estimado 180 Pa. Boa imprimibilidade. Gelatinizar amido antes.',
  },
  {
    nome: 'Pasta de Ervilha com Proteína',
    ingredientes: [
      { nome: 'Ervilha cozida', percentual: 55, funcao: 'base alimentar + proteína' },
      { nome: 'Proteína de ervilha isolada', percentual: 8, funcao: 'enriquecimento proteico' },
      { nome: 'Goma xantana', percentual: 0.8, funcao: 'agente estruturante' },
      { nome: 'HPMC', percentual: 1.5, funcao: 'agente estruturante secundário' },
      { nome: 'Água', percentual: 34, funcao: 'ajuste de umidade' },
      { nome: 'Azeite', percentual: 0.7, funcao: 'textura e calor' },
    ],
    parametros: { ponteira_mm: 2, velocidade_mm_s: 12, temperatura_c: 25 },
    resultado: 'em_teste',
    observacoes: 'Proteína de ervilha aumenta yield stress. Peneirar em 500 μm para evitar entupimento.',
  },
  {
    nome: 'Gel de Chocolate para Impressão',
    ingredientes: [
      { nome: 'Chocolate em pó (70% cacau)', percentual: 25, funcao: 'sabor e sólidos' },
      { nome: 'Manteiga de cacau', percentual: 15, funcao: 'fase gordurosa, textura' },
      { nome: 'Açúcar', percentual: 10, funcao: 'sabor e sólidos' },
      { nome: 'HPMC', percentual: 2, funcao: 'agente estruturante térmico' },
      { nome: 'Lecitina de soja', percentual: 0.5, funcao: 'emulsificante' },
      { nome: 'Água', percentual: 47.5, funcao: 'fase aquosa' },
    ],
    parametros: { ponteira_mm: 1, velocidade_mm_s: 8, temperatura_c: 55 },
    resultado: 'falha',
    observacoes: 'Problemas de exsudação de gordura. Necessita ajuste de emulsificante e pré-tratamento da lecitina.',
  },
]

console.log('📌 Para usar: execute no console do navegador ou via API autenticada.')
console.log('Formulações de demo disponíveis:')
FORMULACOES_DEMO.forEach((f, i) => {
  console.log(`${i + 1}. ${f.nome} (${f.resultado})`)
  console.log(`   Ingredientes: ${f.ingredientes.length} | Bico: ${f.parametros.ponteira_mm}mm | Velocidade: ${f.parametros.velocidade_mm_s}mm/s`)
})
console.log('\nExporte estas formulações via POST /api/formulacoes após autenticar.')
