import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Busca token ativo existente
  const { data: existing } = await supabaseAdmin
    .from('agent_tokens')
    .select('token')
    .eq('user_id', user.id)
    .eq('revoked', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return NextResponse.json({ token: existing.token })

  // Cria novo se não existe
  const { data, error } = await supabaseAdmin
    .from('agent_tokens')
    .insert({ user_id: user.id })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ token: data.token })
}
