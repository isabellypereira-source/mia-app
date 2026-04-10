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
          className="bg-[rgba(0,50,35,0.08)] border border-[#e5d9c1] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"
        >
          <p className="text-sm text-[#211b0c] whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#fff2da] border border-[#e5d9c1] flex-shrink-0 flex items-center justify-center">
          <User size={12} className="text-[#58413c]" />
        </div>
      </div>
    )
  }

  const parts = parseMessageContent(message.content)

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-[rgba(0,50,35,0.10)] border border-[#e5d9c1] flex-shrink-0 flex items-center justify-center mt-1">
        <Sparkles size={12} className="text-[#003223]" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {parts.map((part, i) => {
          if (part.type === 'card') {
            return <MiaCard key={i} data={part.data} />
          }
          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-tonal px-4 py-3"
              style={{ borderRadius: '0 1rem 1rem 1rem' }}
            >
              <div className="prose prose-sm max-w-none text-sm text-[#211b0c] leading-relaxed">
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
