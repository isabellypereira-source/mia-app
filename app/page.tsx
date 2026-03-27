import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-morphe-dark flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-morphe-orange font-bold text-xl tracking-tight">MIA</span>
          <span className="text-muted-foreground text-sm">by Morphê Foods</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Entrar
          </Link>
          <Link href="/signup" className="text-sm bg-morphe-orange hover:bg-morphe-orange-hover text-white font-medium px-4 py-2 rounded-md transition-colors">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-morphe-orange/10 border border-morphe-orange/25 text-morphe-orange text-xs px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-morphe-orange rounded-full animate-pulse" />
          IA especializada em impressão 3D de alimentos
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl leading-tight">
          Formule com precisão.<br />
          <span className="text-morphe-orange">Imprima com confiança.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          A MIA analisa formulações, sugere hidrocolóides, diagnostica problemas de impressão
          e gera fichas técnicas — com base em ciência de alimentos e reologia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link href="/signup" className="bg-morphe-orange hover:bg-morphe-orange-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base">
            Começar grátis
          </Link>
          <Link href="/chat" className="border border-border hover:border-morphe-orange/50 text-foreground px-8 py-3 rounded-lg transition-colors text-base">
            Ver demo
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
        {[
          { icon: '⚗️', title: 'Consultoria de formulação', desc: 'Análise reológica, seleção de hidrocolóides e otimização de sólidos totais.' },
          { icon: '🔍', title: 'Diagnóstico de problemas', desc: 'Identifica causas de entupimento, colapso estrutural e filamento irregular.' },
          { icon: '📄', title: 'Exporta ficha técnica', desc: 'Gera ficha técnica e POP em PDF com ingredientes, processo e tabela nutricional.' },
        ].map(f => (
          <div key={f.title} className="bg-morphe-dark-2 border border-border rounded-xl p-6 hover:border-morphe-orange/30 transition-colors">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-8 py-5 text-center text-xs text-muted-foreground">
        © 2025 Morphê Foods · MIA v0.1
      </footer>
    </main>
  )
}
