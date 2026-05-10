'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, FileText, FlaskConical, Microscope, BookOpen, ChevronRight } from 'lucide-react'
import { PROTOCOLOS } from '@/lib/protocolos/data'

interface Formulacao {
  id: string
  nome: string
  ingredientes: Array<{ nome: string; percentual: number; funcao: string }>
  observacoes: string
  created_at: string
}

export default function ProtocolosPage() {
  const [formulacoes, setFormulacoes] = useState<Formulacao[]>([])
  const [formulacaoId, setFormulacaoId] = useState('')
  const [baixando, setBaixando] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulacoes').then(r => r.json()).then(d => setFormulacoes(d || []))
  }, [])

  async function baixarDocFormulacao(tipo: 'ficha' | 'pop') {
    const form = formulacoes.find(f => f.id === formulacaoId)
    if (!form) return
    setBaixando(tipo)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formulacao_id: formulacaoId, tipo: tipo === 'ficha' ? 'ficha_tecnica' : 'pop' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tipo === 'ficha' ? 'ficha_tecnica' : 'pop'}_${form.nome.replace(/\s+/g, '_')}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // silently ignore - botão volta ao normal
    }
    setBaixando(null)
  }

  function baixarProtocoloPDF(id: string) {
    setBaixando(id)
    window.location.href = `/api/protocolos/${id}/pdf`
    setTimeout(() => setBaixando(null), 1500)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6 mb-6">
        <h1 className="text-2xl font-bold">Protocolos</h1>
        <p className="text-sm text-[#58413c] mt-1">
          Leia ou baixe protocolos metodológicos. Cada protocolo é validado por literatura científica.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-8 mb-8">
        {/* Documentos por formulação */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={15} className="text-[#003223]" />
            <h2 className="text-sm font-semibold">Documentos da formulação</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-tonal p-4 mb-3">
            <label className="text-xs text-[#58413c] block mb-1.5">Selecione a formulação</label>
            <select
              value={formulacaoId}
              onChange={e => setFormulacaoId(e.target.value)}
              className="input-premium focus:ring-[#003223]/30"
            >
              <option value="">Selecione...</option>
              {formulacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            {formulacoes.length === 0 && (
              <p className="text-xs text-[#58413c] mt-1">
                Nenhuma formulação salva.{' '}
                <a href="/formular" className="text-[#003223] hover:underline">Criar agora</a>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { tipo: 'ficha' as const, titulo: 'Ficha Técnica', desc: 'Composição, processo, tabela nutricional estimada e informações regulatórias.', icon: BookOpen },
              { tipo: 'pop' as const, titulo: 'POP', desc: 'Procedimento Operacional Padrão para replicação do processo.', icon: FileText },
            ].map(doc => (
              <div key={doc.tipo} className="bg-white rounded-2xl shadow-tonal p-4">
                <div className="flex items-center gap-2 mb-2">
                  <doc.icon size={14} className="text-[#003223]" />
                  <h3 className="text-sm font-medium">{doc.titulo}</h3>
                </div>
                <p className="text-xs text-[#58413c] mb-4 leading-relaxed">{doc.desc}</p>
                <button
                  onClick={() => baixarDocFormulacao(doc.tipo)}
                  disabled={!formulacaoId || baixando === doc.tipo}
                  className="w-full flex items-center justify-center gap-2 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-md transition-colors"
                >
                  <Download size={12} />
                  {baixando === doc.tipo ? 'Gerando...' : `Baixar ${doc.titulo}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Protocolos de caracterização */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Microscope size={15} className="text-[#003223]" />
            <h2 className="text-sm font-semibold">Protocolos de caracterização</h2>
          </div>
          <p className="text-xs text-[#58413c] mb-4">
            Clique em um protocolo para ler o conteúdo completo na tela. Use o botão Baixar PDF para salvar com diagramas e referências.
          </p>

          <div className="space-y-3">
            {PROTOCOLOS.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-tonal overflow-hidden">
                <Link
                  href={`/protocolos/${p.id}`}
                  className="block p-4 hover:bg-[#fff8f1]/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{p.titulo}</p>
                      <p className="text-xs text-[#58413c] leading-relaxed mt-0.5">{p.descricao}</p>
                      {p.referencias.length > 0 && (
                        <p className="text-[10px] text-[#707974] mt-1.5 italic">
                          Ref.: {p.referencias.map(r => r.autores.split(',')[0] + ' et al., ' + r.ano).join(' · ')}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[#58413c] flex-shrink-0 mt-1" />
                  </div>
                </Link>
                <div className="border-t border-[#e5d9c1] px-4 py-2 flex items-center justify-between bg-[#fff8f1]/40">
                  <Link
                    href={`/protocolos/${p.id}`}
                    className="text-xs text-[#003223] hover:underline font-medium"
                  >
                    Ler protocolo →
                  </Link>
                  <button
                    onClick={() => baixarProtocoloPDF(p.id)}
                    disabled={baixando === p.id}
                    className="flex items-center gap-1.5 text-xs bg-white border border-[#e5d9c1] hover:border-[#003223]/30 hover:text-[#003223] text-[#58413c] px-3 py-1 rounded-md transition-colors"
                  >
                    <Download size={11} />
                    {baixando === p.id ? '...' : 'Baixar PDF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
