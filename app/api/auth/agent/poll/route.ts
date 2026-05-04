import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ token: null })

  const { data } = await supabaseAdmin
    .from('pending_agent_auths')
    .select('token, expires_at')
    .eq('code', code)
    .single()

  if (!data) return NextResponse.json({ token: null })

  // Expirado
  if (new Date(data.expires_at) < new Date()) {
    await supabaseAdmin.from('pending_agent_auths').delete().eq('code', code)
    return NextResponse.json({ token: null })
  }

  // Encontrou — retorna e deleta (uso único)
  await supabaseAdmin.from('pending_agent_auths').delete().eq('code', code)
  return NextResponse.json({ token: data.token })
}
