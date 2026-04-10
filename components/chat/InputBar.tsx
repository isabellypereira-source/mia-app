'use client'
import { Send } from 'lucide-react'
import { FormEvent, KeyboardEvent } from 'react'

interface Props {
  input: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function InputBar({ input, onChange, onSubmit, isLoading }: Props) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      form?.requestSubmit()
    }
  }

  return (
    <div className="px-6 py-4 border-t border-border/60 bg-morphe-dark">
      <form onSubmit={onSubmit} className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre formulação, diagnóstico, parâmetros de impressão..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-morphe-dark-2 border border-border/70 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50 max-h-40 overflow-y-auto disabled:opacity-50"
          style={{
            minHeight: '44px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(250,85,40,0.5)'
            e.target.style.boxShadow = '0 0 0 3px rgba(250,85,40,0.1), inset 0 2px 4px rgba(0,0,0,0.15)'
          }}
          onBlur={e => {
            e.target.style.borderColor = ''
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.15)'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 flex-shrink-0 bg-morphe-orange disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ transition: 'all 200ms ease' }}
          onMouseEnter={e => {
            if (!isLoading && input.trim()) {
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(250,85,40,0.45)'
              ;(e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={e => {
            ;(e.target as HTMLButtonElement).style.boxShadow = ''
            ;(e.target as HTMLButtonElement).style.transform = ''
          }}
        >
          <Send size={15} className="text-white" />
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground/40 text-center mt-2">Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  )
}
