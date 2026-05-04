import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'code obrigatório' }, { status: 400 })

  // Cria token permanente para este usuário
  const { data, error } = await supabaseAdmin
    .from('agent_tokens')
    .insert({ user_id: user.id })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Guarda na tabela de pendentes para o agente buscar via polling
  const { error: pendingError } = await supabaseAdmin
    .from('pending_agent_auths')
    .insert({ code, token: data.token })

  if (pendingError) return NextResponse.json({ error: pendingError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
