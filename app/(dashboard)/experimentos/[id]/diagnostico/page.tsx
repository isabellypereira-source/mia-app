'use client'
import { use } from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DiagnosticoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <>
      <style>{`
        .diag-back{
          display:inline-flex;align-items:center;gap:8px;
          color:var(--text-muted) !important;text-decoration:none;
          font-size:13px;margin-bottom:20px;
        }
        .diag-back:hover{color:var(--text-main) !important}
        .diag-hero{
          text-align:center;padding:60px 24px;
          background:var(--surface-glass) !important;
          border:1px solid var(--border-glass) !important;
          backdrop-filter:blur(20px);
          border-radius:22px;
        }
        .diag-icon{
          width:60px;height:60px;border-radius:18px;
          background:var(--icon-tint);
          display:grid;place-items:center;color:var(--accent-em);
          margin:0 auto 18px;
        }
        .diag-title{
          font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
          font-size:32px;margin:0 0 8px;color:var(--text-main) !important;letter-spacing:-.01em;
        }
        .diag-sub{font-size:14.5px;color:var(--text-muted) !important;max-width:480px;margin:0 auto;line-height:1.55}
        .diag-id{font-size:11px;color:var(--text-faint) !important;margin-top:18px;letter-spacing:.16em;text-transform:uppercase;font-family:monospace}
      `}</style>

      <Link href="/experimentos" className="diag-back">
        <ArrowLeft size={14} strokeWidth={1.8} /> Voltar aos experimentos
      </Link>

      <div className="diag-hero">
        <div className="diag-icon"><Sparkles size={28} strokeWidth={1.8} /></div>
        <h1 className="diag-title">Diagnóstico em construção</h1>
        <p className="diag-sub">
          A análise detalhada da MIA para este experimento será apresentada aqui. Vamos desenvolver essa visão em seguida, com sugestões de causa raiz e ajustes para a próxima formulação.
        </p>
        <div className="diag-id">Experimento #{id.slice(0, 8)}</div>
      </div>
    </>
  )
}
