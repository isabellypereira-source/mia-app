'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : error.message)
      setLoading(false)
    } else {
      const redirect = params.get('redirect')
      router.push(redirect && redirect.startsWith('/') ? redirect : '/formular')
    }
  }

  return (
    <div className="auth-root">
      <style>{AUTH_CSS}</style>

      <div className="algae-layer" aria-hidden="true">
        {ALGAE.map((a, i) => (
          <svg
            key={i}
            className={`algae algae-${i}`}
            viewBox="0 0 200 600"
            preserveAspectRatio="xMidYMax meet"
            style={{
              left: a.left,
              right: a.right,
              bottom: a.bottom,
              width: a.width,
              opacity: a.opacity,
              animationDelay: `${a.delay}s`,
              animationDuration: `${a.duration}s`,
            }}
          >
            <path d={a.d} fill={a.fill} />
          </svg>
        ))}
      </div>

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <main className="auth-shell">
        <Link href="/" className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mia-logo.png" alt="MIA" />
          <span>MIA</span>
        </Link>

        <div className="auth-card">
          <h1>Bem-vinda de volta.</h1>
          <p className="auth-sub">Continue desenvolvendo suas formulações com a MIA.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Não tem conta?</span>{' '}
            <Link href="/signup">Criar grátis →</Link>
          </div>
        </div>

        <p className="auth-tag">Morphê Foods · The Living Lab</p>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}

const ALGAE = [
  {
    left: '-40px', right: 'auto', bottom: '-20px', width: '260px', opacity: 0.9, delay: 0, duration: 9,
    fill: '#abd032',
    d: 'M70 600 C 70 480, 30 420, 60 320 C 90 220, 40 160, 90 80 C 110 40, 100 10, 130 0 L 160 0 C 130 60, 150 130, 120 200 C 90 280, 130 360, 100 460 C 80 520, 110 560, 100 600 Z',
  },
  {
    left: '60px', right: 'auto', bottom: '-30px', width: '180px', opacity: 0.75, delay: 1.4, duration: 11,
    fill: '#006e51',
    d: 'M90 600 C 80 500, 110 420, 80 320 C 50 220, 100 140, 70 60 C 60 30, 80 10, 110 0 L 140 0 C 130 70, 100 140, 130 220 C 160 320, 110 400, 130 500 C 140 560, 120 580, 130 600 Z',
  },
  {
    left: '180px', right: 'auto', bottom: '-15px', width: '160px', opacity: 0.65, delay: 0.6, duration: 13,
    fill: '#fa5528',
    d: 'M100 600 C 90 500, 130 440, 100 360 C 70 280, 110 200, 80 120 C 60 60, 90 20, 120 0 L 145 0 C 130 60, 110 130, 140 210 C 170 300, 120 380, 145 470 C 160 530, 140 580, 150 600 Z',
  },
  {
    left: 'auto', right: '-60px', bottom: '-30px', width: '280px', opacity: 0.85, delay: 2.2, duration: 10,
    fill: '#abd032',
    d: 'M120 600 C 130 490, 90 420, 130 320 C 170 220, 110 140, 150 60 C 165 30, 145 10, 165 0 L 190 0 C 175 60, 195 130, 160 210 C 130 290, 170 370, 140 460 C 125 520, 145 570, 135 600 Z',
  },
  {
    left: 'auto', right: '40px', bottom: '-20px', width: '200px', opacity: 0.7, delay: 0.9, duration: 12,
    fill: '#006e51',
    d: 'M100 600 C 110 510, 80 440, 110 350 C 140 260, 90 180, 130 100 C 145 50, 130 20, 150 0 L 175 0 C 160 50, 180 120, 150 200 C 120 290, 160 370, 130 470 C 115 530, 135 580, 125 600 Z',
  },
  {
    left: 'auto', right: '200px', bottom: '-15px', width: '150px', opacity: 0.55, delay: 1.8, duration: 14,
    fill: '#fa5528',
    d: 'M90 600 C 100 500, 70 430, 100 340 C 130 250, 80 170, 120 90 C 135 40, 120 10, 140 0 L 160 0 C 145 50, 165 120, 135 200 C 105 290, 145 370, 115 470 C 100 530, 120 580, 110 600 Z',
  },
]

const AUTH_CSS = `
  .auth-root{
    --cream:#fff1d9;
    --green-deep:#03382a;
    --green-deeper:#022619;
    --green:#006e51;
    --green-mid:#196454;
    --lime:#abd032;
    --orange:#fa5528;
    min-height:100vh;width:100%;
    position:relative;overflow:hidden;
    background:
      radial-gradient(ellipse at 50% 0%, #074c39 0%, transparent 60%),
      radial-gradient(ellipse at 50% 100%, #02261a 0%, transparent 70%),
      linear-gradient(180deg, #054a37 0%, #033628 60%, #022619 100%);
    font-family:var(--font-sans),system-ui,sans-serif;
  }
  .auth-root *{box-sizing:border-box}

  /* ─── algae layer ─── */
  .algae-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .algae{
    position:absolute;
    height:auto;
    transform-origin:50% 100%;
    animation:sway ease-in-out infinite alternate;
    filter:drop-shadow(0 4px 24px rgba(0,0,0,.25));
  }
  @keyframes sway{
    0%   { transform: rotate(-3deg) translateX(-4px); }
    50%  { transform: rotate(2deg) translateX(6px); }
    100% { transform: rotate(-4deg) translateX(-6px); }
  }

  /* gentle texture overlay */
  .grain{
    position:absolute;inset:0;pointer-events:none;
    background-image:radial-gradient(rgba(255,241,217,.04) 1px, transparent 1px);
    background-size:3px 3px;
    mix-blend-mode:overlay;opacity:.4;
  }
  .vignette{
    position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.35) 100%);
  }

  /* ─── shell ─── */
  .auth-shell{
    position:relative;z-index:5;
    min-height:100vh;width:100%;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:48px 24px;gap:32px;
  }
  .auth-brand{
    display:inline-flex;align-items:center;gap:12px;
    text-decoration:none;
    padding:10px 22px 10px 14px;border-radius:999px;
    background:rgba(255,241,217,.06);
    border:1px solid rgba(255,241,217,.12);
    backdrop-filter:blur(8px);
  }
  .auth-brand img{width:36px;height:36px;object-fit:contain}
  .auth-brand span{font-size:17px;font-weight:600;color:var(--cream);letter-spacing:.02em}

  .auth-card{
    width:100%;max-width:440px;
    padding:44px 40px 36px;
    border-radius:28px;
    background:rgba(255,241,217,.96);
    backdrop-filter:blur(20px);
    box-shadow:
      0 40px 100px -30px rgba(0,0,0,.55),
      0 0 0 1px rgba(255,241,217,.15);
  }
  .auth-card h1{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:36px;line-height:1.05;color:var(--green-deep);margin:0 0 6px;
    letter-spacing:-.01em;
  }
  .auth-card .auth-sub{
    font-size:14.5px;line-height:1.5;color:var(--green-mid);margin:0 0 28px;
  }
  .auth-card label{
    display:block;font-size:12px;font-weight:600;letter-spacing:.16em;
    text-transform:uppercase;color:var(--green-deep);margin:18px 0 8px;
  }
  .auth-card input{
    width:100%;padding:14px 16px;border-radius:12px;
    background:#fff;color:var(--green-deep);
    border:1.5px solid rgba(5,74,55,.15);
    font-family:inherit;font-size:15px;
    transition:border-color .2s ease, box-shadow .2s ease;
  }
  .auth-card input::placeholder{color:rgba(5,74,55,.35)}
  .auth-card input:focus{
    outline:none;border-color:var(--green);
    box-shadow:0 0 0 4px rgba(6,110,81,.14);
  }
  .auth-error{
    margin-top:16px;padding:10px 14px;border-radius:10px;
    background:rgba(250,85,40,.08);border:1px solid rgba(250,85,40,.3);
    color:var(--orange);font-size:13px;
  }
  .auth-submit{
    width:100%;margin-top:24px;padding:15px;border-radius:14px;
    background:var(--green-deep);color:var(--cream);
    border:none;cursor:pointer;
    font-family:inherit;font-size:15px;font-weight:600;
    transition:transform .15s ease, box-shadow .25s ease, background .25s ease;
  }
  .auth-submit:hover:not(:disabled){
    transform:translateY(-1px);
    background:var(--green);
    box-shadow:0 14px 32px -12px rgba(5,74,55,.6);
  }
  .auth-submit:disabled{opacity:.55;cursor:not-allowed}
  .auth-footer{
    margin-top:24px;padding-top:22px;text-align:center;
    border-top:1px solid rgba(5,74,55,.1);
    font-size:14px;color:var(--green-mid);
  }
  .auth-footer a{color:var(--green-deep);font-weight:600;text-decoration:none}
  .auth-footer a:hover{color:var(--orange)}

  .auth-tag{
    margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;
    color:rgba(255,241,217,.4);
  }

  @media (max-width:560px){
    .auth-card{padding:32px 24px 24px;border-radius:22px}
    .auth-card h1{font-size:30px}
    .algae{filter:drop-shadow(0 2px 12px rgba(0,0,0,.25))}
  }
`
