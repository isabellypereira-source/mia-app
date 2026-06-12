'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Play,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  MessageSquare,
  Download,
  Sparkles,
  BookOpen,
} from 'lucide-react'

type ContinueFormulation = { id: string; nome: string | null; updated_at: string }
type ActivityItem = {
  ts: string
  type: 'form_created' | 'form_updated' | 'exp_created'
  name: string | null
  result?: string | null
}
type Summary = {
  continueFormulation: ContinueFormulation | null
  weekStats: {
    formCount: number
    expCount: number
    topIngredients: { name: string; count: number }[]
  }
  activity: ActivityItem[]
  totalForms: number
  pendingExperiment: number
}

function formatRel(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const day = Math.floor(diff / 86_400_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  if (h < 24) return `há ${h} ${h === 1 ? 'hora' : 'horas'}`
  if (day === 1) return 'Ontem'
  if (day < 7) return `há ${day} dias`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function activityText(item: ActivityItem) {
  switch (item.type) {
    case 'form_created':
      return <>Você criou a formulação <b>{item.name || 'sem nome'}</b>.</>
    case 'form_updated':
      return <>Você atualizou <b>{item.name || 'sem nome'}</b>.</>
    case 'exp_created':
      return <>Você registrou um experimento de <b>{item.name || 'sem nome'}</b>.</>
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(r => r.json())
      .then((d: Summary) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  const cont = data?.continueFormulation
  const stats = data?.weekStats
  const acts = data?.activity || []
  const pending = data?.pendingExperiment || 0
  const totalForms = data?.totalForms || 0

  return (
    <>
      <style>{CSS}</style>

      {/* CONTINUE */}
      {cont ? (
        <div className="continue">
          <div className="badge-icon"><Play size={26} strokeWidth={1.8} /></div>
          <div className="info">
            <div className="eyebrow">Continue de onde parou</div>
            <h2>{cont.nome || 'Formulação sem nome'}</h2>
            <div className="meta">Última edição {formatRel(cont.updated_at)}.</div>
          </div>
          <Link href={`/formulacoes`} className="cta">
            Retomar <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      ) : (
        <div className="continue">
          <div className="badge-icon"><Sparkles size={26} strokeWidth={1.8} /></div>
          <div className="info">
            <div className="eyebrow">Começo do trabalho</div>
            <h2>Crie sua primeira formulação.</h2>
            <div className="meta">A MIA te orienta da hipótese ao protocolo.</div>
          </div>
          <Link href="/formular" className="cta">
            Começar <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* RESUMO DA SEMANA */}
      <div className="section-title">Resumo desta semana</div>
      <div className="stats">
        <div className="stat">
          <div className="label">Formulações criadas</div>
          <div className="value">{loading ? '—' : String(stats?.formCount ?? 0).padStart(2, '0')}</div>
          <div className="delta">nos últimos 7 dias</div>
        </div>
        <div className="stat">
          <div className="label">Experimentos registrados</div>
          <div className="value">{loading ? '—' : String(stats?.expCount ?? 0).padStart(2, '0')}</div>
          <div className="delta">nos últimos 7 dias</div>
        </div>
        <div className="stat">
          <div className="label">Ingredientes mais usados</div>
          {loading ? (
            <div className="value">—</div>
          ) : stats?.topIngredients?.length ? (
            <ul className="ing-list">
              {stats.topIngredients.map(i => (
                <li key={i.name}>
                  <span className="ing-name">{i.name}</span>
                  <span className="ing-count">{i.count}×</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">Adicione ingredientes às suas formulações para ver os mais usados.</div>
          )}
        </div>
      </div>

      {/* ATALHOS */}
      <div className="section-title">Atalhos</div>
      <div className="quick">
        <Link href="/formular" className="qcard">
          <div className="iconbox"><Plus size={20} strokeWidth={1.8} /></div>
          <div><h3>Nova formulação</h3><p>Comece do zero ou peça à MIA uma sugestão inicial.</p></div>
        </Link>
        <Link href="/parametros" className="qcard">
          <div className="iconbox"><SlidersHorizontal size={20} strokeWidth={1.8} /></div>
          <div><h3>Parametrizar processo</h3><p>Calcule velocidade, temperatura e altura de camada.</p></div>
        </Link>
        <Link href="/chat" className="qcard">
          <div className="iconbox"><MessageSquare size={20} strokeWidth={1.8} /></div>
          <div><h3>Conversar com a MIA</h3><p>Tire dúvidas, interprete dados, discuta hipóteses.</p></div>
        </Link>
        <Link href="/exportar" className="qcard">
          <div className="iconbox"><Download size={20} strokeWidth={1.8} /></div>
          <div><h3>Exportar ficha técnica</h3><p>Documento estruturado com formulação e processo.</p></div>
        </Link>
      </div>

      {/* TIMELINE + SUGESTÃO */}
      <div className="two-col">
        <div className="panel">
          <h3>Atividade recente <Link href="/formulacoes">Ver tudo</Link></h3>
          {loading ? (
            <div className="empty-panel">Carregando…</div>
          ) : acts.length === 0 ? (
            <div className="empty-panel">Suas ações aparecem aqui assim que começar a usar a MIA.</div>
          ) : acts.map((item, i) => (
            <div key={i} className="tl-item">
              <div className="tl-dot" />
              <div className="tl-time">{formatRel(item.ts)}</div>
              <div className="tl-body">{activityText(item)}</div>
            </div>
          ))}
        </div>

        <div className="panel suggestion">
          <h3>Sugestão da MIA <Link href="/chat">Conversar</Link></h3>
          <div className="sugg-icon"><Sparkles size={24} strokeWidth={1.8} /></div>
          {loading ? (
            <p className="sugg-text">Lendo seu trabalho recente…</p>
          ) : totalForms === 0 ? (
            <>
              <p className="sugg-text">Que tal começar criando sua primeira formulação? <b>Posso te guiar</b> na escolha de ingredientes e hidrocolóides.</p>
              <Link href="/formular" className="sugg-cta">Começar formulação <ArrowRight size={14} strokeWidth={2} /></Link>
            </>
          ) : pending > 0 ? (
            <>
              <p className="sugg-text">Você tem <b>{pending} {pending === 1 ? 'formulação' : 'formulações'}</b> {pending === 1 ? 'sem experimento registrado' : 'sem experimentos registrados'}. Que tal documentar uma impressão agora?</p>
              <Link href="/experimentos" className="sugg-cta">Registrar experimento <ArrowRight size={14} strokeWidth={2} /></Link>
            </>
          ) : (
            <>
              <p className="sugg-text">Todas as suas formulações têm experimentos registrados. <b>Bom trabalho.</b> Que tal explorar uma nova matriz ou hidrocolóide?</p>
              <Link href="/chat" className="sugg-cta">Conversar com a MIA <ArrowRight size={14} strokeWidth={2} /></Link>
            </>
          )}
        </div>
      </div>

      {/* BASE DE CONHECIMENTO */}
      <div className="learned">
        <div className="iconbox"><BookOpen size={22} strokeWidth={1.8} /></div>
        <div className="txt">
          <div className="eyebrow">Base de conhecimento</div>
          <p>A MIA está conectada à literatura científica curada pela Morphê Foods. Use o chat para consultar protocolos, artigos e referências aplicadas às suas formulações.</p>
        </div>
      </div>
    </>
  )
}

const CSS = `
  .continue{
    display:flex;align-items:center;gap:22px;
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass-strong);
    backdrop-filter:blur(20px);
    border-radius:22px;padding:22px 26px;
  }
  .continue .badge-icon{
    width:56px;height:56px;border-radius:16px;
    background:var(--icon-tint);
    display:grid;place-items:center;color:var(--accent-em);
    flex-shrink:0;
  }
  .continue .info{flex:1;min-width:0}
  .continue .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint);margin-bottom:6px}
  .continue h2{margin:0;font-size:21px;color:var(--text-main);font-weight:600;letter-spacing:-.01em}
  .continue .meta{font-size:13px;color:var(--text-muted);margin-top:6px}
  .continue .cta{
    display:inline-flex;align-items:center;gap:8px;
    background:var(--accent);color:var(--accent-text-on);
    padding:11px 22px;border-radius:999px;
    text-decoration:none;font-size:14px;font-weight:600;flex-shrink:0;
    transition:transform .15s, box-shadow .25s;
  }
  .continue .cta:hover{transform:translateY(-1px);box-shadow:0 14px 28px -10px var(--accent)}

  .section-title{font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-faint);margin:28px 0 12px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .stat{
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    border-radius:18px;padding:18px 20px;
    backdrop-filter:blur(16px);
    min-height:130px;
  }
  .stat .label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint);margin-bottom:10px}
  .stat .value{font-family:var(--font-serif),serif;font-style:italic;font-size:42px;color:var(--accent-em);line-height:1}
  .stat .delta{font-size:12px;color:var(--text-muted);margin-top:6px}
  .stat .empty{font-size:12.5px;color:var(--text-faint);line-height:1.4;margin-top:4px}
  .ing-list{list-style:none;padding:0;margin:6px 0 0;display:flex;flex-direction:column;gap:6px}
  .ing-list li{display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--text-main)}
  .ing-list .ing-name{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%}
  .ing-list .ing-count{font-family:var(--font-serif),serif;font-style:italic;font-size:18px;color:var(--accent-em)}

  .quick{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .qcard{
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    border-radius:18px;padding:20px;
    text-decoration:none;color:var(--text-main);
    transition:.2s;cursor:pointer;
    backdrop-filter:blur(16px);
    display:flex;flex-direction:column;gap:14px;
  }
  .qcard:hover{background:var(--surface-glass-strong);border-color:var(--accent);transform:translateY(-3px)}
  .qcard .iconbox{width:42px;height:42px;border-radius:12px;background:var(--icon-tint);display:grid;place-items:center;color:var(--accent-em)}
  .qcard h3{margin:0 0 4px;font-size:14.5px;font-weight:600;color:var(--text-main)}
  .qcard p{margin:0;font-size:12.5px;color:var(--text-faint);line-height:1.4}

  .two-col{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;margin-top:14px}
  .panel{
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    border-radius:20px;padding:22px;
    backdrop-filter:blur(16px);
  }
  .panel h3{margin:0 0 16px;font-size:14px;font-weight:600;color:var(--text-main);display:flex;justify-content:space-between;align-items:center}
  .panel h3 a{font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:var(--accent-em);text-decoration:none;font-weight:600}
  .panel h3 a:hover{opacity:.75}
  .empty-panel{font-size:13px;color:var(--text-faint);padding:18px 0;text-align:center;line-height:1.5}
  .tl-item{display:flex;gap:14px;padding:10px 0;border-bottom:1px solid var(--border-glass)}
  .tl-item:last-child{border-bottom:none}
  .tl-time{font-size:11.5px;color:var(--text-faint);min-width:70px;padding-top:2px;letter-spacing:.02em}
  .tl-body{font-size:13.5px;color:var(--text-muted);line-height:1.45;flex:1}
  .tl-body b{color:var(--text-main);font-weight:600}
  .tl-dot{width:8px;height:8px;border-radius:50%;background:var(--accent-em);margin-top:7px;flex-shrink:0}

  .suggestion{display:flex;flex-direction:column}
  .suggestion .sugg-icon{
    width:48px;height:48px;border-radius:14px;
    background:var(--icon-tint);color:var(--accent-em);
    display:grid;place-items:center;margin-bottom:14px;
  }
  .suggestion .sugg-text{margin:0 0 18px;font-size:14.5px;line-height:1.5;color:var(--text-muted);flex:1}
  .suggestion .sugg-text b{color:var(--text-main);font-weight:600}
  .suggestion .sugg-cta{
    display:inline-flex;align-items:center;gap:8px;
    color:var(--accent-em);font-size:13.5px;font-weight:600;
    text-decoration:none;
  }
  .suggestion .sugg-cta:hover{opacity:.75}

  .learned{
    margin-top:18px;
    display:flex;align-items:center;gap:18px;
    background:var(--surface-glass);
    border:1px solid var(--border-glass);
    border-radius:20px;padding:18px 22px;
    backdrop-filter:blur(16px);
  }
  .learned .iconbox{
    width:46px;height:46px;border-radius:14px;background:var(--icon-tint);
    display:grid;place-items:center;color:var(--accent-em);flex-shrink:0;
  }
  .learned .txt{flex:1;min-width:0}
  .learned .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint);margin-bottom:4px}
  .learned p{margin:0;color:var(--text-muted);font-size:13.5px;line-height:1.45}

  @media (max-width:1100px){
    .stats{grid-template-columns:1fr 1fr}
    .quick{grid-template-columns:1fr 1fr}
    .two-col{grid-template-columns:1fr}
  }
`
