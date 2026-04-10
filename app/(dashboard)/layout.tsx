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
    <div className="flex h-screen bg-morphe-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-morphe-dark-2 relative">
        {/* Borda direita com gradiente */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent pointer-events-none" />

        {/* Logo */}
        <Link
          href="/dashboard"
          className="px-4 py-4 border-b border-border/60 flex items-center gap-2.5 hover:bg-morphe-dark-3/40 transition-colors"
        >
          <div className="w-7 h-7 bg-morphe-orange rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">M</span>
          </div>
          <div>
            <span className="text-foreground font-bold text-sm tracking-tight">MIA</span>
            <span className="text-muted-foreground text-[10px] ml-1.5">by Morphê</span>
          </div>
        </Link>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {/* Início */}
          <Link
            href="/dashboard"
            className={pathname === '/dashboard' ? 'nav-item-active' : 'nav-item text-muted-foreground'}
          >
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={14} />
            </span>
            <span className="text-sm">Início</span>
          </Link>

          {/* Label Workflow */}
          <div className="pt-2.5 pb-1 px-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Workflow</p>
          </div>

          {/* Workflow 1-6 */}
          {workflowItems.map(({ href, icon: Icon, label, step }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={active ? 'nav-item-active' : 'nav-item text-muted-foreground'}
              >
                <span className={`w-4 text-[10px] font-bold text-center flex-shrink-0 ${active ? 'text-morphe-orange' : 'text-muted-foreground/40'}`}>
                  {step}
                </span>
                <Icon size={13} className="flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}

          {/* Label Ferramentas */}
          <div className="pt-2.5 pb-1 px-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Ferramentas</p>
          </div>

          {/* Extras */}
          {extraItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={active ? 'nav-item-active' : 'nav-item text-muted-foreground'}
              >
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} />
                </span>
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Rodapé */}
        <div className="p-2.5 border-t border-border/60 space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="status-online flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground truncate">MIA Online · Plano Free</span>
          </div>
          <Link href="/settings" className="nav-item text-muted-foreground">
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <Settings size={12} />
            </span>
            <span className="text-xs">Configurações</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
