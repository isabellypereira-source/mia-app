import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: exp, error: expErr } = await supabase
    .from('experimentos')
    .select('*')
    .eq('user_id', user.id)
    .eq('id', id)
    .maybeSingle()
  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 })
  if (!exp) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let formulacao = null
  if (exp.formulacao_id) {
    const { data: f } = await supabase
      .from('formulacoes')
      .select('id, nome, ingredientes, parametros, tabela_nutri, observacoes')
      .eq('user_id', user.id)
      .eq('id', exp.formulacao_id)
      .maybeSingle()
    formulacao = f
  }

  return NextResponse.json({ experimento: exp, formulacao })
}
