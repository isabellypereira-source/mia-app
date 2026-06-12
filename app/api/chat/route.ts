import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt } from '@/lib/ai/mia-system-prompt'
import { miaTools } from '@/lib/ai/tools'
import { retrieveContext } from '@/lib/ai/rag'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { messages, userContext, noTools, plainText, skipRag, jsonTask } = await req.json()
  console.log('[MIA] route hit | model:', process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'gemini-flash-latest', '| noTools:', noTools, '| plain:', !!plainText, '| jsonTask:', !!jsonTask, '| skipRag:', !!skipRag, '| msgs:', messages?.length)

  const lastMessage = messages[messages.length - 1]?.content ?? ''
  const ragContext = skipRag ? '' : await retrieveContext(lastMessage)

  const systemPrompt = buildSystemPrompt(userContext, { plainText: !!plainText, jsonTask: !!jsonTask })
  const systemWithRag = ragContext
    ? `${systemPrompt}\n\n## Contexto da base de conhecimento relevante:\n${ragContext}`
    : systemPrompt

  // Gemini por padrão (gratuito). Claude como fallback opcional se ANTHROPIC_API_KEY existir.
  const model = process.env.ANTHROPIC_API_KEY
    ? anthropic('claude-haiku-4-5-20251001')
    : google('gemini-flash-latest') // free tier — gemini-flash-latest resolve automaticamente para o modelo mais recente disponível

  const result = await streamText({
    model,
    system: systemWithRag,
    messages,
    tools: (noTools || plainText) ? undefined : miaTools,
    maxSteps: (noTools || plainText) ? 1 : 5,
    temperature: 0.3,
  })

  return result.toDataStreamResponse()
}
