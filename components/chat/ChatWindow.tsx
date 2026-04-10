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
    <div className="flex flex-col h-full bg-morphe-dark">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60 section-alt">
        <div className="w-9 h-9 rounded-xl bg-morphe-orange/15 border border-morphe-orange/30 flex items-center justify-center"
          style={{ boxShadow: '0 0 16px rgba(250,85,40,0.15)' }}>
          <Sparkles size={16} className="text-morphe-orange" />
        </div>
        <div>
          <h1 className="text-sm font-bold">MIA</h1>
          <p className="text-xs text-muted-foreground">Especialista em impressão 3D de alimentos</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-morphe-dark border border-border/60 rounded-lg px-3 py-1.5">
          <span className="status-online" />
          <span className="text-[11px] text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto animate-slide-up">
            <div
              className="w-16 h-16 rounded-2xl bg-morphe-orange/12 border border-morphe-orange/25 flex items-center justify-center mb-5"
              style={{ boxShadow: '0 0 32px rgba(250,85,40,0.12)' }}
            >
              <Sparkles size={28} className="text-morphe-orange" />
            </div>
            <h2 className="text-xl font-bold mb-2">Olá, sou a MIA</h2>
            <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
              Posso ajudar com formulações, diagnóstico de problemas, parâmetros de impressão e muito mais.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGESTOES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => { setInput(s) }}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border/60 bg-morphe-dark-2 hover:border-morphe-orange/35 hover:bg-morphe-orange/5 transition-all duration-200 text-muted-foreground hover:text-foreground animate-slide-up"
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
            <div className="w-7 h-7 rounded-full bg-morphe-orange/15 border border-morphe-orange/30 flex-shrink-0 flex items-center justify-center">
              <Sparkles size={12} className="text-morphe-orange" />
            </div>
            <div className="card-depth px-4 py-3" style={{ borderRadius: '0 1rem 1rem 1rem' }}>
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-morphe-orange rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-morphe-orange rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-morphe-orange rounded-full animate-bounce [animation-delay:300ms]" />
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
      <div className="px-6 py-4 border-t border-border/60 section-alt">
        <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Guia de uso</h3>
        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <p>• <span className="text-foreground/70 font-medium">Formulações:</span> Descreva o objetivo para a MIA sugerir ingredientes e %.</p>
          <p>• <span className="text-foreground/70 font-medium">Diagnóstico:</span> Conte o que aconteceu para análise técnica detalhada.</p>
          <p>• <span className="text-foreground/70 font-medium">Parâmetros:</span> Forneça formulação e ponteira para calcular velocidade e temp.</p>
          <p>• <span className="text-foreground/70 font-medium">Protocolos:</span> Peça passos detalhados de qualquer processo.</p>
        </div>
      </div>
    </div>
  )
}
