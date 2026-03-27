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
      <div className="flex gap-3 justify-end">
        <div className="bg-morphe-green/15 border border-morphe-green/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex-shrink-0 flex items-center justify-center">
          <User size={12} className="text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Parse content for special MIA cards
  const parts = parseMessageContent(message.content)

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-morphe-green/20 border border-morphe-green/30 flex-shrink-0 flex items-center justify-center mt-1">
        <Sparkles size={12} className="text-morphe-green-light" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {parts.map((part, i) => {
          if (part.type === 'card') {
            return <MiaCard key={i} data={part.data} />
          }
          return (
            <div key={i} className="bg-morphe-dark-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
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
    // Text before this block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text) parts.push({ type: 'text', content: text })
    }

    // Try to parse JSON
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

  // Remaining text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text) parts.push({ type: 'text', content: text })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }]
}
