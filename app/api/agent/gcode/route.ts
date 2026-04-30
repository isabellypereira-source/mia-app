import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromAgentToken } from '@/lib/agent-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const user = await getUserFromAgentToken(req)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { filename, content, metadata } = body

  // Salva o GCode
  const { data: gcode, error } = await supabaseAdmin
    .from('agent_gcodes')
    .insert({
      user_id: user.id,
      filename,
      content,
      metadata: metadata ?? {},
      file_size: content ? Buffer.byteLength(content, 'utf8') : 0,
      synced_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cria experimento pendente automaticamente — aparece na página de Experimentos
  await supabaseAdmin.from('experimentos').insert({
    user_id: user.id,
    gcode_id: gcode.id,
    gcode_filename: filename,
    origem: 'agent',
    resultado: 'pendente',
    data: new Date().toISOString().split('T')[0],
  })

  return NextResponse.json(gcode, { status: 201 })
}

export async function GET(req: NextRequest) {
  const user = await getUserFromAgentToken(req)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('agent_gcodes')
    .select('id, filename, metadata, file_size, synced_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
