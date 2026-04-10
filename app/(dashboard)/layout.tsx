'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  SlidersHorizontal,
  TestTube2,
  Microscope,
  FileDown,
  Library,
  MessageSquare,
  Settings,
} from 'lucide-react'

const workflowItems = [
  { href: '/formular',       icon: FlaskConical,      label: 'Formular',       step: '1' },
  { href: '/formulacoes',    icon: BookOpen,           label: 'Formulações',    step: '2' },
  { href: '/parametros',     icon: SlidersHorizontal, label: 'Parâmetros',     step: '3' },
  { href: '/experimentos',   icon: TestTube2,          label: 'Experimentos',   step: '4' },
  { href: '/caracterizacao', icon: Microscope,         label: 'Caracterização', step: '5' },
  { href: '/protocolos',     icon: FileDown,           label: 'Protocolos',     step: '6' },
]

const extraItems = [
  { href: '/biblioteca', icon: Library,       label: 'Biblioteca' },
  { href: '/chat',       icon: MessageSquare, label: 'Chat MIA' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#fff8f1' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{
        background: '#fff2da',
        borderRight: '1px solid #e5d9c1',
      }}>
        {/* Logo */}
        <Link href="/dashboard" className="px-4 py-4 flex items-center gap-2.5 transition-opacity hover:opacity-80"
          style={{ borderBottom: '1px solid #e5d9c1' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-black text-xs text-white"
            style={{ background: '#003223' }}>M</div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight" style={{ color: '#003223' }}>MIA</span>
            <span className="text-[10px] ml-1.5 font-sans" style={{ color: '#707974' }}>by Morphê</span>
          </div>
        </Link>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {/* Início */}
          <Link href="/dashboard"
            className={pathname === '/dashboard' ? 'nav-item nav-item-active' : 'nav-item'}>
            <LayoutDashboard size={14} className="flex-shrink-0" />
            <span>Início</span>
          </Link>

          {/* Label Workflow */}
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest" style={{ color: '#bfc9c2' }}>
              Workflow
            </p>
          </div>

          {workflowItems.map(({ href, icon: Icon, label, step }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={active ? 'nav-item nav-item-active' : 'nav-item'}>
                <span className="w-4 text-[10px] font-display font-bold text-center flex-shrink-0"
                  style={{ color: active ? 'white' : '#bfc9c2' }}>{step}</span>
                <Icon size={13} className="flex-shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Label Ferramentas */}
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest" style={{ color: '#bfc9c2' }}>
              Ferramentas
            </p>
          </div>

          {extraItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={active ? 'nav-item nav-item-active' : 'nav-item'}>
                <Icon size={13} className="flex-shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Rodapé */}
        <div className="p-2.5 space-y-0.5" style={{ borderTop: '1px solid #e5d9c1' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="status-online flex-shrink-0" />
            <span className="text-[11px] font-sans truncate" style={{ color: '#707974' }}>MIA Online · Plano Free</span>
          </div>
          <Link href="/settings" className="nav-item">
            <Settings size={12} className="flex-shrink-0" />
            <span className="text-xs">Configurações</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden" style={{ background: '#fff8f1' }}>
        {children}
      </main>
    </div>
  )
}
