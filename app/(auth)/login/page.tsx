'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/formular')
    }
  }

  return (
    <div className="min-h-screen bg-morphe-dark hero-glow flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-morphe-orange/6 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-morphe-orange rounded-lg flex items-center justify-center shadow-glow-orange">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-foreground font-bold text-2xl tracking-tight">MIA</span>
          </div>
          <p className="text-muted-foreground text-sm">by Morphê Foods</p>
        </div>

        {/* Card */}
        <div className="card-depth p-8">
          <h1 className="text-xl font-bold mb-1">Bem-vinda de volta</h1>
          <p className="text-sm text-muted-foreground mb-7">Entre com sua conta para continuar.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-premium"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-premium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? 'Entrando...' : (<>Entrar <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="divider-gradient my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/signup" className="text-morphe-orange hover:text-morphe-orange-hover font-medium transition-colors">
              Criar grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
