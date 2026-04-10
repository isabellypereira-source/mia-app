'use client'
import { Message } from 'ai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, User } from 'lucide-react'
import { MiaCard } from './MiaCard'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end animate-fade-in">
        <div
          className="bg-morphe-orange/12 border border-morphe-orange/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"
          style={{ boxShadow: '0 2px 12px rgba(250,85,40,0.08)' }}
        >
          <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-morphe-dark-2 border border-border flex-shrink-0 flex items-center justify-center">
          <User size={12} className="text-muted-foreground" />
        </div>
      </div>
    )
  }

  const parts = parseMessageContent(message.content)

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-morphe-orange/15 border border-morphe-orange/30 flex-shrink-0 flex items-center justify-center mt-1">
        <Sparkles size={12} className="text-morphe-orange" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {parts.map((part, i) => {
          if (part.type === 'card') {
            return <MiaCard key={i} data={part.data} />
          }
          return (
            <div
              key={i}
              className="card-depth px-4 py-3"
              style={{ borderRadius: '0 1rem 1rem 1rem' }}
            >
              <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type Part =
  | { type: 'text'; content: string }
  | { type: 'card'; data: Record<string, unknown> }

function parseMessageContent(content: string): Part[] {
  const parts: Part[] = []
  const codeBlockRegex = /```json\n(\{[\s\S]*?\})\n```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text) parts.push({ type: 'text', content: text })
    }

    try {
      const data = JSON.parse(match[1])
      if (data.__type) {
        parts.push({ type: 'card', data })
      } else {
        parts.push({ type: 'text', content: match[0] })
      }
    } catch {
      parts.push({ type: 'text', content: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text) parts.push({ type: 'text', content: text })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }]
}
