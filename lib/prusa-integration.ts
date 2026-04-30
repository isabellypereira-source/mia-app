import { createClient } from '@supabase/supabase-js'

interface FormulaData {
  id?: string
  nome: string
  aplicacao: string
  ingredientes: Array<{ nome: string; percentual: number }>
  densidade?: number
  forma?: 'cilindro' | 'cubo' | 'esfera'
  altura_mm?: number
  diametro_mm?: number
}

interface ExperimentoData {
  formulacao_id: string
  gcode_content: string
  qualidade_geometrica?: number
  resistencia_mecanica?: number
  aparencia_score?: number
  observacoes?: string
  send_to_printer?: boolean
}

interface STLGenerationResult {
  success: boolean
  stlUrl?: string
  filename?: string
  metadata?: {
    volume_mm3: number
    peso_estimado_g: number
    tempo_impressao_estimado_min: number
    forma: string
  }
  error?: string
}

interface GcodeUploadResult {
  success: boolean
  gcodeUrl?: string
  filename?: string
  experimento_id?: string
  status?: string
  printerResponse?: unknown
  error?: string
}

/**
 * Gerar STL dinamicamente a partir de uma formulação
 */
export async function gerarSTL(
  formula: FormulaData,
  userId?: string
): Promise<STLGenerationResult> {
  try {
    const response = await fetch('/api/stl/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formula,
        userId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || 'Erro ao gerar STL' }
    }

    const result = await response.json()
    return { success: true, ...result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Download STL file direto no navegador
 */
export async function baixarSTL(stlUrl: string, filename: string) {
  try {
    const response = await fetch(stlUrl)
    if (!response.ok) throw new Error('Erro ao baixar arquivo')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Erro ao baixar STL:', error)
    return false
  }
}

/**
 * Upload de G-code e criar registro de experimento
 */
export async function uploadGcode(
  experimento: ExperimentoData,
  userId?: string
): Promise<GcodeUploadResult> {
  try {
    const response = await fetch('/api/gcode/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId || 'anonymous',
      },
      body: JSON.stringify(experimento),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || 'Erro ao fazer upload de G-code' }
    }

    const result = await response.json()
    return { success: true, ...result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Download G-code file direto no navegador
 */
export async function baixarGcode(gcodeUrl: string, filename: string) {
  try {
    const response = await fetch(gcodeUrl)
    if (!response.ok) throw new Error('Erro ao baixar arquivo')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Erro ao baixar G-code:', error)
    return false
  }
}

/**
 * Obter informações sobre um experimento salvo
 */
export async function obterExperimento(
  experimentoId: string,
  userId: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('experimentos_sucesso')
      .select('*')
      .eq('id', experimentoId)
      .eq('usuario_id', userId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Listar experimentos bem-sucedidos do usuário (últimos 10)
 */
export async function listarExperimentos(userId: string, limit = 10) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('experimentos_sucesso')
      .select('*')
      .eq('usuario_id', userId)
      .gt('qualidade_geometrica', 70)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Instruções em português para o usuário
 */
export const INSTRUCOES_PRUSA_PT = `
## Como usar a integração PrusaSlicer

1. **Gerar STL**: Clique em "Gerar STL" para criar um arquivo 3D baseado na sua formulação
2. **Download**: Baixe o arquivo .stl para seu computador
3. **Abrir no PrusaSlicer**: Abra o PrusaSlicer em seu computador e importe o arquivo STL
4. **Fatiar e Modificar**: Configure os parâmetros de impressão conforme necessário
5. **Exportar G-code**: Exporte o arquivo G-code do PrusaSlicer
6. **Upload**: Faça upload do G-code aqui para:
   - Salvar na base de dados
   - Enviar para a impressora (opcional)
   - Baixar no seu notebook

Após a impressão, execute os testes de qualidade na aba "Caracterização" para que a MIA aprenda com os resultados!
`
