'use client'
import Link from 'next/link'
import {
  FlaskConical,
  SlidersHorizontal,
  TestTube2,
  ArrowRight,
  Microscope,
  FileDown,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react'

const FEATURES = [
  {
    icon: FlaskConical,
    title: 'Consultoria de Formulação',
    desc: 'Análise reológica completa, seleção de hidrocolóides e otimização de sólidos totais com base em ciência de alimentos.',
    iconBg: 'bg-[#003223]',
    iconColor: 'text-white',
  },
  {
    icon: Microscope,
    title: 'Diagnóstico de Problemas',
    desc: 'Identifica causas de entupimento, colapso estrutural, filamento irregular e outros defeitos comuns de extrusão.',
    iconBg: 'bg-[#c8ee4f]',
    iconColor: 'text-[#003223]',
  },
  {
    icon: FileDown,
    title: 'Exporta Ficha Técnica',
    desc: 'Gera ficha técnica e POP em PDF com ingredientes, processo produtivo e tabela nutricional TACO.',
    iconBg: 'bg-[#571000]',
    iconColor: 'text-white',
  },
]

const WORKFLOW = [
  { step: '01', icon: FlaskConical, label: 'Formulação', desc: 'Crie ou gere com IA' },
  { step: '02', icon: BarChart3, label: 'Análise', desc: 'Nutricional e ANVISA' },
  { step: '03', icon: SlidersHorizontal, label: 'Parâmetros', desc: 'G-code otimizado' },
  { step: '04', icon: TestTube2, label: 'Experimento', desc: 'Log e diagnóstico' },
  { step: '05', icon: Microscope, label: 'Caracterização', desc: 'Dados reológicos' },
  { step: '06', icon: FileDown, label: 'Protocolo', desc: 'Export em PDF' },
]

const STATS = [
  { value: '12+', label: 'Hidrocolóides mapeados' },
  { value: '6', label: 'Etapas de workflow' },
  { value: '100%', label: 'Focado em food 3D' },
  { value: 'TACO', label: 'Base nutricional' },
]

const DIFERENCIAIS = [
  { icon: Zap, title: 'Respostas fundamentadas', desc: 'Base de conhecimento em ciência de alimentos, não dados genéricos da internet.' },
  { icon: Shield, title: 'Conformidade ANVISA', desc: 'Análise de conformidade regulatória integrada ao fluxo de formulação.' },
  { icon: BarChart3, title: 'Tabela nutricional TACO', desc: 'Estimativa nutricional automática com base na tabela TACO do UNICAMP.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: '#fff8f1' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50" style={{
        background: 'rgba(255,248,241,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(191,201,194,0.35)',
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: '#003223' }}>M</div>
            <span className="font-display font-bold text-lg tracking-tight" style={{ color: '#003223' }}>MIA</span>
            <span className="text-xs font-sans hidden sm:block" style={{ color: '#707974' }}>by Morphê Foods</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-sans px-4 py-2 rounded-full transition-colors"
              style={{ color: '#58413c' }}
              onMouseOver={() => {}} >
              Entrar
            </Link>
            <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Radial lime glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 75% 55% at 60% 0%, rgba(200,238,79,0.16) 0%, transparent 65%)',
        }} />
        {/* Organic blob right */}
        <div className="absolute top-0 right-0 w-[50%] h-full pointer-events-none overflow-hidden hidden lg:block">
          <div className="absolute top-[-10%] right-[-15%] w-[130%] h-[120%]"
            style={{ borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', background: 'linear-gradient(135deg, #f9edd4 0%, #e5d9c1 100%)' }} />
          <div className="absolute top-[15%] right-[-5%] w-[75%] h-[70%]"
            style={{ borderRadius: '50% 50% 40% 60% / 50% 60% 40% 50%', background: 'rgba(200,238,79,0.09)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="animate-slide-up">
            <div className="badge-lime mb-7 inline-flex items-center gap-1.5">
              <span className="status-online" />
              IA especializada em impressão 3D de alimentos
            </div>

            <h1 className="font-display font-bold leading-[1.02] mb-6"
              style={{ fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', letterSpacing: '-0.025em', color: '#003223' }}>
              Formule com<br />
              <span className="text-gradient">precisão.</span><br />
              Imprima com confiança.
            </h1>

            <p className="text-lg leading-relaxed mb-10 max-w-lg font-sans" style={{ color: '#58413c' }}>
              A MIA analisa formulações, sugere hidrocolóides, calcula parâmetros de impressão,
              diagnostica problemas e gera fichas técnicas — com base em ciência de alimentos e reologia.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link href="/signup" className="btn-lime text-base px-7 py-3.5">
                Começar grátis
              </Link>
              <Link href="/chat" className="btn-ghost text-base px-7 py-3.5 inline-flex items-center gap-2">
                Ver demo <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 pt-8" style={{ borderTop: '1px solid #e5d9c1' }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="font-display font-bold text-2xl" style={{ color: '#003223' }}>{s.value}</div>
                  <div className="text-xs mt-0.5 font-sans" style={{ color: '#707974' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating card preview */}
          <div className="hidden lg:block animate-fade-in animate-delay-200">
            <div className="relative">
              <div className="bg-white rounded-2xl p-7 shadow-tonal-lg">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-display font-bold text-lg" style={{ color: '#003223' }}>Salmão Bioativo v3</div>
                    <div className="text-xs mt-0.5 font-sans" style={{ color: '#707974' }}>Análise em tempo real · FORM-882</div>
                  </div>
                  <div className="badge-lime inline-flex items-center gap-1.5">
                    <span className="status-online" />A+ Estável
                  </div>
                </div>
                {[
                  { label: 'Viscosidade', val: 82, color: '#003223' },
                  { label: 'Proteína', val: 68, color: '#516600' },
                  { label: 'Estabilidade', val: 94, color: '#c8ee4f' },
                ].map(p => (
                  <div key={p.label} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium font-sans" style={{ color: '#58413c' }}>{p.label}</span>
                      <span className="font-display font-semibold" style={{ color: '#003223' }}>{p.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#f4e7ce' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.val}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-5 p-4 rounded-xl" style={{ background: '#f9edd4' }}>
                  <p className="text-xs leading-relaxed font-sans" style={{ color: '#58413c' }}>
                    💡 Integridade estrutural 22% superior nas últimas 14 bateladas.
                    Recomendo reduzir velocidade de extrusão para 95mm/s.
                  </p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(238,225,201,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(191,201,194,0.3)' }}>
                <div className="font-display font-bold text-sm" style={{ color: '#003223' }}>98.4%</div>
                <div className="text-[10px] font-sans" style={{ color: '#707974' }}>Estabilidade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6" style={{ background: '#fff2da' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 max-w-xl">
            <p className="font-display font-semibold text-xs uppercase tracking-widest mb-3" style={{ color: '#516600' }}>
              Capacidades
            </p>
            <h2 className="font-display font-bold mb-4"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: '#003223' }}>
              Tudo que você precisa
            </h2>
            <p className="text-[15px] leading-relaxed font-sans" style={{ color: '#58413c' }}>
              Da formulação à ficha técnica, a MIA acompanha cada etapa do seu processo de impressão 3D de alimentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="bg-white p-7 rounded-2xl shadow-tonal flex flex-col gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.iconBg} ${f.iconColor}`}>
                  <f.icon size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#003223' }}>{f.title}</h3>
                  <p className="text-[14px] leading-relaxed font-sans" style={{ color: '#58413c' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="py-24 px-6" style={{ background: '#fff8f1' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-display font-semibold text-xs uppercase tracking-widest mb-3" style={{ color: '#003223' }}>
              Workflow
            </p>
            <h2 className="font-display font-bold mb-4"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: '#003223' }}>
              6 etapas, 1 plataforma
            </h2>
            <p className="text-[15px] leading-relaxed font-sans max-w-lg mx-auto" style={{ color: '#58413c' }}>
              Um fluxo estruturado do laboratório ao protocolo final, com IA em cada passo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {WORKFLOW.map((w, i) => (
              <div key={w.step} className="p-5 rounded-2xl flex flex-col items-center text-center gap-3 animate-slide-up transition-shadow hover:shadow-tonal"
                style={{ background: i % 2 === 0 ? '#fff8f1' : '#fff2da', animationDelay: `${i * 80}ms` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display font-bold text-xs"
                  style={{ background: '#003223' }}>
                  {w.step}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold" style={{ color: '#003223' }}>{w.label}</p>
                  <p className="text-[11px] font-sans mt-0.5 leading-snug" style={{ color: '#707974' }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ── */}
      <section className="py-24 px-6" style={{ background: '#f9edd4' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-display font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: '#516600' }}>
                Por que MIA?
              </p>
              <h2 className="font-display font-bold leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: '#003223' }}>
                Ciência de alimentos<br />integrada à IA
              </h2>
              <p className="text-[15px] leading-relaxed mb-8 font-sans" style={{ color: '#58413c' }}>
                Diferente de assistentes genéricos, a MIA foi treinada com conhecimento profundo
                em reologia, hidrocolóides, extrusão e conformidade ANVISA.
                Cada sugestão tem base técnica.
              </p>
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-7 py-3">
                Criar conta gratuita <ArrowRight size={15} />
              </Link>
            </div>

            <div className="space-y-3">
              {DIFERENCIAIS.map((d, i) => (
                <div key={d.title} className="bg-white flex items-start gap-4 p-5 rounded-2xl shadow-tonal animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,50,35,0.08)' }}>
                    <d.icon size={18} style={{ color: '#003223' }} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm mb-1" style={{ color: '#003223' }}>{d.title}</p>
                    <p className="text-[13px] leading-relaxed font-sans" style={{ color: '#58413c' }}>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-16 px-6" style={{ background: '#fff8f1' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-14 text-center relative overflow-hidden" style={{ background: '#003223' }}>
            <div className="absolute top-[-20%] right-[-5%] w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'rgba(200,238,79,0.12)' }} />
            <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,248,241,0.05)' }} />
            <div className="relative">
              <div className="badge-lime mx-auto mb-5 inline-flex">Grátis para começar</div>
              <h2 className="font-display font-bold text-white mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}>
                Pronto para formular melhor?
              </h2>
              <p className="max-w-md mx-auto mb-10 text-[15px] leading-relaxed font-sans" style={{ color: '#b2f0d5' }}>
                Crie sua conta e comece a usar a MIA hoje. Sem cartão de crédito, sem configuração complexa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="btn-lime text-base px-8 py-3.5">
                  Criar conta gratuita
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center font-display font-semibold text-sm text-white rounded-full px-7 py-3.5 transition-colors hover:bg-white/10"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}>
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6" style={{ background: '#f9edd4', borderTop: '1px solid #e5d9c1' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-display font-black text-[10px]"
              style={{ background: '#003223' }}>M</div>
            <span className="font-display font-semibold text-sm" style={{ color: '#003223' }}>MIA</span>
            <span className="text-xs font-sans" style={{ color: '#707974' }}>by Morphê Foods</span>
          </div>
          <p className="text-xs font-sans" style={{ color: '#707974' }}>© 2025 Morphê Foods · MIA v0.1 · Todos os direitos reservados</p>
        </div>
      </footer>
    </main>
  )
}
