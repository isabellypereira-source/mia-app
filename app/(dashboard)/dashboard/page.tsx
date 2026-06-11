'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Sparkles, FlaskConical, SlidersHorizontal, TestTube2,
  MessageSquare, ArrowRight, BookOpen, Library,
  Lightbulb, Microscope, FileDown, Wifi, WifiOff, ChevronRight,
} from 'lucide-react'
import { useAgentConnected } from '@/lib/hooks/useAgentConnected'

interface Formulacao { id: string; nome: string; created_at: string }

const DICAS_MIA = [
  'Xantana a 0,5% combinada com goma guar a 0,3% cria sinergia estrutural — yield stress até 40% maior que cada uma isolada.',
  'Para pastas proteicas plant-based, HPMC a 2% garante gelificação térmica reversível: flui na seringa fria e estrutura com calor.',
  'Altura de camada ótima = 50–80% do diâmetro do bico. Para 0,8 mm, use 0,4–0,65 mm para máxima adesão entre camadas.',
  'Gelatinize o amido antes de adicionar o hidrocolóide — estruturas de amido pré-formadas melhoram a rede do gel final.',
  'Bolhas de ar são inimigo nº 1 da extrusão. Centrifugue o material a 500 rpm por 2 min antes de encher o cartucho.',
  'Infill aberto (20–30%) → textura crocante após cocção. Infill fechado (80–100%) → textura macia e mastigável.',
  'Para diagnóstico de colapso, verifique primeiro o yield stress: se τ₀ < 50 Pa, a estrutura não sustenta o próprio peso.',
]

const ACOES = [
  { href: '/formular',     icon: FlaskConical,      label: 'Nova Formulação',     desc: 'Gere com IA ou crie manualmente',  color: '#054a37', accent: '#abd032' },
  { href: '/parametros',   icon: SlidersHorizontal, label: 'Calcular Parâmetros', desc: 'G-code e parâmetros otimizados',   color: '#196454', accent: '#abd032' },
  { href: '/experimentos', icon: TestTube2,          label: 'Experimentos',        desc: 'Log de impressão + diagnóstico',   color: '#abd032', accent: '#054a37' },
  { href: '/chat',         icon: MessageSquare,     label: 'Chat com MIA',        desc: 'Consulta direta à IA',            color: '#000000', accent: '#abd032' },
]

const WORKFLOW = [
  { label: 'Formular',       href: '/formular',       n: '01', icon: FlaskConical },
  { label: 'Formulações',    href: '/formulacoes',    n: '02', icon: BookOpen },
  { label: 'Parâmetros',     href: '/parametros',     n: '03', icon: SlidersHorizontal },
  { label: 'Experimentos',   href: '/experimentos',   n: '04', icon: TestTube2 },
  { label: 'Caracterização', href: '/caracterizacao', n: '05', icon: Microscope },
  { label: 'Protocolos',     href: '/protocolos',     n: '06', icon: FileDown },
]

function formatarData(iso: string) {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  if (diff < 7) return `há ${diff} dias`
  return d.toLocaleDateString('pt-BR')
}

// Contador animado
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const dur = 1400
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setV(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to])
  return <>{v}{suffix}</>
}

// Hook de reveal por IntersectionObserver
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, vis }
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, vis } = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { connected: agentConnected, lastSeen: agentLastSeen, loading: agentLoading } = useAgentConnected()
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const dica = useMemo(() => DICAS_MIA[Math.floor(Math.random() * DICAS_MIA.length)], [])

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || [])).finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <style>{`
        @keyframes shimmer-line {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .action-card { transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, background 0.25s ease; }
        .action-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 20px 48px rgba(5,74,55,0.15); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(5,74,55,0.1); }
        .workflow-step { transition: background 0.2s, color 0.2s, transform 0.2s; }
        .workflow-step:hover { background: #054a37 !important; color: #fff1d9 !important; transform: translateY(-2px); }
        .workflow-step:hover span { color: #abd032 !important; }
        .recent-row { transition: background 0.15s, padding-left 0.2s; }
        .recent-row:hover { background: rgba(5,74,55,0.05) !important; padding-left: 20px !important; }
      `}</style>

      <div className="h-full overflow-y-auto" style={{ background: '#fff1d9' }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ background: '#054a37' }}>
          {/* Orbs */}
          <div className="absolute top-[-30%] right-[-5%] w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'rgba(171,208,50,0.12)', filter: 'blur(64px)', animation: 'float-slow 8s ease-in-out infinite' }} />
          <div className="absolute bottom-[-20%] left-[30%] w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'rgba(25,100,84,0.4)', filter: 'blur(48px)', animation: 'float-slow 6s ease-in-out infinite reverse' }} />

          <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#abd032', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(171,208,50,0.7)' }}>
                    Morphê Foods · The Living Lab
                  </span>
                </div>
                <h1 className="font-black mb-3 leading-none" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#fff1d9', letterSpacing: '-0.03em' }}>
                  Olá! A <span style={{ color: '#abd032' }}>MIA</span> está pronta.
                </h1>
                <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'rgba(255,241,217,0.6)' }}>
                  Sua assistente de impressão 3D de alimentos — de hidrocolóides a G-code.
                </p>
              </div>

              {/* Status badges */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ background: 'rgba(171,208,50,0.12)', border: '1px solid rgba(171,208,50,0.2)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#abd032', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  <span className="text-xs font-bold" style={{ color: '#abd032' }}>MIA Online</span>
                </div>
                {!agentLoading && (
                  agentConnected ? (
                    <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                      style={{ background: 'rgba(255,241,217,0.08)', border: '1px solid rgba(255,241,217,0.12)' }}>
                      <Wifi size={12} style={{ color: '#abd032' }} />
                      <span className="text-xs" style={{ color: 'rgba(255,241,217,0.7)' }}>Slicer conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                      style={{ background: 'rgba(255,241,217,0.04)', border: '1px solid rgba(255,241,217,0.08)' }}>
                      <WifiOff size={12} style={{ color: 'rgba(255,241,217,0.3)' }} />
                      <span className="text-xs" style={{ color: 'rgba(255,241,217,0.3)' }}>Slicer desconectado</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { n: formulacoes.length, s: '', label: 'Formulações', loading: carregando },
                { n: 6, s: '', label: 'Protocolos' },
                { n: 99, s: '%', label: 'Precisão' },
                { n: 1, s: '', label: agentConnected ? 'Slicer ativo' : 'Modelos IA' },
              ].map(({ n, s, label, loading }) => (
                <div key={label} className="stat-card rounded-2xl px-5 py-4 cursor-default"
                  style={{ background: 'rgba(255,241,217,0.06)', border: '1px solid rgba(255,241,217,0.1)' }}>
                  <p className="font-black text-2xl mb-0.5" style={{ color: '#abd032' }}>
                    {loading ? '—' : <Counter to={n} suffix={s} />}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,241,217,0.4)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

          {/* ── AÇÕES RÁPIDAS ────────────────────────────────────────── */}
          <RevealSection>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl" style={{ color: '#054a37', letterSpacing: '-0.02em' }}>Ações rápidas</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {ACOES.map(({ href, icon: Icon, label, desc, color, accent }) => {
                const hovered = hoveredAction === href
                return (
                  <Link key={href} href={href}
                    onMouseEnter={() => setHoveredAction(href)}
                    onMouseLeave={() => setHoveredAction(null)}
                    className="action-card flex flex-col justify-between p-5 rounded-2xl min-h-[148px]"
                    style={{
                      background: hovered ? color : '#fff',
                      border: `1.5px solid ${hovered ? color : 'rgba(5,74,55,0.08)'}`,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: hovered ? `${accent}22` : `${color}12` }}>
                      <Icon size={18} style={{ color: hovered ? accent : color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 leading-tight"
                        style={{ color: hovered ? (color === '#abd032' ? '#054a37' : '#fff1d9') : '#054a37' }}>
                        {label}
                      </p>
                      <p className="text-[11px] leading-snug"
                        style={{ color: hovered ? (color === '#abd032' ? 'rgba(5,74,55,0.6)' : 'rgba(255,241,217,0.55)') : 'rgba(5,74,55,0.4)' }}>
                        {desc}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </RevealSection>

          {/* ── FORMULAÇÕES + DICA ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Formulações recentes */}
            <RevealSection className="lg:col-span-3" delay={50}>
              <div className="rounded-2xl overflow-hidden h-full"
                style={{ background: '#fff', border: '1.5px solid rgba(5,74,55,0.08)' }}>
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(5,74,55,0.06)' }}>
                  <h2 className="font-black text-base" style={{ color: '#054a37', letterSpacing: '-0.02em' }}>Formulações recentes</h2>
                  <Link href="/formulacoes" className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-60"
                    style={{ color: '#abd032' }}>
                    Ver todas <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="p-2">
                  {carregando ? (
                    <div className="space-y-1 p-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(5,74,55,0.04)' }} />
                      ))}
                    </div>
                  ) : formulacoes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: 'rgba(171,208,50,0.1)' }}>
                        <BookOpen size={20} style={{ color: '#abd032' }} />
                      </div>
                      <p className="text-sm font-bold mb-1" style={{ color: '#054a37' }}>Nenhuma formulação ainda</p>
                      <p className="text-xs mb-5" style={{ color: 'rgba(5,74,55,0.4)' }}>Crie sua primeira com a MIA</p>
                      <Link href="/formular"
                        className="text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                        style={{ background: '#054a37', color: '#fff1d9' }}>
                        Criar formulação →
                      </Link>
                    </div>
                  ) : (
                    formulacoes.slice(0, 6).map(f => (
                      <Link key={f.id} href="/formulacoes"
                        className="recent-row flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: 'transparent', paddingLeft: 16 }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(171,208,50,0.12)' }}>
                            <FlaskConical size={11} style={{ color: '#abd032' }} />
                          </div>
                          <span className="text-sm font-medium truncate" style={{ color: '#054a37' }}>{f.nome}</span>
                        </div>
                        <span className="text-[11px] flex-shrink-0 ml-3" style={{ color: 'rgba(5,74,55,0.35)' }}>
                          {formatarData(f.created_at)}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </RevealSection>

            {/* Dica da MIA */}
            <RevealSection className="lg:col-span-2" delay={100}>
              <div className="rounded-2xl p-6 h-full flex flex-col"
                style={{ background: '#054a37', minHeight: 220 }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(171,208,50,0.15)' }}>
                    <Lightbulb size={13} style={{ color: '#abd032' }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(171,208,50,0.6)' }}>
                    Dica da MIA
                  </span>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,241,217,0.8)' }}>{dica}</p>
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(171,208,50,0.12)' }}>
                  <Link href="/chat" className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
                    style={{ color: '#abd032' }}>
                    <Sparkles size={11} /> Perguntar à MIA
                  </Link>
                </div>
              </div>
            </RevealSection>
          </div>

          {/* ── FLUXO DE TRABALHO ────────────────────────────────────── */}
          <RevealSection delay={150}>
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1.5px solid rgba(5,74,55,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-base" style={{ color: '#054a37', letterSpacing: '-0.02em' }}>Fluxo de trabalho</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(5,74,55,0.3)' }}>
                  6 etapas
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {WORKFLOW.map(({ label, href, n, icon: Icon }, i, arr) => (
                  <div key={href} className="flex items-center gap-2">
                    <Link href={href}
                      className="workflow-step flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: 'rgba(5,74,55,0.05)', color: '#054a37' }}>
                      <span className="text-[10px] font-black" style={{ color: '#abd032' }}>{n}</span>
                      <Icon size={12} />
                      <span className="text-xs font-bold">{label}</span>
                    </Link>
                    {i < arr.length - 1 && (
                      <ArrowRight size={10} style={{ color: 'rgba(5,74,55,0.2)' }} className="flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

        </div>
      </div>
    </>
  )
}
