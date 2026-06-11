import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: { email?: unknown; phone?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'email_invalido' }, { status: 400 })
  }
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'telefone_invalido' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('demo_requests')
    .insert({ email, phone })

  if (error) {
    console.error('demo_requests insert error', error)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
