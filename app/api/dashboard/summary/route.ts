import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type ActivityItem = {
  ts: string
  type: 'form_created' | 'form_updated' | 'exp_created'
  name: string | null
  result?: string | null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const oneWeekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [formsAll, formsWeek, expsWeek, lastForm, recentForms, recentExps, expsAll] = await Promise.all([
    supabase
      .from('formulacoes')
      .select('id, ingredientes')
      .eq('user_id', user.id),
    supabase
      .from('formulacoes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo),
    supabase
      .from('experimentos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo),
    supabase
      .from('formulacoes')
      .select('id, nome, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('formulacoes')
      .select('id, nome, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('experimentos')
      .select('id, formulacao_nome, resultado, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('experimentos')
      .select('formulacao_id')
      .eq('user_id', user.id),
  ])

  const ingredientCount: Record<string, number> = {}
  for (const f of formsAll.data || []) {
    const ings = Array.isArray(f.ingredientes) ? f.ingredientes : []
    for (const ing of ings) {
      const name = typeof ing === 'string'
        ? ing
        : (ing && typeof ing === 'object' && 'nome' in ing && typeof ing.nome === 'string'
            ? ing.nome
            : null)
      if (name) ingredientCount[name] = (ingredientCount[name] || 0) + 1
    }
  }
  const topIngredients = Object.entries(ingredientCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }))

  const activity: ActivityItem[] = []
  for (const f of recentForms.data || []) {
    const wasUpdated = f.updated_at && f.created_at && f.updated_at !== f.created_at
    activity.push({
      ts: f.updated_at || f.created_at,
      type: wasUpdated ? 'form_updated' : 'form_created',
      name: f.nome,
    })
  }
  for (const e of recentExps.data || []) {
    activity.push({
      ts: e.created_at,
      type: 'exp_created',
      name: e.formulacao_nome,
      result: e.resultado,
    })
  }
  activity.sort((a, b) => b.ts.localeCompare(a.ts))

  const formsWithExperiment = new Set((expsAll.data || []).map(e => e.formulacao_id).filter(Boolean))
  const totalForms = formsAll.data?.length || 0
  const pendingExperiment = Math.max(totalForms - formsWithExperiment.size, 0)

  const { count: troubledCount } = await supabase
    .from('experimentos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('resultado', ['falha', 'parcial'])

  return NextResponse.json({
    continueFormulation: lastForm.data,
    weekStats: {
      formCount: formsWeek.count ?? 0,
      expCount: expsWeek.count ?? 0,
      topIngredients,
    },
    activity: activity.slice(0, 6),
    totalForms,
    pendingExperiment,
    troubledExperiments: troubledCount ?? 0,
  })
}
