'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-morphe-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-morphe-green font-bold text-2xl">MIA</span>
          <p className="text-muted-foreground text-sm mt-1">Morphê Foods</p>
        </div>

        <div className="bg-morphe-dark-2 border border-border rounded-xl p-8">
          <h1 className="text-lg font-semibold mb-6">Entrar na sua conta</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green transition-colors"
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
                className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-morphe-green hover:bg-morphe-green-light disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{' '}
            <Link href="/signup" className="text-morphe-green-light hover:underline">
              Criar grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
