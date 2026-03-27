/**
 * Script para testar a qualidade das respostas da MIA.
 * Uso: npm run test-mia
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

const TEST_CASES = [
  {
    categoria: 'Formulação',
    pergunta: 'Quero formular uma pasta de batata-doce para impressão 3D. Qual seria uma formulação base?',
    esperado: ['xantana', 'amido', 'percentual', '%', 'ingrediente'],
  },
  {
    categoria: 'Diagnóstico',
    pergunta: 'Meu material de ervilha não extrusa mesmo com alta pressão. O que pode ser?',
    esperado: ['viscosidade', 'ponteira', 'partícula', 'causa'],
  },
  {
    categoria: 'Reologia',
    pergunta: 'Qual deve ser o yield stress ideal para imprimir uma estrutura com 20 camadas?',
    esperado: ['Pa', 'yield stress', 'τ', 'camada'],
  },
  {
    categoria: 'Protocolo',
    pergunta: 'Como preparo um gel de metilcelulose para impressão a quente?',
    esperado: ['temperatura', 'protocolo', '°C', 'gelifica'],
  },
  {
    categoria: 'Hidrocolóide',
    pergunta: 'Qual a concentração ideal de alginato de sódio para impressão, sem usar gelificação iônica?',
    esperado: ['alginato', '%', 'viscosidade', 'concentração'],
  },
]

async function testMia() {
  console.log('🧪 Iniciando testes da MIA...\n')

  for (const tc of TEST_CASES) {
    console.log(`📋 [${tc.categoria}] ${tc.pergunta.substring(0, 60)}...`)

    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: tc.pergunta }],
        }),
      })

      if (!res.ok) {
        console.log(`   ❌ HTTP ${res.status}\n`)
        continue
      }

      // Ler stream
      const reader = res.body?.getReader()
      let fullText = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullText += new TextDecoder().decode(value)
        }
      }

      // Extrai texto da resposta de stream
      const textLines = fullText.split('\n')
        .filter(l => l.startsWith('0:'))
        .map(l => l.slice(2).replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"'))
        .join('')

      const hasKeywords = tc.esperado.filter(k => textLines.toLowerCase().includes(k.toLowerCase()))
      const score = hasKeywords.length / tc.esperado.length

      if (score >= 0.6) {
        console.log(`   ✅ Score: ${Math.round(score * 100)}% (${hasKeywords.join(', ')})`)
      } else {
        console.log(`   ⚠️  Score: ${Math.round(score * 100)}% — resposta pode estar incompleta`)
        console.log(`   Esperado: ${tc.esperado.join(', ')}`)
        console.log(`   Resposta (primeiros 200 chars): ${textLines.substring(0, 200)}`)
      }
    } catch (e) {
      console.log(`   ❌ Erro: ${e}`)
    }
    console.log()
  }

  console.log('Testes concluídos. Analise os scores e ajuste o system prompt conforme necessário.')
}

testMia()
