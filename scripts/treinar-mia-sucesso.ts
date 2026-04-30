import { createClient } from '@supabase/supabase-js'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface Experimento {
  id: string
  formulacao_id: string
  ingredientes: Record<string, number>
  qualidade_geometrica: number
  resistencia_mecanica?: number
  aparencia_score?: number
  observacoes?: string
}

interface Padrao {
  aplicacao: string
  ingredientes: Record<string, number>
  score_sucesso: number
  qualidade_media: number
  observacoes: string[]
}

async function treinarMIAcomSucesso() {
  console.log('[MIA Trainer] Iniciando treinamento com experimentos bem-sucedidos...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Buscar últimos 100 experimentos com qualidade > 85%
  const { data: sucessos, error } = await supabase
    .from('experimentos_sucesso')
    .select('*')
    .gt('qualidade_geometrica', 85)
    .eq('feito_treinar_mia', false)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[MIA Trainer] Erro ao buscar experimentos:', error)
    return
  }

  if (!sucessos || sucessos.length === 0) {
    console.log('[MIA Trainer] Nenhum experimento novo para treinar.')
    return
  }

  console.log(`[MIA Trainer] Encontrados ${sucessos.length} experimentos bem-sucedidos`)

  // 2. Processar dados: agregar padrões por aplicação
  const padroes = processarPatterns(sucessos as Experimento[])

  // 3. Gerar markdown de sucessos
  const knowledgeBasePath = 'knowledge-base/sucessos'
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `padroes_sucesso_${timestamp}.md`
  const filepath = join(process.cwd(), knowledgeBasePath, filename)

  // Criar diretório se não existir
  const dir = join(process.cwd(), knowledgeBasePath)
  if (!existsSync(dir)) {
    console.log(`[MIA Trainer] Criando diretório: ${dir}`)
  }

  const markdownContent = gerarMarkdownSuccos(padroes, sucessos.length)
  writeFileSync(filepath, markdownContent)
  console.log(`[MIA Trainer] Documento de sucessos criado: ${filename}`)

  // 4. Atualizar knowledge base index
  atualizarIndexKnowledgeBase(knowledgeBasePath, filename)

  // 5. Marcar como feito_treinar_mia = true
  const experimentoIds = sucessos.map(e => e.id)
  const { error: updateError } = await supabase
    .from('experimentos_sucesso')
    .update({
      feito_treinar_mia: true,
      versao_modelo: process.env.MIA_VERSION || '1.0'
    })
    .in('id', experimentoIds)

  if (updateError) {
    console.error('[MIA Trainer] Erro ao atualizar experimentos:', updateError)
    return
  }

  console.log(`[MIA Trainer] ✅ ${sucessos.length} experimentos marcados como treinados`)
  console.log('[MIA Trainer] MIA foi aprimorada com padrões de sucesso!')
}

function processarPatterns(sucessos: Experimento[]): Padrao[] {
  const patterns: Record<string, Padrao> = {}

  for (const exp of sucessos) {
    const key = `${exp.aplicacao || 'geral'}`

    if (!patterns[key]) {
      patterns[key] = {
        aplicacao: exp.aplicacao || 'geral',
        ingredientes: {},
        score_sucesso: 0,
        qualidade_media: 0,
        observacoes: [],
      }
    }

    // Agregar ingredientes
    if (exp.ingredientes) {
      for (const [ing, percentual] of Object.entries(exp.ingredientes)) {
        patterns[key].ingredientes[ing] = (patterns[key].ingredientes[ing] || 0) + percentual
      }
    }

    // Calcular score
    const score = (exp.qualidade_geometrica * 0.5 +
      (exp.aparencia_score || 0) * 5 +
      (exp.resistencia_mecanica || 0) * 2) / 3

    patterns[key].score_sucesso += score
    patterns[key].qualidade_media += exp.qualidade_geometrica
    if (exp.observacoes) patterns[key].observacoes.push(exp.observacoes)
  }

  // Normalizar agregações
  for (const pattern of Object.values(patterns)) {
    const count = sucessos.filter(e => (e.aplicacao || 'geral') === pattern.aplicacao).length

    pattern.score_sucesso = Math.round(pattern.score_sucesso / count)
    pattern.qualidade_media = Math.round(pattern.qualidade_media / count)

    // Normalizar percentuais de ingredientes
    const totalPercentual = Object.values(pattern.ingredientes).reduce((a, b) => a + b, 0)
    for (const ing in pattern.ingredientes) {
      pattern.ingredientes[ing] = Math.round((pattern.ingredientes[ing] / totalPercentual) * 100 * 100) / 100
    }
  }

  return Object.values(patterns)
}

function gerarMarkdownSuccos(padroes: Padrao[], totalExperimentos: number): string {
  let md = `# Padrões de Sucesso Validados\n\n`
  md += `**Data**: ${new Date().toLocaleDateString('pt-BR')}\n`
  md += `**Experimentos analisados**: ${totalExperimentos}\n\n`
  md += `---\n\n`

  for (const padrao of padroes) {
    md += `## ${padrao.aplicacao.toUpperCase()} (Score: ${padrao.score_sucesso}/100)\n\n`
    md += `- **Qualidade geométrica média**: ${padrao.qualidade_media}%\n`
    md += `- **Ingredientes mais efetivos**:\n`

    // Ordenar ingredientes por percentual
    const sorted = Object.entries(padrao.ingredientes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    for (const [ing, percentual] of sorted) {
      md += `  - ${ing}: ${percentual}%\n`
    }

    if (padrao.observacoes.length > 0) {
      md += `\n- **Notas importantes**:\n`
      // Usar as 2 observações mais únicas
      const uniqueObs = [...new Set(padrao.observacoes)].slice(0, 2)
      for (const obs of uniqueObs) {
        md += `  - ${obs}\n`
      }
    }

    md += `\n---\n\n`
  }

  return md
}

function atualizarIndexKnowledgeBase(basePath: string, novoArquivo: string) {
  const indexPath = join(process.cwd(), basePath, 'INDEX.md')
  let index = ''

  if (existsSync(indexPath)) {
    index = readFileSync(indexPath, 'utf-8')
  }

  // Adicionar nova referência ao topo do index
  const timestamp = new Date().toLocaleString('pt-BR')
  const newEntry = `- [${novoArquivo}](./${novoArquivo}) — Padrões atualizado em ${timestamp}\n`

  index = newEntry + index

  // Manter apenas últimos 20 registros
  const lines = index.split('\n').slice(0, 21)
  writeFileSync(indexPath, lines.join('\n'))

  console.log(`[MIA Trainer] INDEX.md atualizado`)
}

// Executar se chamado diretamente
if (require.main === module) {
  treinarMIAcomSucesso().catch(err => {
    console.error('[MIA Trainer] Erro fatal:', err)
    process.exit(1)
  })
}

export { treinarMIAcomSucesso }
