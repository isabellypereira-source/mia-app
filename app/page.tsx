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
    color: 'text-morphe-orange',
    glow: 'bg-morphe-orange/10 border-morphe-orange/20',
  },
  {
    icon: Microscope,
    title: 'Diagnóstico de Problemas',
    desc: 'Identifica causas de entupimento, colapso estrutural, filamento irregular e outros defeitos comuns de extrusão.',
    color: 'text-morphe-viva',
    glow: 'bg-morphe-viva/10 border-morphe-viva/20',
  },
  {
    icon: FileDown,
    title: 'Exporta Ficha Técnica',
    desc: 'Gera ficha técnica e POP em PDF com ingredientes, processo produtivo e tabela nutricional TACO.',
    color: 'text-morphe-alma',
    glow: 'bg-morphe-alma/10 border-morphe-alma/20',
  },
]

const WORKFLOW = [
  { step: '1', icon: FlaskConical, label: 'Formulação', desc: 'Crie ou gere com IA' },
  { step: '2', icon: BarChart3, label: 'Análise', desc: 'Nutricional e ANVISA' },
  { step: '3', icon: SlidersHorizontal, label: 'Parâmetros', desc: 'G-code otimizado' },
  { step: '4', icon: TestTube2, label: 'Experimento', desc: 'Log e diagnóstico' },
  { step: '5', icon: Microscope, label: 'Caracterização', desc: 'Dados reológicos' },
  { step: '6', icon: FileDown, label: 'Protocolo', desc: 'Export em PDF' },
]

const STATS = [
  { value: '12+', label: 'Hidrocolóides mapeados' },
  { value: '6', label: 'Etapas de workflow' },
  { value: '100%', label: 'Focado em food 3D' },
  { value: 'TACO', label: 'Base nutricional' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-morphe-dark overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-morphe-dark/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-morphe-orange rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">MIA</span>
            <span className="text-muted-foreground text-xs hidden sm:block">by Morphê Foods</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-morphe-dark-2/60">
              Entrar
            </Link>
            <Link href="/signup" className="btn-glow text-sm px-5 py-2.5">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative hero-glow flex flex-col items-center justify-center text-center px-6 pt-28 pb-32">
        {/* Glow de fundo extra */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-morphe-orange/5 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="badge-pill-orange mb-8 animate-slide-up">
            <span className="status-online" />
            IA especializada em impressão 3D de alimentos
          </div>

          {/* H1 Display */}
          <h1 className="text-display-sm md:text-display font-bold tracking-tight text-foreground max-w-4xl leading-[1.05] animate-slide-up animate-delay-100">
            Formule com precisão.{' '}
            <span className="text-morphe-orange">Imprima com confiança.</span>
          </h1>

          <p className="mt-7 text-[17px] leading-relaxed text-muted-foreground max-w-2xl animate-slide-up animate-delay-200">
            A MIA analisa formulações, sugere hidrocolóides, calcula parâmetros de impressão,
            diagnostica problemas e gera fichas técnicas — com base em ciência de alimentos e reologia.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-10 animate-slide-up animate-delay-300">
            <Link href="/signup" className="btn-glow px-8 py-3.5 text-base">
              Começar grátis
            </Link>
            <Link href="/chat" className="btn-outline px-8 py-3.5 text-base flex items-center gap-2">
              Ver demo <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-slide-up animate-delay-400">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-morphe-orange">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── (Ancestral) */}
      <section className="section-alt py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-morphe-orange mb-3">Capacidades</p>
            <h2 className="text-4xl font-semibold text-foreground">Tudo que você precisa</h2>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-lg mx-auto">
              Da formulação à ficha técnica, a MIA acompanha cada etapa do seu processo de impressão 3D de alimentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card-depth p-7 flex flex-col gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${f.glow}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── (Respiro) */}
      <section className="py-24 px-6 bg-morphe-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-morphe-viva mb-3">Workflow</p>
            <h2 className="text-4xl font-semibold text-foreground">6 etapas, 1 plataforma</h2>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-lg mx-auto">
              Um fluxo estruturado do laboratório ao protocolo final, com IA em cada passo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {WORKFLOW.map((w, i) => (
              <div
                key={w.step}
                className="card-depth p-5 flex flex-col items-center text-center gap-3 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-9 h-9 rounded-full bg-morphe-orange/15 border border-morphe-orange/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-morphe-orange">{w.step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{w.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ── (Ancestral) */}
      <section className="section-alt py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-morphe-orange mb-4">Por que MIA?</p>
              <h2 className="text-4xl font-semibold text-foreground leading-snug mb-6">
                Ciência de alimentos<br />integrada à IA
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                Diferente de assistentes genéricos, a MIA foi treinada com conhecimento profundo
                em reologia, hidrocolóides, extrusão e conformidade ANVISA.
                Cada sugestão tem base técnica.
              </p>
              <Link href="/signup" className="btn-glow inline-flex items-center gap-2 px-7 py-3 text-sm">
                Criar conta gratuita <ArrowRight size={15} />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { icon: Zap, title: 'Respostas fundamentadas', desc: 'Base de conhecimento em ciência de alimentos, não dados genéricos da internet.' },
                { icon: Shield, title: 'Conformidade ANVISA', desc: 'Análise de conformidade regulatória integrada ao fluxo de formulação.' },
                { icon: BarChart3, title: 'Tabela nutricional TACO', desc: 'Estimativa nutricional automática com base na tabela TACO do UNICAMP.' },
              ].map((d, i) => (
                <div
                  key={d.title}
                  className="card-depth flex items-start gap-4 p-5 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-morphe-orange/10 border border-morphe-orange/20 flex items-center justify-center flex-shrink-0">
                    <d.icon size={18} className="text-morphe-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{d.title}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── (Respiro) */}
      <section className="relative py-28 px-6 bg-morphe-dark overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-morphe-orange/8 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="badge-pill-viva mb-6 mx-auto w-fit">
            Grátis para começar
          </div>
          <h2 className="text-4xl font-semibold text-foreground mb-5">
            Pronto para formular melhor?
          </h2>
          <p className="text-[15px] text-muted-foreground mb-10 leading-relaxed">
            Crie sua conta e comece a usar a MIA hoje. Sem cartão de crédito, sem configuração complexa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="btn-glow px-8 py-3.5 text-base">
              Criar conta gratuita
            </Link>
            <Link href="/login" className="btn-outline px-8 py-3.5 text-base">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-morphe-dark px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-morphe-orange rounded flex items-center justify-center">
              <span className="text-white font-black text-[10px]">M</span>
            </div>
            <span className="text-sm font-semibold">MIA</span>
            <span className="text-muted-foreground text-xs">by Morphê Foods</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Morphê Foods · MIA v0.1 · Todos os direitos reservados</p>
        </div>
      </footer>
    </main>
  )
}
