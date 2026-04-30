import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { getUserFromAgentToken } from '@/lib/agent-auth'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const user = await getUserFromAgentToken(req)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('agent_stl_queue')
    .select('id, storage_path, filename, formula_config, created_at')
    .eq('user_id', user.id)
    .is('opened_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Gerar URLs assinadas (1 hora) para cada item — nunca expõe URL pública
  const items = await Promise.all(
    (data ?? []).map(async (item) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('mia-stl')
        .createSignedUrl(item.storage_path, 3600)
      return { ...item, stl_url: signed?.signedUrl ?? null }
    })
  )

  return NextResponse.json(items.filter(i => i.stl_url))
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromAgentToken(req)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await req.json()

  await supabaseAdmin
    .from('agent_stl_queue')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
