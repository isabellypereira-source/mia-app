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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-morphe-dark-2/50">
        <div className="w-8 h-8 rounded-full bg-morphe-green/20 border border-morphe-green/30 flex items-center justify-center">
          <Sparkles size={14} className="text-morphe-green-light" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">MIA</h1>
          <p className="text-xs text-muted-foreground">Especialista em impressão 3D de alimentos</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-morphe-green/10 border border-morphe-green/20 flex items-center justify-center mb-6">
              <Sparkles size={28} className="text-morphe-green" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Olá, sou a MIA</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Posso ajudar com formulações, diagnóstico de problemas, parâmetros de impressão e muito mais.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s) }}
                  className="text-left text-sm px-4 py-3 rounded-lg border border-border bg-morphe-dark-2 hover:border-morphe-green/40 hover:bg-morphe-dark-3 transition-colors text-muted-foreground hover:text-foreground"
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
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-morphe-green/20 border border-morphe-green/30 flex-shrink-0 flex items-center justify-center">
              <Sparkles size={12} className="text-morphe-green-light" />
            </div>
            <div className="bg-morphe-dark-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-morphe-green rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-morphe-green rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-morphe-green rounded-full animate-bounce [animation-delay:300ms]" />
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
      <div className="px-6 py-4 border-t border-border bg-morphe-dark-2/50">
        <h3 className="text-sm font-semibold mb-2">Guia de Uso da MIA</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Formulações:</strong> Descreva o objetivo (ex: "pasta para cookies veganos") e deixe a MIA sugerir ingredientes e %.</p>
          <p>• <strong>Diagnóstico:</strong> Conte o que aconteceu (ex: "não extrusou, ponteira 0.8mm") para análise técnica.</p>
          <p>• <strong>Parâmetros:</strong> Forneça formulação, ponteira e formato para calcular velocidade, temperatura, etc.</p>
          <p>• <strong>Protocolos:</strong> Peça passos detalhados (ex: "protocolo de gelatinização de amido de batata").</p>
        </div>
      </div>
    </div>
  )
}
