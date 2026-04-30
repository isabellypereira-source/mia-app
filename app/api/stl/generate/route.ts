import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSTLfromFormula } from '@/lib/stl-generator'
import { z } from 'zod'

const FormulaSchema = z.object({
  nome: z.string(),
  aplicacao: z.string(),
  ingredientes: z.array(
    z.object({
      nome: z.string(),
      percentual: z.number(),
    })
  ),
  formulacao_id: z.string().optional(),
  densidade: z.number().optional(),
  forma: z.enum(['cilindro', 'cubo', 'esfera']).optional(),
  altura_mm: z.number().optional(),
  diametro_mm: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const formula = FormulaSchema.parse(body)

    // Gerar STL
    const { stlBuffer, filename, metadata } = await generateSTLfromFormula(formula)

    // Salvar em Supabase storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const userId = body.userId || 'anonymous'
    const formulacaoId = formula.formulacao_id || `temp_${Date.now()}`
    const storagePath = `stl/${userId}/${formulacaoId}.stl`

    // Converter ArrayBuffer para Buffer para upload
    const buffer = Buffer.from(stlBuffer)

    const { data, error } = await supabase.storage
      .from('mia-stl')
      .upload(storagePath, buffer, {
        contentType: 'model/stl',
        upsert: true,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload STL to storage', details: error.message },
        { status: 500 }
      )
    }

    // Gerar URL pública
    const { data: publicUrl } = supabase.storage
      .from('mia-stl')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      stlUrl: publicUrl.publicUrl,
      filename,
      metadata,
      storagePath,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid formula data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('STL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate STL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
