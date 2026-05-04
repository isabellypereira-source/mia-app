'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function AuthAgentContent() {
  const params = useSearchParams()
  const code = params.get('code')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [erro, setErro] = useState('')

  async function autorizar() {
    setLoading(true)
    setErro('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/auth/agent?code=' + code)}`
        return
      }

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
            <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-2">
              ✅ Autorizado!
            </h1>
            <p className="text-sm text-[#58413c] text-center">
              Pode fechar esta aba. O agente foi conectado à sua conta.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-1">
              Sincronização com o Slicer
            </h1>
            <p className="text-sm text-[#58413c] text-center mb-6">
              O agent local quer acesso à sua conta para sincronizar seus experimentos de impressão.
            </p>

            {erro && (
              <p className="text-xs text-red-500 text-center mb-4">{erro}</p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={autorizar}
                disabled={loading || !code}
                className="w-full bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Autorizando...' : 'Autorizar'}
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
  return (
    <Suspense>
      <AuthAgentContent />
    </Suspense>
  )
}
