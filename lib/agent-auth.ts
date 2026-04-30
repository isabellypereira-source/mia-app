import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUserFromAgentToken(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)

  // Tenta token permanente do agent primeiro
  const { data: agentToken } = await supabaseAdmin
    .from('agent_tokens')
    .select('user_id')
    .eq('token', token)
    .eq('revoked', false)
    .single()

  if (agentToken) {
    // Atualiza last_used_at silenciosamente
    supabaseAdmin
      .from('agent_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token)
      .then(() => {})

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(agentToken.user_id)
    return user
  }

  // Fallback: JWT Supabase (para desenvolvimento)
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user ?? null
}
