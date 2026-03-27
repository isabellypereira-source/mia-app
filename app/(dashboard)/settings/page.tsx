'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-8">Configurações</h1>

        <div className="space-y-4">
          <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium mb-4">Plano atual</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Free</p>
                <p className="text-xs text-muted-foreground mt-0.5">50 mensagens por mês</p>
              </div>
              <button className="text-xs bg-morphe-green/10 border border-morphe-green/30 text-morphe-green-light px-3 py-1.5 rounded-md hover:bg-morphe-green/20 transition-colors">
                Upgrade para Pro
              </button>
            </div>
          </div>

          <div className="bg-morphe-dark-2 border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium mb-4">Impressora</h2>
            <select className="w-full bg-morphe-dark border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green">
              <option>Selecione sua impressora</option>
              <option>Foodini (Natural Machines)</option>
              <option>byFlow Focus</option>
              <option>Procusini 5.0</option>
              <option>FELIX Food</option>
              <option>Impressora adaptada (DIY)</option>
              <option>Outra</option>
            </select>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5">
            <h2 className="text-sm font-medium mb-3">Sessão</h2>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={14} /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
