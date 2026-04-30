import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
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

    const { stlBuffer, filename, metadata } = await generateSTLfromFormula(formula)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user from session (for agent queue)
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    const userId = user?.id || body.userId || 'anonymous'
    const formulacaoId = formula.formulacao_id || `temp_${Date.now()}`
    const storagePath = `stl/${userId}/${formulacaoId}.stl`

    const buffer = Buffer.from(stlBuffer)

    const { error } = await supabase.storage
      .from('mia-stl')
      .upload(storagePath, buffer, {
        contentType: 'model/stl',
        upsert: true,
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to upload STL to storage', details: error.message },
        { status: 500 }
      )
    }

    const { data: publicUrl } = supabase.storage
      .from('mia-stl')
      .getPublicUrl(storagePath)

    // Queue for agent if user has an active token
    if (user) {
      const { data: token } = await supabase
        .from('agent_tokens')
        .select('id')
        .eq('user_id', user.id)
        .eq('revoked', false)
        .limit(1)
        .maybeSingle()

      if (token) {
        await supabase.from('agent_stl_queue').insert({
          user_id: user.id,
          stl_url: publicUrl.publicUrl,
          filename,
          formula_config: formula,
        })
      }
    }

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

    return NextResponse.json(
      { error: 'Failed to generate STL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
