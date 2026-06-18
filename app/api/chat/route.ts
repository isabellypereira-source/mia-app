import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { createGroq } from '@ai-sdk/groq'
import { buildSystemPrompt } from '@/lib/ai/mia-system-prompt'
import { miaTools } from '@/lib/ai/tools'
import { retrieveContext } from '@/lib/ai/rag'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { messages, userContext, noTools, plainText, skipRag, jsonTask } = await req.json()

  const lastMessage = messages[messages.length - 1]?.content ?? ''
  const ragContext = skipRag ? '' : await retrieveContext(lastMessage)

  const systemPrompt = buildSystemPrompt(userContext, { plainText: !!plainText, jsonTask: !!jsonTask })
  const systemWithRag = ragContext
    ? `${systemPrompt}\n\n## Contexto da base de conhecimento relevante:\n${ragContext}`
    : systemPrompt

  // Prioridade: Anthropic → Groq → Google
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let model: any
  if (process.env.ANTHROPIC_API_KEY) {
    model = anthropic('claude-haiku-4-5-20251001')
  } else if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
    model = groq('llama-3.3-70b-versatile')
  } else {
    model = google('gemini-2.0-flash')
  }

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
