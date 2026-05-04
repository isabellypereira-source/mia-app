'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AgentTokenPage() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setErro('Você precisa estar logada.'); setLoading(false); return }

      const res = await fetch('/api/auth/agent/my-token', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro'); setLoading(false); return }
      setToken(data.token)
      setLoading(false)
    }
    load()
  }, [])

  async function copiar() {
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff8f1' }}>
      <div className="bg-white border border-[#e5d9c1] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#003223] flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
        </div>
        <h1 className="text-lg font-semibold text-center text-[#211b0c] mb-2">Token do Agente</h1>
        <p className="text-sm text-[#58413c] text-center mb-6">
          Copie o token abaixo e cole no agente pelo menu da bandeja do sistema.
        </p>

        {loading && <p className="text-sm text-center text-[#58413c]">Carregando...</p>}
        {erro && <p className="text-sm text-center text-red-500">{erro}</p>}

        {token && (
          <div className="space-y-3">
            <div className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-2 text-xs font-mono text-[#211b0c] break-all select-all">
              {token}
            </div>
            <button
              onClick={copiar}
              className="w-full bg-[#003223] hover:bg-[#004d35] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {copied ? '✓ Copiado!' : 'Copiar token'}
            </button>
            <p className="text-xs text-[#58413c] text-center">
              Depois clique em <strong>"Colar token"</strong> no ícone da bandeja.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
