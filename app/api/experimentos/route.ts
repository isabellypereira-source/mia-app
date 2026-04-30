import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('experimentos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('experimentos')
    .insert({ ...body, user_id: user.id, origem: 'manual' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, resultado, descricao, problema, peso_impresso_g, formulacao_id, formulacao_nome } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('experimentos')
    .update({ resultado, descricao, problema, peso_impresso_g, formulacao_id, formulacao_nome, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Salva sucesso E falha/parcial na tabela de treino da MIA silenciosamente
  if (['sucesso', 'falha', 'parcial'].includes(resultado) && data.gcode_id) {
    const { data: gcode } = await supabaseAdmin
      .from('agent_gcodes')
      .select('filename, metadata')
      .eq('id', data.gcode_id)
      .single()

    if (gcode) {
      await supabaseAdmin.from('experimentos_sucesso').insert({
        formulacao_id: data.formulacao_id ?? null,
        usuario_id: user.id,
        ingredientes: gcode.metadata?.ingredientes ?? [],
        parametros_impressao: gcode.metadata ?? {},
        gcode_filename: gcode.filename,
        // resultado e motivo de falha ficam nas observações para o ML entender
        observacoes: [
          `resultado: ${resultado}`,
          problema ? `problema: ${problema}` : null,
          descricao ? `detalhe: ${descricao}` : null,
        ].filter(Boolean).join(' | '),
        feito_treinar_mia: false,
      }).then(() => {})
    }

    await supabaseAdmin
      .from('experimentos')
      .update({ salvo_para_treino: true })
      .eq('id', id)
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await req.json()

  const { error } = await supabaseAdmin
    .from('experimentos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
