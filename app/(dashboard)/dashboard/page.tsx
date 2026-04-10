'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  FlaskConical,
  SlidersHorizontal,
  TestTube2,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Library,
  Lightbulb,
  Microscope,
  FileDown,
} from 'lucide-react'

interface Formulacao {
  id: string
  nome: string
  created_at: string
}

const DICAS_MIA = [
  'Xantana a 0,5% combinada com goma guar a 0,3% cria sinergia estrutural — yield stress até 40% maior que cada uma isolada.',
  'Para pastas proteicas plant-based, HPMC a 2% garante gelificação térmica reversível: flui na seringa fria e estrutura com calor.',
  'Altura de camada ótima = 50–80% do diâmetro do bico. Para 0,8 mm, use 0,4–0,65 mm para máxima adesão entre camadas.',
  'Gelatinize o amido antes de adicionar o hidrocolóide — estruturas de amido pré-formadas melhoram a rede do gel final.',
  'Bolhas de ar são inimigo nº 1 da extrusão. Centrifugue o material a 500 rpm por 2 min antes de encher o cartucho.',
  'Infill aberto (20–30%) → textura crocante após cocção. Infill fechado (80–100%) → textura macia e mastigável.',
  'Para diagnóstico de colapso, verifique primeiro o yield stress: se τ₀ < 50 Pa, a estrutura não sustenta o próprio peso.',
]

const ACOES_RAPIDAS = [
  { href: '/formular',     icon: FlaskConical,      label: 'Nova Formulação',     desc: 'Crie ou gere com a MIA',         iconBg: '#003223', iconFg: 'white' },
  { href: '/parametros',   icon: SlidersHorizontal, label: 'Calcular Parâmetros', desc: 'G-code e parâmetros otimizados', iconBg: '#516600', iconFg: 'white' },
  { href: '/experimentos', icon: TestTube2,          label: 'Novo Experimento',    desc: 'Log de impressão + diagnóstico', iconBg: '#c8ee4f', iconFg: '#003223' },
  { href: '/chat',         icon: MessageSquare,     label: 'Chat com MIA',        desc: 'Consulta direta à IA',           iconBg: '#571000', iconFg: 'white' },
]

const WORKFLOW_STEPS = [
  { label: 'Formular',       href: '/formular',       step: '1', icon: FlaskConical },
  { label: 'Formulações',    href: '/formulacoes',    step: '2', icon: BookOpen },
  { label: 'Parâmetros',     href: '/parametros',     step: '3', icon: SlidersHorizontal },
  { label: 'Experimentos',   href: '/experimentos',   step: '4', icon: TestTube2 },
  { label: 'Caracterização', href: '/caracterizacao', step: '5', icon: Microscope },
  { label: 'Protocolos',     href: '/protocolos',     step: '6', icon: FileDown },
]

function formatarData(iso: string) {
  const d = new Date(iso)
  const agora = new Date()
  const diffDias = Math.floor((agora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'hoje'
  if (diffDias === 1) return 'ontem'
  if (diffDias < 7) return `há ${diffDias} dias`
  if (diffDias < 30) return `há ${Math.floor(diffDias / 7)} sem.`
  return d.toLocaleDateString('pt-BR')
}

export default function DashboardPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [qtdExperimentos, setQtdExperimentos] = useState(0)
  const [carregando, setCarregando] = useState(true)

  const dica = useMemo(() => DICAS_MIA[Math.floor(Math.random() * DICAS_MIA.length)], [])

  useEffect(() => {
    fetch('/api/formulacoes')
      .then(r => r.json())
      .then(data => setFormulacoes(data || []))
      .finally(() => setCarregando(false))

    try {
      const exp = JSON.parse(localStorage.getItem('mia_experimentos') || '[]')
      setQtdExperimentos(Array.isArray(exp) ? exp.length : 0)
    } catch { /* ignore */ }
  }, [])

  const recentes = formulacoes.slice(0, 4)

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>

      {/* Banner de boas-vindas */}
      <div className="relative overflow-hidden" style={{ background: '#fff2da', borderBottom: '1px solid #e5d9c1' }}>
        <div className="absolute top-[-20%] right-8 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(200,238,79,0.12)' }} />
        <div className="relative px-8 py-7 max-w-5xl mx-auto flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} style={{ color: '#516600' }} />
              <span className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color: '#707974' }}>Morphê Foods</span>
            </div>
            <h1 className="font-display font-bold text-2xl mb-1.5" style={{ color: '#003223', letterSpacing: '-0.02em' }}>
              Olá! A MIA está pronta.
            </h1>
            <p className="text-sm font-sans max-w-md leading-relaxed" style={{ color: '#58413c' }}>
              Sua assistente de impressão 3D de alimentos. Formule, calcule parâmetros, diagnostique e exporte.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-tonal-sm">
            <span className="status-online" />
            <span className="text-xs font-display font-semibold" style={{ color: '#516600' }}>MIA Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Formulações',  valor: carregando ? '—' : String(formulacoes.length), icon: FlaskConical, iconBg: '#003223', iconFg: 'white' },
            { label: 'Experimentos', valor: String(qtdExperimentos),                       icon: TestTube2,    iconBg: '#516600', iconFg: 'white' },
            { label: 'Biblioteca',   valor: '6 tópicos',                                   icon: Library,      iconBg: '#c8ee4f', iconFg: '#003223' },
            { label: 'Modelo IA',    valor: 'Gemini 2.0',                                  icon: Sparkles,     iconBg: '#571000', iconFg: 'white' },
          ].map(({ label, valor, icon: Icon, iconBg, iconFg }) => (
            <div key={label} className="bg-white p-4 rounded-2xl shadow-tonal">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: iconBg }}>
                <Icon size={14} style={{ color: iconFg }} />
              </div>
              <p className="font-display font-bold text-2xl" style={{ color: '#003223' }}>{valor}</p>
              <p className="text-xs font-sans mt-0.5" style={{ color: '#707974' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Ações rápidas + Formulações recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <div className="bg-white p-5 rounded-2xl shadow-tonal">
            <h2 className="font-display font-bold text-base mb-4" style={{ color: '#003223' }}>Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              {ACOES_RAPIDAS.map(({ href, icon: Icon, label, desc, iconBg, iconFg }) => (
                <Link key={href} href={href}
                  className="flex flex-col gap-2.5 p-4 rounded-xl transition-all duration-200 hover:shadow-tonal hover:scale-[1.02]"
                  style={{ background: '#fff2da' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: iconBg }}>
                    <Icon size={15} style={{ color: iconFg }} />
                  </div>
                  <div>
                    <p className="text-xs font-display font-semibold leading-tight" style={{ color: '#003223' }}>{label}</p>
                    <p className="text-[11px] font-sans mt-0.5 leading-tight" style={{ color: '#707974' }}>{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-tonal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base" style={{ color: '#003223' }}>Formulações recentes</h2>
              <Link href="/formulacoes" className="text-xs font-display font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: '#516600' }}>
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>

            {carregando ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
              </div>
            ) : recentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: '#fff2da' }}>
                  <BookOpen size={20} style={{ color: '#bfc9c2' }} />
                </div>
                <p className="text-sm font-sans mb-1" style={{ color: '#58413c' }}>Nenhuma formulação ainda</p>
                <p className="text-xs font-sans mb-4" style={{ color: '#707974' }}>Crie sua primeira com a MIA</p>
                <Link href="/formular" className="btn-primary text-xs px-4 py-2">
                  Criar formulação
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentes.map(f => (
                  <Link key={f.id} href="/formulacoes"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff2da')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#003223' }} />
                      <span className="text-sm font-sans truncate" style={{ color: '#211b0c' }}>{f.nome}</span>
                    </div>
                    <span className="text-xs font-sans flex-shrink-0 ml-2" style={{ color: '#707974' }}>{formatarData(f.created_at)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dica da MIA */}
        <div className="p-5 rounded-2xl" style={{ background: '#f9edd4', borderLeft: '3px solid #003223' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: '#003223' }}>
              <Lightbulb size={15} style={{ color: 'white' }} />
            </div>
            <div>
              <p className="text-xs font-display font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#516600' }}>Dica da MIA</p>
              <p className="text-sm font-sans leading-relaxed" style={{ color: '#58413c' }}>{dica}</p>
            </div>
          </div>
        </div>

        {/* Fluxo de trabalho */}
        <div className="bg-white p-5 rounded-2xl shadow-tonal">
          <h2 className="font-display font-bold text-base mb-4" style={{ color: '#003223' }}>Fluxo de trabalho</h2>
          <div className="flex items-center gap-1.5 flex-wrap">
            {WORKFLOW_STEPS.map(({ label, href, step, icon: Icon }, i, arr) => (
              <div key={href} className="flex items-center gap-1.5">
                <Link href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all duration-150"
                  style={{ background: '#fff2da', color: '#003223' }}>
                  <span className="text-[10px] font-bold opacity-50">{step}</span>
                  <Icon size={11} />
                  <span>{label}</span>
                </Link>
                {i < arr.length - 1 && <ArrowRight size={10} style={{ color: '#bfc9c2' }} className="flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
