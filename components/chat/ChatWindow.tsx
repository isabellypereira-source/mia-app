'use client'
import { useChat } from 'ai/react'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'
import { useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'

const SUGESTOES = [
  'Quero formular uma pasta de batata-doce para impressão 3D',
  'Meu material não extrusa — como diagnostico o problema?',
  'Qual a concentração ideal de xantana para uma pasta proteica?',
  'Gere um protocolo de gelatinização de amido de mandioca',
]

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-[#fff8f1]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5d9c1] bg-[#fff2da]">
        <div className="w-9 h-9 rounded-xl bg-[rgba(0,50,35,0.10)] border border-[#e5d9c1] flex items-center justify-center">
          <Sparkles size={16} className="text-[#003223]" />
        </div>
        <div>
          <h1 className="text-sm font-bold">MIA</h1>
          <p className="text-xs text-[#58413c]">Especialista em impressão 3D de alimentos</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-[#fff8f1] border border-[#e5d9c1] rounded-lg px-3 py-1.5">
          <span className="status-online" />
          <span className="text-[11px] text-[#516600] font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto animate-slide-up">
            <div
              className="w-16 h-16 rounded-2xl bg-[rgba(0,50,35,0.08)] border border-[#e5d9c1] flex items-center justify-center mb-5"
            >
              <Sparkles size={28} className="text-[#003223]" />
            </div>
            <h2 className="text-xl font-bold mb-2">Olá, sou a MIA</h2>
            <p className="text-[#58413c] text-sm mb-7 leading-relaxed">
              Posso ajudar com formulações, diagnóstico de problemas, parâmetros de impressão e muito mais.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGESTOES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => { setInput(s) }}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-[#e5d9c1] bg-[#fff2da] hover:border-[#e5d9c1] hover:bg-[rgba(0,50,35,0.08)] transition-all duration-200 text-[#58413c] hover:text-[#211b0c] animate-slide-up"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-[rgba(0,50,35,0.10)] border border-[#e5d9c1] flex-shrink-0 flex items-center justify-center">
              <Sparkles size={12} className="text-[#003223]" />
            </div>
            <div className="bg-white rounded-2xl shadow-tonal px-4 py-3" style={{ borderRadius: '0 1rem 1rem 1rem' }}>
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-[#003223] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#003223] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#003223] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Guia */}
      <div className="px-6 py-4 border-t border-[#e5d9c1] bg-[#fff2da]">
        <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider text-[#58413c]">Guia de uso</h3>
        <div className="text-[11px] text-[#58413c] space-y-0.5">
          <p>• <span className="text-[#211b0c]/70 font-medium">Formulações:</span> Descreva o objetivo para a MIA sugerir ingredientes e %.</p>
          <p>• <span className="text-[#211b0c]/70 font-medium">Diagnóstico:</span> Conte o que aconteceu para análise técnica detalhada.</p>
          <p>• <span className="text-[#211b0c]/70 font-medium">Parâmetros:</span> Forneça formulação e ponteira para calcular velocidade e temp.</p>
          <p>• <span className="text-[#211b0c]/70 font-medium">Protocolos:</span> Peça passos detalhados de qualquer processo.</p>
        </div>
      </div>
    </div>
  )
}
