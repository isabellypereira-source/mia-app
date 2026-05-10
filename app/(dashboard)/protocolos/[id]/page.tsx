'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import { getProtocolo, type Protocolo } from '@/lib/protocolos/data'
import { notFound } from 'next/navigation'

export default function ProtocoloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [protocolo, setProtocolo] = useState<Protocolo | null | undefined>(undefined)
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    const p = getProtocolo(id)
    setProtocolo(p ?? null)
  }, [id])

  if (protocolo === undefined) return null
  if (protocolo === null) { notFound(); return null }

  async function baixar() {
    setBaixando(true)
    try {
      window.location.href = `/api/protocolos/${id}/pdf`
    } finally {
      setTimeout(() => setBaixando(false), 1500)
    }
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#fff8f1' }}>
      {/* Header */}
      <div className="section-alt border-b border-[#e5d9c1] px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/protocolos" className="flex items-center gap-1.5 text-xs text-[#58413c] hover:text-[#003223] transition-colors mb-3">
            <ArrowLeft size={12} /> Voltar para protocolos
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight">{protocolo.titulo}</h1>
              <p className="text-sm text-[#58413c] mt-1.5 leading-relaxed">{protocolo.descricao}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="bg-[rgba(0,50,35,0.08)] text-[#003223] text-[10px] px-2 py-0.5 rounded-full">v{protocolo.versao}</span>
                <span className="text-[10px] text-[#707974]">Emissão: {protocolo.emissao}</span>
              </div>
            </div>
            <button
              onClick={baixar}
              disabled={baixando}
              className="flex items-center gap-1.5 flex-shrink-0 text-xs bg-[#003223] hover:bg-[#004d35] disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Download size={12} />
              {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        {/* Diagrama */}
        <div className="bg-white rounded-2xl border border-[#e5d9c1] p-6 flex flex-col items-center shadow-tonal">
          {protocolo.diagrama}
          <p className="text-[10px] text-[#707974] mt-3 italic text-center">Figura: representação esquemática</p>
        </div>

        {/* Seções */}
        {protocolo.secoes.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e5d9c1] p-5 shadow-tonal">
            <h2 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-3">{sec.titulo}</h2>
            {Array.isArray(sec.conteudo) ? (
              <ul className="space-y-1.5">
                {sec.conteudo.map((item, j) => (
                  <li key={j} className="text-sm text-[#58413c] leading-relaxed flex gap-2">
                    <span className="text-[#003223] flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#58413c] leading-relaxed">{sec.conteudo}</p>
            )}
          </div>
        ))}

        {/* Fórmulas */}
        {protocolo.formulas.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e5d9c1] p-5 shadow-tonal">
            <h2 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-3">Fórmulas</h2>
            <div className="space-y-2.5">
              {protocolo.formulas.map((f, i) => (
                <div key={i} className="bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-4 py-3">
                  <p className="text-[10px] text-[#707974] uppercase tracking-wide mb-1.5">{f.label}</p>
                  <p className="text-sm text-[#003223] font-mono">{f.expr}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referências */}
        {protocolo.referencias.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e5d9c1] p-5 shadow-tonal">
            <h2 className="text-xs font-semibold text-[#003223] uppercase tracking-wide mb-3">Referências</h2>
            <div className="space-y-3">
              {protocolo.referencias.map((r, i) => (
                <div key={i} className="text-sm text-[#58413c] leading-relaxed">
                  {r.autores} ({r.ano}). <span className="italic">{r.titulo}</span>. {r.revista}.
                  {r.doi && (
                    <>
                      {' '}
                      <a
                        href={`https://doi.org/${r.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[#003223] hover:underline font-medium"
                      >
                        DOI: {r.doi} <ExternalLink size={11} />
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
