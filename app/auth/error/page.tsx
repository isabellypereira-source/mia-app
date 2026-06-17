'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ALGAE = [
  { src: '/algae/55.png', left: '-30px',  right: 'auto', bottom: '-30px', width: '230px', duration: 10,   delay: 0   },
  { src: '/algae/54.png', left: '140px',  right: 'auto', bottom: '-40px', width: '200px', duration: 12,   delay: 1.4 },
  { src: '/algae/53.png', left: 'auto',   right: '-40px', bottom: '-30px', width: '240px', duration: 11,  delay: 2.2 },
  { src: '/algae/52.png', left: 'auto',   right: '130px', bottom: '-35px', width: '190px', duration: 12.5, delay: 0.9 },
]

function ErrorContent() {
  const params = useSearchParams()
  const msg = params.get('msg') ?? 'Ocorreu um erro ao confirmar seu email.'
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const supabase = createClient()

  async function reenviar(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setErrMsg('')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      setErrMsg(error.message === 'Email rate limit exceeded'
        ? 'Aguarde alguns minutos antes de solicitar novamente.'
        : error.message)
      setState('error')
    } else {
      setState('sent')
    }
  }

  return (
    <div className="auth-root">
      <style>{AUTH_CSS}</style>

      <div className="algae-layer" aria-hidden="true">
        {ALGAE.map((a, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={a.src} alt="" className="algae"
            style={{ left: a.left, right: a.right, bottom: a.bottom, width: a.width,
                     animationDuration: `${a.duration}s`, animationDelay: `${a.delay}s` }} />
        ))}
      </div>

      <main className="shell">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mia-logo.png" alt="MIA" />
          <span>MIA</span>
        </Link>

        <div className="card">
          <div className="err-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>

          <h1>Link <em>inválido</em></h1>
          <p className="sub">{msg}</p>

          {state === 'sent' ? (
            <div className="success-box">
              Novo email de confirmação enviado para <strong>{email}</strong>. Verifique sua caixa de entrada.
            </div>
          ) : (
            <form onSubmit={reenviar}>
              <label>Seu email de cadastro</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                autoComplete="email"
              />
              {(state === 'error') && <div className="auth-error">{errMsg}</div>}
              <button type="submit" disabled={state === 'loading'} className="submit">
                {state === 'loading' ? 'Enviando...' : 'Reenviar email de confirmação'}
              </button>
            </form>
          )}

          <div className="card-footer">
            Já confirmou? <Link href="/login">Entrar</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}

const AUTH_CSS = `
  .auth-root{
    --cream:#fff1d9;
    --cream-2:#f6e5c5;
    --green-deep:#03382a;
    --green:#054a37;
    --green-mid:#196454;
    --lime:#abd032;
    --orange:#fa5528;
    min-height:100vh;width:100%;position:relative;overflow-x:hidden;
    font-family:var(--font-sans),system-ui,sans-serif;
    background:
      radial-gradient(ellipse at 50% 0%, #fff6e3 0%, transparent 60%),
      radial-gradient(ellipse at 50% 100%, #f4e2c0 0%, transparent 70%),
      linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
  }
  .auth-root *{box-sizing:border-box}
  .algae-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:1}
  .algae{
    position:absolute;height:auto;transform-origin:50% 100%;
    animation:sway ease-in-out infinite alternate;
    filter:drop-shadow(0 6px 22px rgba(3,56,42,.18));
  }
  @keyframes sway{
    0%   { transform: rotate(-8deg) translateX(-12px); }
    50%  { transform: rotate(6deg) translateX(14px); }
    100% { transform: rotate(-9deg) translateX(-14px); }
  }
  .shell{
    position:relative;z-index:5;min-height:100vh;width:100%;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:48px 24px;gap:32px;
  }
  .brand{
    display:inline-flex;align-items:center;gap:12px;text-decoration:none;
    padding:10px 22px 10px 14px;border-radius:999px;
    background:rgba(5,74,55,.06);border:1px solid rgba(5,74,55,.12);
    backdrop-filter:blur(8px);
  }
  .brand img{width:36px;height:36px;object-fit:contain}
  .brand span{font-size:17px;font-weight:600;color:var(--green-deep);letter-spacing:.02em}
  .card{
    width:100%;max-width:440px;padding:44px 40px 36px;border-radius:28px;
    background:linear-gradient(180deg, #054a37 0%, #03382a 100%);
    color:var(--cream);
    box-shadow:0 40px 100px -30px rgba(3,56,42,.55), 0 0 0 1px rgba(3,56,42,.15);
  }
  .err-icon{
    width:56px;height:56px;border-radius:50%;
    background:rgba(250,85,40,.15);border:1.5px solid rgba(250,85,40,.3);
    color:#ffb29c;display:grid;place-items:center;margin-bottom:22px;
  }
  .card h1{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:36px;line-height:1.05;color:var(--cream);margin:0 0 6px;
  }
  .card h1 em{font-style:italic;color:var(--lime)}
  .card .sub{font-size:14.5px;line-height:1.55;color:rgba(255,241,217,.7);margin:0 0 28px}
  .card label{
    display:block;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:rgba(255,241,217,.7);margin:18px 0 8px;
  }
  .card input{
    width:100%;padding:14px 16px;border-radius:12px;
    background:rgba(255,241,217,.08);color:var(--cream);
    border:1.5px solid rgba(255,241,217,.18);
    font-family:inherit;font-size:15px;
    transition:border-color .2s, box-shadow .2s, background .2s;
  }
  .card input::placeholder{color:rgba(255,241,217,.4)}
  .card input:focus{outline:none;border-color:var(--lime);background:rgba(255,241,217,.12);box-shadow:0 0 0 4px rgba(171,208,50,.18)}
  .auth-error{
    margin-top:14px;padding:10px 14px;border-radius:10px;
    background:rgba(250,85,40,.12);border:1px solid rgba(250,85,40,.4);
    color:#ffb29c;font-size:13px;
  }
  .success-box{
    padding:16px;border-radius:14px;
    background:rgba(171,208,50,.12);border:1.5px solid rgba(171,208,50,.3);
    color:var(--lime);font-size:14px;line-height:1.55;
  }
  .success-box strong{font-weight:600}
  .submit{
    width:100%;margin-top:22px;padding:15px;border-radius:14px;
    background:var(--lime);color:var(--green-deep);
    border:none;cursor:pointer;font-family:inherit;font-size:15px;font-weight:600;
    transition:transform .15s, box-shadow .25s;
  }
  .submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 32px -12px rgba(171,208,50,.55)}
  .submit:disabled{opacity:.55;cursor:not-allowed}
  .card-footer{
    margin-top:26px;padding-top:22px;text-align:center;
    border-top:1px solid rgba(255,241,217,.12);
    font-size:14px;color:rgba(255,241,217,.55);
  }
  .card-footer a{color:var(--cream);font-weight:600;text-decoration:none}
  .card-footer a:hover{color:var(--lime)}
  @media (max-width:560px){
    .card{padding:32px 24px 24px;border-radius:22px}
    .card h1{font-size:30px}
  }
`
