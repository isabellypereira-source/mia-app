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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fff8f1' }}>
        <div className="bg-white text-center max-w-sm w-full p-10 rounded-2xl shadow-tonal-lg animate-slide-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,50,35,0.08)' }}>
            <Mail size={28} style={{ color: '#003223' }} />
          </div>
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#003223' }}>Confirme seu email</h2>
          <p className="text-sm leading-relaxed mb-6 font-sans" style={{ color: '#58413c' }}>
            Enviamos um link de confirmação para{' '}
            <strong style={{ color: '#003223' }}>{email}</strong>.
            Acesse seu email e clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            Voltar ao login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fff8f1' }}>
      {/* Left — decorativo */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: '#003223' }}>
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(200,238,79,0.12)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}>M</div>
            <span className="font-display font-bold text-lg text-white">MIA</span>
          </div>
          <h2 className="font-display font-bold text-white mb-4"
            style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            Comece a formular<br />melhor hoje
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#b2f0d5' }}>
            Crie sua conta gratuita e tenha acesso ao laboratório molecular mais avançado para food 3D.
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
            Criar conta grátis
          </h1>
          <p className="text-sm font-sans mb-8" style={{ color: '#58413c' }}>Comece a formular melhor hoje.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-wider block mb-2" style={{ color: '#58413c' }}>Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required
                className="input-premium" placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-wider block mb-2" style={{ color: '#58413c' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-premium" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-wider block mb-2" style={{ color: '#58413c' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="input-premium" placeholder="Mínimo 8 caracteres" />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)' }}>
                <p className="text-xs font-sans" style={{ color: '#ba1a1a' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Criando conta...' : (<>Criar conta grátis <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="divider-gradient my-7" />

          <p className="text-center text-sm font-sans" style={{ color: '#58413c' }}>
            Já tem conta?{' '}
            <Link href="/login" className="font-display font-semibold transition-opacity hover:opacity-70" style={{ color: '#003223' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
