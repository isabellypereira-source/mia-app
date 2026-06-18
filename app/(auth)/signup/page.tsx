'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ALGAE = [
  { src: '/algae/55.png', left: '-30px',  right: 'auto', bottom: '-30px', width: '230px', duration: 10,   delay: 0   },
  { src: '/algae/54.png', left: '140px',  right: 'auto', bottom: '-40px', width: '200px', duration: 12,   delay: 1.4 },
  { src: '/algae/51.png', left: '300px',  right: 'auto', bottom: '-25px', width: '170px', duration: 13,   delay: 0.6 },
  { src: '/algae/53.png', left: 'auto',   right: '-40px', bottom: '-30px', width: '240px', duration: 11,  delay: 2.2 },
  { src: '/algae/52.png', left: 'auto',   right: '130px', bottom: '-35px', width: '190px', duration: 12.5, delay: 0.9 },
]

const CARGOS = [
  'Pesquisador(a)',
  'Professor(a)',
  'Aluno(a) de graduação',
  'Aluno(a) de pós-graduação',
  'Técnico(a) de laboratório',
  'Profissional da indústria',
  'Empreendedor(a)',
  'Outro',
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nome,     setNome]     = useState('')
  const [tel,      setTel]      = useState('')
  const [email,    setEmail]    = useState('')
  const [cargo,    setCargo]    = useState('')
  const [empresa,  setEmpresa]  = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, tel, cargo, empresa },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Já existe uma conta com esse email. Tente entrar.'
        : error.message)
      setLoading(false)
      return
    }

    // Confirmação desabilitada → entra direto
    router.push('/formular')
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
          <h1>Crie sua <em>conta.</em></h1>
          <p className="sub">Preencha os dados para começar.</p>

          <form onSubmit={handleSignup}>
            {/* Nome + Telefone */}
            <div className="row-2">
              <div>
                <label htmlFor="nome">Nome completo</label>
                <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)}
                  required autoComplete="name" placeholder="Seu nome" />
              </div>
              <div>
                <label htmlFor="tel">Telefone</label>
                <input id="tel" type="tel" value={tel} onChange={e => setTel(e.target.value)}
                  required autoComplete="tel" placeholder="(11) 99999-9999" />
              </div>
            </div>

            {/* Email */}
            <label htmlFor="email">Email institucional</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" placeholder="seu@email.com" />

            {/* Cargo + Empresa */}
            <div className="row-2">
              <div>
                <label htmlFor="cargo">Cargo</label>
                <select id="cargo" value={cargo} onChange={e => setCargo(e.target.value)}
                  required className="auth-select">
                  <option value="" disabled>Selecione</option>
                  {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="empresa">Instituição / Empresa</label>
                <input id="empresa" type="text" value={empresa} onChange={e => setEmpresa(e.target.value)}
                  required autoComplete="organization" placeholder="Morphê Foods, UNICAMP..." />
              </div>
            </div>

            {/* Senha */}
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={loading} className="submit">
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <div className="card-footer">
            Já tem conta? <Link href="/login">Entrar</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

const AUTH_CSS = `
  .auth-root{
    --cream:#fff1d9;--cream-2:#f6e5c5;
    --green-deep:#03382a;--green:#054a37;--green-mid:#196454;
    --lime:#abd032;--orange:#fa5528;
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
    0%{transform:rotate(-8deg) translateX(-12px)}
    50%{transform:rotate(6deg) translateX(14px)}
    100%{transform:rotate(-9deg) translateX(-14px)}
  }
  .shell{
    position:relative;z-index:5;min-height:100vh;width:100%;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:48px 24px;gap:32px;
  }
  .brand{
    display:inline-flex;align-items:center;gap:12px;text-decoration:none;
    padding:10px 22px 10px 14px;border-radius:999px;
    background:rgba(5,74,55,.06);border:1px solid rgba(5,74,55,.12);backdrop-filter:blur(8px);
  }
  .brand img{width:36px;height:36px;object-fit:contain}
  .brand span{font-size:17px;font-weight:600;color:var(--green-deep);letter-spacing:.02em}
  .card{
    width:100%;max-width:520px;
    padding:44px 40px 36px;border-radius:28px;
    background:linear-gradient(180deg, #054a37 0%, #03382a 100%);
    color:var(--cream);
    box-shadow:0 40px 100px -30px rgba(3,56,42,.55), 0 0 0 1px rgba(3,56,42,.15);
  }
  .card h1{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:36px;line-height:1.05;color:var(--cream);margin:0 0 6px;letter-spacing:-.01em;
  }
  .card h1 em{font-style:italic;color:var(--lime)}
  .card .sub{font-size:14.5px;line-height:1.5;color:rgba(255,241,217,.7);margin:0 0 24px}
  .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .card label{
    display:block;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:rgba(255,241,217,.7);margin:16px 0 7px;
  }
  .card input,.auth-select{
    width:100%;padding:13px 15px;border-radius:12px;
    background:rgba(255,241,217,.08);color:var(--cream);
    border:1.5px solid rgba(255,241,217,.18);
    font-family:inherit;font-size:14.5px;
    transition:border-color .2s, box-shadow .2s, background .2s;
  }
  .card input::placeholder{color:rgba(255,241,217,.38)}
  .card input:focus,.auth-select:focus{
    outline:none;border-color:var(--lime);
    background:rgba(255,241,217,.12);box-shadow:0 0 0 4px rgba(171,208,50,.18);
  }
  .auth-select option{background:#054a37;color:var(--cream)}
  .auth-error{
    margin-top:14px;padding:10px 14px;border-radius:10px;
    background:rgba(250,85,40,.12);border:1px solid rgba(250,85,40,.4);
    color:#ffb29c;font-size:13px;
  }
  .submit{
    width:100%;margin-top:24px;padding:15px;border-radius:14px;
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
    .card{padding:32px 22px 24px;border-radius:22px}
    .card h1{font-size:30px}
    .row-2{grid-template-columns:1fr}
  }
`
