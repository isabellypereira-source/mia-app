'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
      <div className="min-h-screen bg-morphe-dark flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold mb-2">Confirme seu email</h2>
          <p className="text-muted-foreground text-sm">
            Enviamos um link de confirmação para <strong>{email}</strong>. Acesse seu email e clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="text-morphe-green-light text-sm hover:underline block mt-6">
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-morphe-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-morphe-green font-bold text-2xl">MIA</span>
          <p className="text-muted-foreground text-sm mt-1">Morphê Foods</p>
        </div>

        <div className="bg-morphe-dark-2 border border-border rounded-xl p-8">
          <h1 className="text-lg font-semibold mb-6">Criar conta grátis</h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-morphe-green hover:bg-morphe-green-light disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors text-sm"
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-morphe-green-light hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
