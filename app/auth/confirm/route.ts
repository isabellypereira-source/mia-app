import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// Rota de confirmação via token_hash — funciona em qualquer dispositivo/navegador.
// Configura no Supabase Dashboard → Auth → Email Templates → URL:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(
    `${origin}/auth/error?msg=Seu+link+de+confirmação+é+inválido+ou+já+foi+usado.+Solicite+um+novo.`
  )
}
