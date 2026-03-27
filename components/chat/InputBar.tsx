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
    <div className="px-6 py-4 border-t border-border bg-morphe-dark-2/30">
      <form onSubmit={onSubmit} className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre formulação, diagnóstico, parâmetros de impressão..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-morphe-dark-2 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-morphe-green transition-colors placeholder:text-muted-foreground/50 max-h-40 overflow-y-auto disabled:opacity-50"
          style={{ minHeight: '44px' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 flex-shrink-0 bg-morphe-green hover:bg-morphe-green-light disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
        >
          <Send size={15} className="text-white" />
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground/40 text-center mt-2">Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  )
}
