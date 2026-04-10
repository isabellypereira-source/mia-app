'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Mail } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-morphe-dark hero-glow flex items-center justify-center px-4">
        <div className="card-depth text-center max-w-sm w-full p-10 animate-slide-up">
          <div className="w-16 h-16 bg-morphe-orange/10 border border-morphe-orange/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-morphe-orange" />
          </div>
          <h2 className="text-xl font-bold mb-2">Confirme seu email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Enviamos um link de confirmação para{' '}
            <strong className="text-foreground">{email}</strong>.
            Acesse seu email e clique no link para ativar sua conta.
          </p>
          <Link
            href="/login"
            className="btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            Voltar ao login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-morphe-dark hero-glow flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-morphe-orange/6 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-morphe-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-foreground font-bold text-2xl tracking-tight">MIA</span>
          </div>
          <p className="text-muted-foreground text-sm">by Morphê Foods</p>
        </div>

        {/* Card */}
        <div className="card-depth p-8">
          <h1 className="text-xl font-bold mb-1">Criar conta grátis</h1>
          <p className="text-sm text-muted-foreground mb-7">Comece a formular melhor hoje.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="input-premium"
                placeholder="Seu nome"
              />
            </div>
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
                minLength={8}
                className="input-premium"
                placeholder="Mínimo 8 caracteres"
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
              {loading ? 'Criando conta...' : (<>Criar conta grátis <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="divider-gradient my-6" />

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-morphe-orange hover:text-morphe-orange-hover font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
