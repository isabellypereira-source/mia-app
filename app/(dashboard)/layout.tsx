'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FlaskConical,
  BookOpen,
  SlidersHorizontal,
  TestTube2,
  Microscope,
  FileDown,
} from 'lucide-react'

const navItems = [
  { href: '/formular',      icon: FlaskConical,       label: 'Formular',       step: '1' },
  { href: '/formulacoes',   icon: BookOpen,            label: 'Formulações',    step: '2' },
  { href: '/parametros',    icon: SlidersHorizontal,  label: 'Parâmetros',     step: '3' },
  { href: '/experimentos',  icon: TestTube2,           label: 'Experimentos',   step: '4' },
  { href: '/caracterizacao',icon: Microscope,          label: 'Caracterização', step: '5' },
  { href: '/protocolos',    icon: FileDown,            label: 'Protocolos',     step: '6' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-morphe-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-morphe-dark-2 border-r border-border flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <span className="text-morphe-orange font-bold text-lg tracking-tight">MIA</span>
          <span className="text-muted-foreground text-xs ml-2">by Morphê</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, step }) => {
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
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-morphe-orange rounded-full" />
            Plano Free
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
