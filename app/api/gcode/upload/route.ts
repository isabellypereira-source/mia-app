import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const GcodeUploadSchema = z.object({
  formulacao_id: z.string().uuid(),
  gcode_content: z.string(),
  qualidade_geometrica: z.number().optional(),
  resistencia_mecanica: z.number().optional(),
  aparencia_score: z.number().optional(),
  observacoes: z.string().optional(),
  send_to_printer: z.boolean().optional().default(false),
})

function validateGcode(content: string): boolean {
  // Validar que contém comandos G-code reais
  const hasGCommands = /G\d+/i.test(content)
  const hasMovement = /G\d*(0|1)/i.test(content) // G0 rapid, G1 linear
  const hasExtrusion = /E-?\d+\.?\d*/i.test(content) // E command para extrusão

  return hasGCommands && (hasMovement || hasExtrusion)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = GcodeUploadSchema.parse(body)

    // Validar G-code
    if (!validateGcode(data.gcode_content)) {
      return NextResponse.json(
        { error: 'Invalid G-code format. Must contain G-code commands.' },
        { status: 400 }
      )
    }

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Salvar G-code em storage
    const userId = req.headers.get('user-id') || 'anonymous'
    const timestamp = new Date().toISOString().split('T')[0]
    const gcodeFilename = `gcode_${data.formulacao_id}_${timestamp}.gcode`
    const storagePath = `gcode/${userId}/${gcodeFilename}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mia-gcode')
      .upload(storagePath, data.gcode_content, {
        contentType: 'text/plain',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload G-code', details: uploadError.message },
        { status: 500 }
      )
    }

    // Obter URL pública do G-code
    const { data: publicUrl } = supabase.storage
      .from('mia-gcode')
      .getPublicUrl(storagePath)

    // Criar registro em experimentos_sucesso
    const { data: experimento, error: dbError } = await supabase
      .from('experimentos_sucesso')
      .insert({
        formulacao_id: data.formulacao_id,
        usuario_id: userId,
        qualidade_geometrica: data.qualidade_geometrica || 0,
        resistencia_mecanica: data.resistencia_mecanica,
        aparencia_score: data.aparencia_score,
        observacoes: data.observacoes,
        gcode_url: publicUrl.publicUrl,
        gcode_filename: gcodeFilename,
        feito_treinar_mia: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save experiment record', details: dbError.message },
        { status: 500 }
      )
    }

    // Se solicitado, enviar para servidor de impressora
    let printerResponse = null
    if (data.send_to_printer && process.env.PRINTER_SERVER_URL) {
      try {
        printerResponse = await sendToHostPrinter(
          publicUrl.publicUrl,
          data.formulacao_id
        )
      } catch (error) {
        console.warn('Failed to send to printer server:', error)
        // Não falhar a requisição se a impressora não responder
      }
    }

    return NextResponse.json({
      success: true,
      experimeto_id: experimento.id,
      gcodeUrl: publicUrl.publicUrl,
      filename: gcodeFilename,
      status: 'pronto_para_imprimir',
      printerResponse,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('G-code upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process G-code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function sendToHostPrinter(gcodeUrl: string, formulacaoId: string) {
  if (!process.env.PRINTER_SERVER_URL || !process.env.PRINTER_API_KEY) {
    throw new Error('Printer server not configured')
  }

  const response = await fetch(process.env.PRINTER_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PRINTER_API_KEY}`,
    },
    body: JSON.stringify({
      gcode_url: gcodeUrl,
      formulacao_id: formulacaoId,
      priority: 'normal',
    }),
  })

  if (!response.ok) {
    throw new Error(`Printer server responded with ${response.status}`)
  }

  return response.json()
}
