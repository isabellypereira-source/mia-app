'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
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
      const redirect = params.get('redirect')
      router.push(redirect && redirect.startsWith('/') ? redirect : '/formular')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fff8f1' }}>
      {/* Left — decorativo */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: '#003223' }}>
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(200,238,79,0.12)' }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,248,241,0.05)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}>M</div>
            <span className="font-display font-bold text-lg text-white">MIA</span>
          </div>
          <h2 className="font-display font-bold text-white mb-4"
            style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            O laboratório molecular<br />no seu navegador
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#b2f0d5' }}>
            Formule, analise e imprima alimentos com precisão científica — de hidrocolóides a G-code.
          </p>
        </div>
        <div className="relative">
          <div className="badge-lime inline-flex">The Living Lab · Morphê Foods</div>
        </div>
      </div>

      {/* Right — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
                style={{ background: '#003223' }}>M</div>
              <span className="font-display font-bold text-xl" style={{ color: '#003223' }}>MIA</span>
            </div>
            <p className="text-xs font-sans" style={{ color: '#707974' }}>by Morphê Foods</p>
          </div>

          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#003223', letterSpacing: '-0.02em' }}>
            Bem-vinda de volta
          </h1>
          <p className="text-sm font-sans mb-8" style={{ color: '#58413c' }}>Entre com sua conta para continuar.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-wider block mb-2" style={{ color: '#58413c' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-premium" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-wider block mb-2" style={{ color: '#58413c' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="input-premium" placeholder="••••••••" />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)' }}>
                <p className="text-xs font-sans" style={{ color: '#ba1a1a' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Entrando...' : (<>Entrar <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="divider-gradient my-7" />

          <p className="text-center text-sm font-sans" style={{ color: '#58413c' }}>
            Não tem conta?{' '}
            <Link href="/signup" className="font-display font-semibold transition-opacity hover:opacity-70" style={{ color: '#003223' }}>
              Criar grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
