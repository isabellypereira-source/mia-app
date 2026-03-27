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
  { href: '/formular',      icon: FlaskConical,       label: 'Formular',       step: '1' },
  { href: '/formulacoes',   icon: BookOpen,            label: 'Formulações',    step: '2' },
  { href: '/parametros',    icon: SlidersHorizontal,  label: 'Parâmetros',     step: '3' },
  { href: '/experimentos',  icon: TestTube2,           label: 'Experimentos',   step: '4' },
  { href: '/caracterizacao',icon: Microscope,          label: 'Caracterização', step: '5' },
  { href: '/protocolos',    icon: FileDown,            label: 'Protocolos',     step: '6' },
]

const extraItems = [
  { href: '/biblioteca',    icon: Library,             label: 'Biblioteca' },
  { href: '/chat',          icon: MessageSquare,       label: 'Chat MIA' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-morphe-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-morphe-dark-2 border-r border-border flex flex-col">
        <Link href="/dashboard" className="px-5 py-5 border-b border-border flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-morphe-orange font-bold text-lg tracking-tight">MIA</span>
          <span className="text-muted-foreground text-xs ml-1">by Morphê</span>
        </Link>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Início */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              pathname === '/dashboard'
                ? 'bg-morphe-orange/10 text-morphe-orange border border-morphe-orange/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-morphe-dark-3 border border-transparent'
            }`}
          >
            <span className="w-4" />
            <LayoutDashboard size={15} />
            <span>Início</span>
          </Link>

          {/* Divisor */}
          <div className="border-t border-border/40 my-2" />

          {/* Workflow 1-6 */}
          {workflowItems.map(({ href, icon: Icon, label, step }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-morphe-orange/10 text-morphe-orange border border-morphe-orange/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-morphe-dark-3 border border-transparent'
                }`}
              >
                <span className={`text-[10px] font-bold w-4 text-center ${active ? 'text-morphe-orange' : 'text-muted-foreground/50'}`}>
                  {step}
                </span>
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Divisor */}
          <div className="border-t border-border/40 my-2" />

          {/* Biblioteca + Chat */}
          {extraItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-morphe-orange/10 text-morphe-orange border border-morphe-orange/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-morphe-dark-3 border border-transparent'
                }`}
              >
                <span className="w-4" />
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-morphe-orange rounded-full animate-pulse" />
            MIA Online · Plano Free
          </div>
          <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-morphe-dark-3 transition-colors">
            <Settings size={12} />
            Configurações
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
