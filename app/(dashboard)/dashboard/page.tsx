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
  { href: '/formular', icon: FlaskConical, label: 'Nova Formulação', desc: 'Crie ou gere uma formulação com a MIA', cor: 'text-morphe-orange', bg: 'bg-morphe-orange/10 border-morphe-orange/20' },
  { href: '/parametros', icon: SlidersHorizontal, label: 'Calcular Parâmetros', desc: 'Obtenha parâmetros e G-code otimizados', cor: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { href: '/experimentos', icon: TestTube2, label: 'Registrar Experimento', desc: 'Log de impressões e diagnóstico MIA', cor: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  { href: '/chat', icon: MessageSquare, label: 'Chat com MIA', desc: 'Converse diretamente com a inteligência', cor: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
]

function formatarData(iso: string) {
  const d = new Date(iso)
  const agora = new Date()
  const diffMs = agora.getTime() - d.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'hoje'
  if (diffDias === 1) return 'ontem'
  if (diffDias < 7) return `há ${diffDias} dias`
  if (diffDias < 30) return `há ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) > 1 ? 's' : ''}`
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
    <div className="h-full overflow-y-auto">
      {/* Banner de boas-vindas */}
      <div className="bg-gradient-to-r from-morphe-dark-2 via-morphe-dark-2 to-morphe-dark border-b border-border px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-morphe-orange" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Morphê Foods</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Olá! A MIA está pronta.
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Sua assistente de impressão 3D de alimentos. Formule, calcule parâmetros, diagnostique e exporte — tudo em um lugar.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-morphe-dark border border-border rounded-xl px-4 py-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">MIA Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Formulações', valor: carregando ? '—' : String(formulacoes.length), icon: FlaskConical, cor: 'text-morphe-orange' },
            { label: 'Experimentos', valor: String(qtdExperimentos), icon: TestTube2, cor: 'text-green-400' },
            { label: 'Biblioteca', valor: '6 tópicos', icon: Library, cor: 'text-blue-400' },
            { label: 'Modelo IA', valor: 'Gemini 2.0', icon: Sparkles, cor: 'text-purple-400' },
          ].map(({ label, valor, icon: Icon, cor }) => (
            <div key={label} className="bg-morphe-dark-2 border border-border rounded-xl p-4">
              <Icon size={14} className={`${cor} mb-2`} />
              <p className={`text-xl font-bold ${cor}`}>{valor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Ações rápidas + Formulações recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ações rápidas */}
          <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              {ACOES_RAPIDAS.map(({ href, icon: Icon, label, desc, cor, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex flex-col gap-2 p-3 rounded-xl border ${bg} hover:opacity-80 transition-opacity`}
                >
                  <Icon size={18} className={cor} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Formulações recentes */}
          <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Formulações recentes</h2>
              <Link href="/formulacoes" className="text-xs text-morphe-orange hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>
            {carregando ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-morphe-dark rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen size={28} className="text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Nenhuma formulação ainda</p>
                <p className="text-xs text-muted-foreground/60 mb-4">Crie sua primeira formulação com a ajuda da MIA</p>
                <Link href="/formular" className="text-xs bg-morphe-orange hover:bg-morphe-orange-hover text-white px-4 py-2 rounded-lg transition-colors">
                  Criar formulação
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentes.map(f => (
                  <Link
                    key={f.id}
                    href="/formulacoes"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-morphe-dark-3 border border-transparent hover:border-border transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 bg-morphe-orange rounded-full flex-shrink-0" />
                      <span className="text-sm truncate">{f.nome}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatarData(f.created_at)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dica da MIA */}
        <div className="bg-morphe-dark-2 border border-morphe-orange/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-morphe-orange/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={14} className="text-morphe-orange" />
            </div>
            <div>
              <p className="text-xs font-semibold text-morphe-orange mb-1">Dica da MIA</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{dica}</p>
            </div>
          </div>
        </div>

        {/* Fluxo de trabalho */}
        <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Fluxo de trabalho</h2>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: 'Formular', href: '/formular', step: '1' },
              { label: 'Formulações', href: '/formulacoes', step: '2' },
              { label: 'Parâmetros', href: '/parametros', step: '3' },
              { label: 'Experimentos', href: '/experimentos', step: '4' },
              { label: 'Caracterização', href: '/caracterizacao', step: '5' },
              { label: 'Protocolos', href: '/protocolos', step: '6' },
            ].map(({ label, href, step }, i, arr) => (
              <div key={href} className="flex items-center gap-1">
                <Link href={href} className="flex items-center gap-1.5 bg-morphe-dark border border-border hover:border-morphe-orange/30 px-3 py-1.5 rounded-lg text-xs transition-colors group">
                  <span className="text-[10px] font-bold text-morphe-orange/70">{step}</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                </Link>
                {i < arr.length - 1 && <ArrowRight size={12} className="text-muted-foreground/30 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
