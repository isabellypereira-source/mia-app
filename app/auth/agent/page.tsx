'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function AuthAgentContent() {
  const params = useSearchParams()
  const code = params.get('code')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [erro, setErro] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
      setCheckingAuth(false)
    })
  }, [])

  async function autorizar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/auth/agent/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao autorizar')
      setLoading(false)
    }
  }

  function goLogin() {
    window.location.href = `/login?redirect=${encodeURIComponent('/auth/agent?code=' + code)}`
  }

  if (checkingAuth) return null

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff8f1' }}>
      <div className="bg-white border border-[#e5d9c1] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#003223] flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
        </div>

        {done ? (
          <>
            <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-2">✅ Autorizado!</h1>
            <p className="text-sm text-[#58413c] text-center">
              Pode fechar esta aba. O agente foi conectado à sua conta.
            </p>
          </>
        ) : !userEmail ? (
          <>
            <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-2">
              Entre na sua conta primeiro
            </h1>
            <p className="text-sm text-[#58413c] text-center mb-6">
              Para autorizar o agente, você precisa estar logada na MIA.
            </p>
            <button
              onClick={goLogin}
              className="w-full bg-[#003223] hover:bg-[#004d35] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Entrar na MIA
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-1">
              Sincronização com o Slicer
            </h1>
            <p className="text-sm text-[#58413c] text-center mb-1">
              Logada como <strong>{userEmail}</strong>
            </p>
            <p className="text-sm text-[#58413c] text-center mb-6">
              O agente local quer acesso permanente à sua conta para sincronizar experimentos de impressão.
            </p>

            {erro && <p className="text-xs text-red-500 text-center mb-4">{erro}</p>}

            <div className="flex flex-col gap-2">
              <button
                onClick={autorizar}
                disabled={loading || !code}
                className="w-full bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Autorizando...' : 'Autorizar acesso permanente'}
              </button>
              <button
                onClick={() => window.close()}
                className="w-full text-sm text-[#58413c] hover:text-[#211b0c] py-2.5 border border-[#e5d9c1] rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthAgentPage() {
  return <Suspense><AuthAgentContent /></Suspense>
}
