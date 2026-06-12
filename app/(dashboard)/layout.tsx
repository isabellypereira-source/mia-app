'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  FlaskConical,
  BookOpen,
  TestTube2,
  SlidersHorizontal,
  Microscope,
  FileText,
  Library,
  Download,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',      Icon: Home,             label: 'Início',         tagline: 'Pronta para a próxima formulação?' },
  { href: '/formular',       Icon: FlaskConical,     label: 'Formular',       tagline: 'Comece sua próxima formulação' },
  { href: '/formulacoes',    Icon: BookOpen,         label: 'Formulações',    tagline: 'Suas criações, versões e histórico' },
  { href: '/parametros',     Icon: SlidersHorizontal,label: 'Parâmetros',     tagline: 'Calibre o processo para a sua formulação' },
  { href: '/experimentos',   Icon: TestTube2,        label: 'Experimentos',   tagline: 'Mantenha cada impressão anotada e organizada' },
  { href: '/caracterizacao', Icon: Microscope,       label: 'Caracterização', tagline: 'Meça, analise e documente' },
  { href: '/protocolos',     Icon: FileText,         label: 'Protocolos',     tagline: 'Métodos validados, prontos para usar' },
  { href: '/biblioteca',     Icon: Library,          label: 'Biblioteca',     tagline: 'Conhecimento curado sobre impressão 3D de alimentos' },
  { href: '/exportar',       Icon: Download,         label: 'Exportar',       tagline: 'Documente e compartilhe seus resultados' },
  { href: '/chat',           Icon: MessageSquare,    label: 'Chat MIA',       tagline: 'Conversa direta com a inteligência da MIA' },
]

const ALGAE = [
  { src: '/algae/55.png', left: '-30px', right: 'auto', width: '220px', duration: 10, delay: 0 },
  { src: '/algae/54.png', left: '160px', right: 'auto', width: '170px', duration: 12, delay: 1.4 },
  { src: '/algae/51.png', left: '320px', right: 'auto', width: '150px', duration: 13, delay: 0.6 },
  { src: '/algae/53.png', left: 'auto', right: '-40px', width: '240px', duration: 11, delay: 2.2 },
  { src: '/algae/52.png', left: 'auto', right: '140px', width: '180px', duration: 12.5, delay: 0.9 },
]

const WELCOME_PHRASES = [
  'Pronta para a próxima formulação?',
  'Bom te ver de volta na bancada.',
  'Continue de onde parou.',
  'Sua próxima formulação te espera.',
]

function detectGender(nome: string | null | undefined, stored?: string | null): 'f' | 'm' | 'x' {
  if (stored === 'f' || stored === 'm' || stored === 'x') return stored
  if (!nome) return 'x'
  const first = nome.trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (!first) return 'x'
  const last = first.slice(-1)
  // exceções comuns masculinas terminadas em 'a'
  const excMasc = ['joshua', 'luca', 'noa', 'aba', 'akira']
  if (excMasc.includes(first)) return 'm'
  if (last === 'a' || last === 'y' || last === 'e') return 'f'
  if (last === 'o' || last === 'r') return 'm'
  return 'x'
}

function greetingFor(g: 'f' | 'm' | 'x') {
  if (g === 'f') return 'Bem-vinda'
  if (g === 'm') return 'Bem-vindo'
  return 'Bem-vindo(a)'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [phrase, setPhrase] = useState(WELCOME_PHRASES[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<{ nome: string; greet: string; iniciais: string; cargo: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user?.user_metadata || {}) as { nome?: string; gender?: string; cargo?: string }
      const email = data.user?.email || ''
      const nomeRaw = meta.nome?.trim() || email.split('@')[0] || 'Pesquisador(a)'
      const primeiroNome = nomeRaw.split(/\s+/)[0]
      const g = detectGender(nomeRaw, meta.gender)
      const iniciais = nomeRaw.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || 'U'
      setUser({
        nome: primeiroNome,
        greet: greetingFor(g),
        iniciais,
        cargo: meta.cargo || 'Pesquisador(a) · Morphê',
      })
    })
  }, [])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (!q) return
    router.push(`/formulacoes?q=${encodeURIComponent(q)}`)
  }

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('mia-theme')) as 'dark' | 'light' | null
    if (stored) setTheme(stored)
    setPhrase(WELCOME_PHRASES[Math.floor(Math.random() * WELCOME_PHRASES.length)])
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('mia-theme', theme)
  }, [theme])

  const isHome = pathname === '/dashboard'

  return (
    <div className={`dash-root ${theme === 'light' ? 'theme-light' : ''}`}>
      <style>{DASH_CSS}</style>

      <div className="algae-layer" aria-hidden="true">
        {ALGAE.map((a, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={a.src}
            alt=""
            className="algae"
            style={{
              left: a.left,
              right: a.right,
              width: a.width,
              animationDuration: `${a.duration}s`,
              animationDelay: `${a.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="shell">
        <aside className="sidebar">
          <div className="brand-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mia-logo.png" alt="MIA" />
            <span className="brand-txt">MIA</span>
          </div>
          {NAV.map(({ href, Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={`navitem ${active ? 'active' : ''}`} title={label}>
                <span className="ic"><Icon size={20} strokeWidth={1.8} /></span>
                <span className="lbl">{label}</span>
              </Link>
            )
          })}
          <div className="footer-nav">
            <Link href="/settings" className={`navitem ${pathname.startsWith('/settings') ? 'active' : ''}`} title="Configurações">
              <span className="ic"><Settings size={20} strokeWidth={1.8} /></span>
              <span className="lbl">Configurações</span>
            </Link>
          </div>
        </aside>

        <main className="stage">
          <header className="top">
            <div className="greeting">
              {isHome ? (
                <>
                  <h1>{user?.greet || 'Bem-vindo(a)'}, <em>{user?.nome || 'colega'}.</em></h1>
                  <p>{phrase}</p>
                </>
              ) : (
                (() => {
                  const cur = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
                  return (
                    <>
                      <h1>{cur?.label || 'MIA'}</h1>
                      <p>{cur?.tagline || 'Morphê Intelligence Assistant'}</p>
                    </>
                  )
                })()
              )}
            </div>
            <div className="head-right">
              <form className="search" onSubmit={onSearchSubmit}>
                <span className="ic"><Search size={16} strokeWidth={2} /></span>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar formulação, ingrediente, protocolo…"
                  type="search"
                />
              </form>
              <button
                className="icon-btn"
                aria-label="Alternar tema"
                onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
              >
                <span className="ic">{theme === 'dark' ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}</span>
              </button>
              <button className="icon-btn" aria-label="Notificações">
                <span className="ic"><Bell size={18} strokeWidth={1.8} /></span>
              </button>
              <div className="profile">
                <div className="avatar">{user?.iniciais || 'U'}</div>
                <div className="info">
                  <div className="nm">{user?.nome || 'Você'}</div>
                  <div className="rl">{user?.cargo || 'Pesquisador(a) · Morphê'}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="content">{children}</div>
        </main>
      </div>
    </div>
  )
}

const DASH_CSS = `
  .dash-root{
    --cream:#fff1d9; --cream-2:#f6e5c5; --cream-3:#efe2bf;
    --green-deep:#03382a; --green:#054a37; --green-mid:#196454;
    --lime:#abd032; --orange:#fa5528;

    --bg-grad-1:#054a37; --bg-grad-2:#03382a;
    --surface-glass:rgba(255,241,217,.06);
    --surface-glass-strong:rgba(255,241,217,.08);
    --border-glass:rgba(255,241,217,.1);
    --border-glass-strong:rgba(255,241,217,.12);
    --text-main:#fff1d9;
    --text-muted:rgba(255,241,217,.7);
    --text-faint:rgba(255,241,217,.55);
    --algae-opacity:.35;
    --bell-border:#084938;
    --avatar-bg:var(--lime);
    --avatar-text:var(--green-deep);
    --header-bg:rgba(255,241,217,.04);
    --header-border:rgba(255,241,217,.08);
    --hover-tint:rgba(255,241,217,.12);
    --accent:var(--lime);
    --accent-text-on:var(--green-deep);
    --accent-em:var(--lime);
    --icon-tint:rgba(171,208,50,.18);

    position:fixed;inset:0;
    font-family:var(--font-sans),system-ui,sans-serif;color:var(--text-main);
    background:linear-gradient(180deg,var(--bg-grad-1) 0%,var(--bg-grad-2) 100%);
    overflow:hidden;
    transition:background .5s ease, color .3s ease;
  }
  .dash-root.theme-light{
    --bg-grad-1:#fff6e3; --bg-grad-2:#f0e0bd;
    --surface-glass:rgba(5,74,55,.06);
    --surface-glass-strong:rgba(255,255,255,.55);
    --border-glass:rgba(5,74,55,.08);
    --border-glass-strong:rgba(5,74,55,.12);
    --text-main:#03382a;
    --text-muted:rgba(5,74,55,.7);
    --text-faint:rgba(5,74,55,.5);
    --algae-opacity:.55;
    --bell-border:#fff1d9;
    --avatar-bg:var(--green-deep);
    --avatar-text:var(--lime);
    --header-bg:rgba(255,255,255,.5);
    --header-border:rgba(5,74,55,.1);
    --hover-tint:rgba(5,74,55,.08);
    --accent:var(--orange);
    --accent-text-on:#fff;
    --accent-em:var(--orange);
    --icon-tint:rgba(250,85,40,.14);
  }
  .dash-root *{box-sizing:border-box}

  .dash-root .algae-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
  .dash-root .algae{
    position:absolute;bottom:-50px;opacity:var(--algae-opacity);
    animation:dashsway ease-in-out infinite alternate;
    transform-origin:50% 100%;
    filter:drop-shadow(0 8px 28px rgba(0,0,0,.2));
    transition:opacity .5s ease;
  }
  @keyframes dashsway{
    0%   { transform: rotate(-8deg) translateX(-12px); }
    50%  { transform: rotate(6deg) translateX(14px); }
    100% { transform: rotate(-9deg) translateX(-14px); }
  }

  .dash-root .shell{
    position:relative;z-index:5;
    display:grid;grid-template-columns:84px 1fr;height:100vh;
    transition:grid-template-columns .35s cubic-bezier(.2,.8,.2,1);
  }
  .dash-root .shell:has(aside.sidebar:hover){ grid-template-columns:240px 1fr }

  .dash-root aside.sidebar{
    position:relative;
    background:var(--surface-glass);
    border-right:1px solid var(--border-glass);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    width:100%;overflow:hidden;
    display:flex;flex-direction:column;
    padding:22px 18px;
  }
  .dash-root .brand-wrap{display:flex;align-items:center;gap:12px;height:48px;margin-bottom:22px}
  .dash-root .brand-wrap img{width:48px;height:48px;flex-shrink:0;object-fit:contain}
  .dash-root .brand-wrap .brand-txt{
    font-weight:600;font-size:18px;color:var(--text-main);letter-spacing:.02em;
    opacity:0;transition:opacity .25s ease .1s;white-space:nowrap;
  }
  .dash-root .shell:has(aside.sidebar:hover) .brand-txt{opacity:1}

  .dash-root .navitem{
    display:flex;align-items:center;gap:14px;
    padding:11px 12px;border-radius:12px;
    text-decoration:none;color:var(--text-muted);
    font-size:14px;margin-bottom:3px;
    transition:background .2s ease, color .2s ease;
    white-space:nowrap;
  }
  .dash-root .navitem .ic{width:22px;height:22px;flex-shrink:0;display:grid;place-items:center}
  .dash-root .navitem .lbl{opacity:0;transition:opacity .25s ease .1s}
  .dash-root .shell:has(aside.sidebar:hover) .navitem .lbl{opacity:1}
  .dash-root .navitem:hover, .dash-root .navitem.active{
    background:var(--lime);color:var(--green-deep);font-weight:600;
  }

  .dash-root .footer-nav{margin-top:auto;border-top:1px solid var(--border-glass);padding-top:12px}

  .dash-root main.stage{display:flex;flex-direction:column;overflow:hidden;position:relative;min-width:0}
  .dash-root header.top{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 36px;
    background:transparent;
    border-bottom:1px solid var(--border-glass);
    transition:border-color .4s ease;
    gap:24px;
  }
  .dash-root header.top .search,
  .dash-root header.top .icon-btn,
  .dash-root header.top .profile{
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
  }
  .dash-root .greeting h1{
    font-family:var(--font-serif),serif;font-style:italic;font-weight:400;
    font-size:32px;color:var(--text-main);margin:0;letter-spacing:-.01em;line-height:1.05;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:560px;
  }
  .dash-root .greeting h1 em{color:var(--accent-em)}
  .dash-root .greeting p{font-size:13px;color:var(--text-faint);margin:4px 0 0}

  .dash-root .head-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
  .dash-root .search{
    position:relative;
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass-strong);
    border-radius:999px;
    padding:9px 18px 9px 42px;
    width:260px;
    transition:border-color .2s, background .2s, width .25s ease;
  }
  .dash-root .search .ic{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-faint);width:18px;height:18px;display:grid;place-items:center}
  .dash-root .search input{
    background:transparent;border:none;outline:none;color:var(--text-main);
    font-family:inherit;font-size:13.5px;width:100%;
  }
  .dash-root .search input::placeholder{color:var(--text-faint)}
  .dash-root .search:focus-within{border-color:var(--lime);background:var(--hover-tint);width:300px}

  .dash-root .icon-btn{
    position:relative;
    width:40px;height:40px;border-radius:50%;
    display:grid;place-items:center;
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass-strong);
    color:var(--text-muted);
    cursor:pointer;transition:.2s;
  }
  .dash-root .icon-btn:hover{background:var(--hover-tint);color:var(--text-main)}
  .dash-root .icon-btn .badge-dot{
    position:absolute;top:8px;right:9px;width:9px;height:9px;border-radius:50%;
    background:var(--orange);border:2px solid var(--bell-border);
  }

  .dash-root .profile{
    display:flex;align-items:center;gap:10px;
    padding:5px 12px 5px 5px;border-radius:999px;
    background:var(--surface-glass-strong);
    border:1px solid var(--border-glass-strong);
    cursor:pointer;transition:.2s;
  }
  .dash-root .profile:hover{background:var(--hover-tint)}
  .dash-root .profile .avatar{
    width:34px;height:34px;border-radius:50%;
    background:var(--avatar-bg);color:var(--avatar-text);
    display:grid;place-items:center;font-weight:600;font-size:13px;
  }
  .dash-root .profile .info .nm{font-size:13px;font-weight:600;color:var(--text-main);line-height:1}
  .dash-root .profile .info .rl{font-size:11px;color:var(--text-faint);margin-top:3px}

  .dash-root .content{padding:34px 36px;color:var(--text-main);overflow:auto;flex:1}

  /* ─── global overrides for legacy pages ──────────────────────────────
     Forces all white/cream solid surfaces inside the dashboard to become
     glass and adapts text colors to the active theme.
  */
  .dash-root .content > .h-full,
  .dash-root .content > div[class*="bg-["],
  .dash-root .content [class*="bg-[#fff"],
  .dash-root .content [class*="bg-[#fdf"],
  .dash-root .content [class*="bg-[#fef"]{
    background:transparent !important;
  }
  .dash-root .content .bg-white{
    background:var(--surface-glass-strong) !important;
    border:1px solid var(--border-glass-strong);
    color:var(--text-main);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
  }
  .dash-root .content .shadow-tonal,
  .dash-root .content .shadow-tonal-lg,
  .dash-root .content .card-depth{
    box-shadow:0 24px 50px -24px rgba(0,0,0,.25);
  }
  .dash-root .content [class*="border-[#e5d9c1]"],
  .dash-root .content [class*="border-[#"],
  .dash-root .content .border{
    border-color:var(--border-glass) !important;
  }
  .dash-root .content [class*="text-[#58413c]"],
  .dash-root .content [class*="text-[#707974]"],
  .dash-root .content [class*="text-[#bfc9c2]"]{
    color:var(--text-muted) !important;
  }
  .dash-root .content [class*="text-[#003223]"],
  .dash-root .content [class*="text-[#054a37]"],
  .dash-root .content [class*="text-[#211b0c]"]{
    color:var(--text-main) !important;
  }
  .dash-root .content [class*="text-[#fff1d9]"]{
    color:var(--text-main) !important;
  }
  .dash-root .content [style*="background: #fff"],
  .dash-root .content [style*="background:#fff"],
  .dash-root .content [style*="background-color: #fff"],
  .dash-root .content [style*="background: rgba(255"],
  .dash-root .content [style*="background: white"],
  .dash-root .content [style*="background: #003223"],
  .dash-root .content [style*="background: #054a37"]{
    background:var(--surface-glass-strong) !important;
    border-color:var(--border-glass-strong) !important;
    backdrop-filter:blur(16px);
  }
  .dash-root .content .section-alt{
    background:transparent !important;
  }
  .dash-root .content input,
  .dash-root .content textarea,
  .dash-root .content select{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
  }
  .dash-root .content input::placeholder,
  .dash-root .content textarea::placeholder{
    color:var(--text-faint) !important;
  }
  .dash-root .content table{background:transparent}
  .dash-root .content thead tr,
  .dash-root .content thead th{
    background:var(--surface-glass) !important;
    color:var(--text-main);
    border-bottom:1px solid var(--border-glass-strong);
  }
  .dash-root .content tbody tr{
    border-bottom:1px solid var(--border-glass);
  }
  .dash-root .content tbody tr:hover{background:var(--surface-glass)}
  .dash-root .content td,
  .dash-root .content th{color:var(--text-main)}
  .dash-root .content .btn-primary{
    background:var(--accent) !important;
    color:var(--accent-text-on) !important;
    border:none !important;
  }
  .dash-root .content .btn-outline{
    background:transparent !important;
    color:var(--text-main) !important;
    border:1.5px solid var(--text-main) !important;
  }
  .dash-root .content .btn-ghost{
    background:var(--surface-glass) !important;
    color:var(--text-main) !important;
    border:1px solid var(--border-glass) !important;
  }
  .dash-root .content .input-premium{
    background:var(--surface-glass) !important;
    border:1px solid var(--border-glass-strong) !important;
    color:var(--text-main) !important;
  }
  .dash-root .content .tab-pill-active{
    background:var(--accent) !important;
    color:var(--accent-text-on) !important;
  }
  .dash-root .content .tab-pill-inactive{
    background:var(--surface-glass) !important;
    color:var(--text-muted) !important;
  }
  .dash-root .content .badge-pill,
  .dash-root .content .badge-lime{
    background:var(--icon-tint) !important;
    color:var(--accent-em) !important;
    border:1px solid var(--border-glass-strong) !important;
  }
  .dash-root .content .divider-gradient{
    background:linear-gradient(90deg,transparent,var(--border-glass-strong),transparent) !important;
  }
  .dash-root .content .nav-item{
    color:var(--text-muted) !important;
    background:transparent !important;
  }
  .dash-root .content .nav-item-active{
    background:var(--accent) !important;
    color:var(--accent-text-on) !important;
  }

  /* hex-specific overrides for all legacy hardcoded colors */
  .dash-root .content [style*="#fff8f1"],
  .dash-root .content [style*="#fff2da"],
  .dash-root .content [style*="#f9edd4"],
  .dash-root .content [style*="#f0f9ff"],
  .dash-root .content [class*="bg-[#fff2da]"],
  .dash-root .content [class*="bg-[#fff8f1]"],
  .dash-root .content [class*="bg-[#f9edd4]"]{
    background:transparent !important;
  }
  .dash-root .content [style*="#003223"],
  .dash-root .content [style*="#054a37"],
  .dash-root .content [style*="#1a2e1a"],
  .dash-root .content [class*="bg-[#003223]"],
  .dash-root .content [class*="bg-[#004d35]"]{
    background:var(--surface-glass-strong) !important;
    color:var(--text-main) !important;
    backdrop-filter:blur(16px);
    border:1px solid var(--border-glass-strong);
  }
  .dash-root .content button[style*="#003223"],
  .dash-root .content a[style*="#003223"],
  .dash-root .content button[style*="#054a37"],
  .dash-root .content a[style*="#054a37"],
  .dash-root .content [class*="bg-[#003223]"]:is(button,a),
  .dash-root .content [class*="bg-[#004d35]"]:is(button,a){
    background:var(--accent) !important;
    color:var(--accent-text-on) !important;
    border:none !important;
  }
  .dash-root .content [style*="#c8ee4f"],
  .dash-root .content [style*="#516600"],
  .dash-root .content [style*="#abd032"]{
    background:var(--accent) !important;
    color:var(--accent-text-on) !important;
  }
  .dash-root .content [style*="color: #003223"],
  .dash-root .content [style*="color:#003223"],
  .dash-root .content [style*="color: '#003223"]{
    color:var(--text-main) !important;
  }
  .dash-root .content [style*="color: #58413c"],
  .dash-root .content [style*="color:#58413c"],
  .dash-root .content [style*="color: #707974"]{
    color:var(--text-muted) !important;
  }
  .dash-root .content [class*="border-[#e5d9c1]"],
  .dash-root .content [class*="border-[#"]{
    border-color:var(--border-glass) !important;
  }
  .dash-root .content .shadow-tonal,
  .dash-root .content [class*="shadow-"]{
    box-shadow:0 12px 36px -18px rgba(0,0,0,.3) !important;
  }
  .dash-root .content h1,
  .dash-root .content h2,
  .dash-root .content h3,
  .dash-root .content h4{color:var(--text-main)}
  /* generic paragraphs without explicit color */
  .dash-root .content p,
  .dash-root .content span,
  .dash-root .content li,
  .dash-root .content td,
  .dash-root .content label{color:var(--text-main)}
  .dash-root .content .text-xs,
  .dash-root .content .text-sm{color:inherit}
  /* rounded card-ish wrappers */
  .dash-root .content .rounded-2xl,
  .dash-root .content .rounded-xl,
  .dash-root .content .rounded-3xl{
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
  }
  /* fix any element that has a solid white-ish inline bg */
  .dash-root .content [style*="background-color: white"],
  .dash-root .content [style*="background-color:#fff"]{
    background-color:var(--surface-glass-strong) !important;
    color:var(--text-main) !important;
  }

  /* ============================================================
     EXTRA AGGRESSIVE OVERRIDES — catch every remaining hex pattern
     used by the legacy pages so they all blend into the theme.
     ============================================================ */
  /* every cream-ish surface => transparent so the algae bg shows */
  .dash-root .content [style*="#fff2da"],
  .dash-root .content [style*="#f9edd4"],
  .dash-root .content [style*="#fff6e3"],
  .dash-root .content [style*="#fdf"],
  .dash-root .content [style*="#fef"],
  .dash-root .content [style*="#f5ecd6"],
  .dash-root .content [style*="#fbf6e7"],
  .dash-root .content [style*="#e5d9c1"]{
    background:transparent !important;
    background-color:transparent !important;
  }
  /* every deep-green surface used as solid background => glass card */
  .dash-root .content [style*="background: #003223"],
  .dash-root .content [style*="background:#003223"],
  .dash-root .content [style*="background: #054a37"],
  .dash-root .content [style*="background:#054a37"],
  .dash-root .content [style*="background: #00503a"],
  .dash-root .content [style*="background: #1a2e1a"],
  .dash-root .content [style*="background-color: #003223"]{
    background:var(--surface-glass-strong) !important;
    background-color:var(--surface-glass-strong) !important;
    color:var(--text-main) !important;
    border:1px solid var(--border-glass-strong);
    backdrop-filter:blur(16px);
  }
  /* same hex but on buttons => accent CTA */
  .dash-root .content button[style*="#003223"],
  .dash-root .content button[style*="#054a37"],
  .dash-root .content button[style*="#00503a"],
  .dash-root .content a[style*="#003223"]{
    background:var(--accent) !important;
    background-color:var(--accent) !important;
    color:var(--accent-text-on) !important;
    border-color:transparent !important;
  }
  /* legacy text colors -> themed text */
  .dash-root .content [style*="color: #211b0c"],
  .dash-root .content [style*="color:#211b0c"],
  .dash-root .content [style*="color: white"]{
    color:var(--text-main) !important;
  }
  .dash-root .content [style*="color: #003223"],
  .dash-root .content [style*="color:#003223"]{
    color:var(--text-main) !important;
  }
  /* legacy borders */
  .dash-root .content [style*="borderColor: '#e5d9c1'"],
  .dash-root .content [style*="border-color: #e5d9c1"],
  .dash-root .content [style*="border: 1px solid #e5d9c1"]{
    border-color:var(--border-glass) !important;
  }
  /* legacy left-accent borders (e.g. validation cards) */
  .dash-root .content [style*="borderLeft: '3px solid"]{
    border-left:3px solid var(--accent) !important;
  }
  /* native select arrow in dark theme — give it a subtle hue */
  .dash-root .content select{
    background-image:linear-gradient(45deg,transparent 50%, var(--text-muted) 50%),linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
    background-position:calc(100% - 16px) center, calc(100% - 11px) center;
    background-size:5px 5px;background-repeat:no-repeat;
    -webkit-appearance:none;appearance:none;padding-right:34px !important;
  }
  /* native option popup — theme-aware:
     dark mode: dark green bg + cream text
     light mode: cream bg + green text
     selected: accent bg in both */
  .dash-root .content select option{
    background:#03382a !important;
    color:#fff1d9 !important;
    padding:10px 12px;
    font-family:inherit;
  }
  .dash-root.theme-light .content select option{
    background:#fff6e3 !important;
    color:#03382a !important;
  }
  .dash-root .content select option:checked,
  .dash-root .content select option:hover{
    background:#abd032 !important;
    color:#03382a !important;
    font-weight:600;
  }
  .dash-root.theme-light .content select option:checked,
  .dash-root.theme-light .content select option:hover{
    background:#fa5528 !important;
    color:#ffffff !important;
  }
  /* tabs with hardcoded green borders */
  .dash-root .content [class*="border-b-2"][class*="border-[#003223]"]{
    border-bottom-color:var(--accent-em) !important;
  }
  /* ring focus colors */
  .dash-root .content [class*="focus:ring-[#003223]"]:focus,
  .dash-root .content [class*="focus:border-[#003223]"]:focus{
    border-color:var(--accent) !important;
    box-shadow:0 0 0 4px var(--icon-tint) !important;
  }
  /* lime/cookbook-style chip backgrounds */
  .dash-root .content [style*="rgba(200,238,79"],
  .dash-root .content [style*="rgba(171,208,50"]{
    background:var(--icon-tint) !important;color:var(--accent-em) !important;
  }
  /* labels and helper text — strip dark green so they read on glass */
  .dash-root .content label,
  .dash-root .content .label{color:var(--text-main) !important}
  .dash-root .content small,
  .dash-root .content .hint{color:var(--text-faint) !important}
  /* trash/icon hover red staying readable */
  .dash-root .content .hover\\:text-red-400:hover{color:var(--orange) !important}
  /* fix input/textarea text inside the content wrapper if Tailwind tries to override */
  .dash-root .content input,
  .dash-root .content textarea{color:var(--text-main) !important}

  @media (max-width:1180px){
    .dash-root .profile .info{display:none}
    .dash-root .search{width:200px}
    .dash-root .search:focus-within{width:240px}
  }
  @media (max-width:920px){
    .dash-root .greeting h1{font-size:26px;max-width:280px}
    .dash-root .search{display:none}
  }
`
