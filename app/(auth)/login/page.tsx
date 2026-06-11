'use client'
import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

// ─── Animated number counter ────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const dur = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = setTimeout(() => requestAnimationFrame(tick), 400)
    return () => clearTimeout(id)
  }, [to])
  return <>{val}{suffix}</>
}

// ─── Floating orb ───────────────────────────────────────────────────
function Orb({ size, x, y, color, delay }: { size: number; x: string; y: string; color: string; delay: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: x, top: y,
        background: color,
        filter: 'blur(60px)',
        opacity: 0.25,
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

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
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.04); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .reveal { animation: slide-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade { animation: fade-in 1s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.22s; opacity: 0; }
        .delay-3 { animation-delay: 0.34s; opacity: 0; }
        .delay-4 { animation-delay: 0.46s; opacity: 0; }
        .delay-5 { animation-delay: 0.58s; opacity: 0; }
        .btn-morphe {
          position: relative; overflow: hidden;
          background: #054a37; color: #fff1d9;
          border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-morphe::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #abd032 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-morphe:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(5,74,55,0.3); }
        .btn-morphe:hover::after { opacity: 0.15; }
        .btn-morphe:active { transform: translateY(0); }
        .input-morphe {
          background: rgba(255,241,217,0.6);
          border: 1.5px solid rgba(5,74,55,0.12);
          color: #000;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .input-morphe::placeholder { color: rgba(5,74,55,0.3); }
        .input-morphe:focus {
          outline: none;
          border-color: #abd032;
          background: rgba(255,241,217,0.9);
          box-shadow: 0 0 0 3px rgba(171,208,50,0.15);
        }
        .stat-card {
          backdrop-filter: blur(12px);
          background: rgba(255,241,217,0.08);
          border: 1px solid rgba(255,241,217,0.12);
        }
      `}</style>

      <div className="min-h-screen flex" style={{ background: '#fff1d9' }}>

        {/* ── Left panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-14"
          style={{ background: '#054a37' }}>

          {/* Orbs */}
          <Orb size={400} x="-10%" y="-15%" color="#abd032" delay={0} />
          <Orb size={300} x="50%" y="55%" color="#006e51" delay={2} />
          <Orb size={200} x="10%" y="70%" color="#abd032" delay={4} />

          {/* Top */}
          <div className="relative z-10">
            <div className={`flex items-center gap-3 mb-20 ${mounted ? 'fade' : 'opacity-0'}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: '#abd032', color: '#054a37' }}>M</div>
              <span className="font-bold text-xl tracking-tight" style={{ color: '#fff1d9' }}>MIA</span>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1"
                style={{ background: 'rgba(171,208,50,0.15)', color: '#abd032', border: '1px solid rgba(171,208,50,0.3)' }}>
                by Morphê Foods
              </span>
            </div>

            <h2 className={`font-black leading-none mb-6 ${mounted ? 'reveal delay-1' : 'opacity-0'}`}
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: '#fff1d9', letterSpacing: '-0.03em' }}>
              O laboratório<br />
              <span style={{ color: '#abd032' }}>molecular</span><br />
              no seu navegador.
            </h2>

            <p className={`text-sm leading-relaxed max-w-xs ${mounted ? 'reveal delay-2' : 'opacity-0'}`}
              style={{ color: 'rgba(255,241,217,0.65)' }}>
              Formule, analise e imprima alimentos com precisão científica — de hidrocolóides a G-code.
            </p>
          </div>

          {/* Stats */}
          <div className={`relative z-10 ${mounted ? 'reveal delay-3' : 'opacity-0'}`}>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { n: 50, s: '+', label: 'Formulações' },
                { n: 12, s: '', label: 'Protocolos' },
                { n: 99, s: '%', label: 'Precisão' },
              ].map(({ n, s, label }) => (
                <div key={label} className="stat-card rounded-2xl px-4 py-4 text-center">
                  <p className="font-black text-2xl mb-0.5" style={{ color: '#abd032' }}>
                    {mounted ? <Counter to={n} suffix={s} /> : `0${s}`}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,241,217,0.5)' }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#abd032' }} />
              <span className="text-xs" style={{ color: 'rgba(255,241,217,0.4)' }}>
                The Living Lab · Morphê Foods
              </span>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
          {/* Subtle bg texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(171,208,50,0.06) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(5,74,55,0.05) 0%, transparent 50%)' }} />

          <div className="w-full max-w-sm relative z-10">
            {/* Mobile logo */}
            <div className={`lg:hidden text-center mb-10 ${mounted ? 'fade' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ background: '#054a37', color: '#abd032' }}>M</div>
                <span className="font-black text-2xl tracking-tight" style={{ color: '#054a37' }}>MIA</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(5,74,55,0.45)' }}>by Morphê Foods</p>
            </div>

            <h1 className={`font-black mb-1 ${mounted ? 'reveal delay-1' : 'opacity-0'}`}
              style={{ fontSize: '1.9rem', color: '#054a37', letterSpacing: '-0.03em' }}>
              Bem-vinda de volta
            </h1>
            <p className={`text-sm mb-8 ${mounted ? 'reveal delay-2' : 'opacity-0'}`}
              style={{ color: 'rgba(5,74,55,0.5)' }}>
              Entre com sua conta para continuar.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className={mounted ? 'reveal delay-2' : 'opacity-0'}>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(5,74,55,0.5)' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-morphe w-full rounded-xl px-4 py-3.5 text-sm"
                  placeholder="seu@email.com" />
              </div>

              <div className={mounted ? 'reveal delay-3' : 'opacity-0'}>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(5,74,55,0.5)' }}>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-morphe w-full rounded-xl px-4 py-3.5 text-sm"
                  placeholder="••••••••" />
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(250,85,40,0.08)', border: '1px solid rgba(250,85,40,0.25)' }}>
                  <p className="text-xs" style={{ color: '#fa5528' }}>{error}</p>
                </div>
              )}

              <div className={mounted ? 'reveal delay-4' : 'opacity-0'}>
                <button type="submit" disabled={loading}
                  className="btn-morphe w-full py-4 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Entrando...
                    </span>
                  ) : 'Entrar'}
                </button>
              </div>
            </form>

            <div className={`mt-6 pt-6 ${mounted ? 'reveal delay-5' : 'opacity-0'}`}
              style={{ borderTop: '1px solid rgba(5,74,55,0.1)' }}>
              <p className="text-center text-sm" style={{ color: 'rgba(5,74,55,0.5)' }}>
                Não tem conta?{' '}
                <Link href="/signup" className="font-bold transition-colors hover:opacity-70"
                  style={{ color: '#054a37' }}>
                  Criar grátis →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
