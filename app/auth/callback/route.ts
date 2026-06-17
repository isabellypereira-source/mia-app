import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    // Falha de PKCE (ex: link aberto em outro navegador/dispositivo) → erro explicativo
    return NextResponse.redirect(
      `${origin}/auth/error?msg=Seu+link+foi+aberto+em+um+navegador+diferente+do+cadastro.+Abra+o+link+no+mesmo+navegador+ou+solicite+um+novo.`
    )
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'email_change',
      token_hash: tokenHash,
    })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(
    `${origin}/auth/error?msg=Seu+link+de+confirmação+é+inválido+ou+já+expirou.+Solicite+um+novo.`
  )
}
