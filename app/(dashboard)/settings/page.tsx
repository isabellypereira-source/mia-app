'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Zap, Printer, User } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [printer, setPrinter] = useState('')

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-[#58413c] mt-1">Gerencie sua conta e preferências</p>
      </div>

      <div className="max-w-lg mx-auto px-8 py-6 space-y-4">

        {/* Plano */}
        <div className="bg-white rounded-2xl shadow-tonal p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[rgba(0,50,35,0.08)] border border-[#e5d9c1] rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-[#003223]" />
            </div>
            <h2 className="text-base font-semibold">Plano atual</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Free</p>
              <p className="text-xs text-[#58413c] mt-0.5">50 mensagens por mês</p>
            </div>
            <button className="btn-primary text-xs px-4 py-2">
              Upgrade para Pro
            </button>
          </div>
        </div>

        {/* Impressora */}
        <div className="bg-white rounded-2xl shadow-tonal p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center">
              <Printer size={14} className="text-blue-400" />
            </div>
            <h2 className="text-base font-semibold">Impressora</h2>
          </div>
          <select
            value={printer}
            onChange={e => setPrinter(e.target.value)}
            className="input-premium"
          >
            <option value="">Selecione sua impressora</option>
            <option>Foodini (Natural Machines)</option>
            <option>byFlow Focus</option>
            <option>Procusini 5.0</option>
            <option>FELIX Food</option>
            <option>Impressora adaptada (DIY)</option>
            <option>Outra</option>
          </select>
        </div>

        {/* Sessão */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <User size={14} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold">Sessão</h2>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>

      </div>
    </div>
  )
}
