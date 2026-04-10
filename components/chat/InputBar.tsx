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
    <div className="px-6 py-4 border-t border-[#e5d9c1] bg-[#fff8f1]">
      <form onSubmit={onSubmit} className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre formulação, diagnóstico, parâmetros de impressão..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-[#fff2da] border border-[#e5d9c1] rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-[#58413c]/50 max-h-40 overflow-y-auto disabled:opacity-50"
          style={{ minHeight: '44px' }}
          onFocus={e => {
            e.target.style.borderColor = '#003223'
            e.target.style.boxShadow = '0 0 0 3px rgba(0,50,35,0.1)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e5d9c1'
            e.target.style.boxShadow = ''
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 flex-shrink-0 bg-[#003223] hover:bg-[#004d35] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
        >
          <Send size={15} className="text-white" />
        </button>
      </form>
      <p className="text-[10px] text-[#bfc9c2] text-center mt-2">Enter para enviar · Shift+Enter para nova linha</p>
    </div>
  )
}
