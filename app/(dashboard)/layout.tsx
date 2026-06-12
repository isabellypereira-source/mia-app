'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  { href: '/dashboard',      Icon: Home,             label: 'Início' },
  { href: '/formular',       Icon: FlaskConical,     label: 'Formular' },
  { href: '/formulacoes',    Icon: BookOpen,         label: 'Formulações' },
  { href: '/experimentos',   Icon: TestTube2,        label: 'Experimentos' },
  { href: '/parametros',     Icon: SlidersHorizontal,label: 'Parâmetros' },
  { href: '/caracterizacao', Icon: Microscope,       label: 'Caracterização' },
  { href: '/protocolos',     Icon: FileText,         label: 'Protocolos' },
  { href: '/biblioteca',     Icon: Library,          label: 'Biblioteca' },
  { href: '/exportar',       Icon: Download,         label: 'Exportar' },
  { href: '/chat',           Icon: MessageSquare,    label: 'Chat MIA' },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [phrase, setPhrase] = useState(WELCOME_PHRASES[0])

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
                  <h1>Bem-vinda, <em>Isabelly.</em></h1>
                  <p>{phrase}</p>
                </>
              ) : (
                <>
                  <h1>{NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'MIA'}</h1>
                  <p>Plataforma Morphê Intelligence Assistant</p>
                </>
              )}
            </div>
            <div className="head-right">
              <div className="search">
                <span className="ic"><Search size={16} strokeWidth={2} /></span>
                <input placeholder="Buscar formulação, ingrediente, protocolo…" />
              </div>
              <button
                className="icon-btn"
                aria-label="Alternar tema"
                onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
              >
                <span className="ic">{theme === 'dark' ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}</span>
              </button>
              <button className="icon-btn" aria-label="Notificações">
                <span className="ic"><Bell size={18} strokeWidth={1.8} /></span>
                <span className="badge-dot" />
              </button>
              <div className="profile">
                <div className="avatar">IP</div>
                <div className="info">
                  <div className="nm">Isabelly</div>
                  <div className="rl">Pesquisadora · Morphê</div>
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
    --accent-em:var(--lime);

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
    --accent-em:var(--orange);
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
    padding:22px 36px;
    background:var(--header-bg);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border-bottom:1px solid var(--header-border);
    transition:background .4s ease, border-color .4s ease;
    gap:24px;
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
