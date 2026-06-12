export function extractAiStreamText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(extractAiStreamText).join('')
  }
  if (typeof value === 'object') {
    const payload = value as Record<string, unknown>
    const candidates = ['text', 'delta', 'content', 'message', 'data', 'output']
    for (const key of candidates) {
      if (key in payload && payload[key] !== undefined) {
        const extracted = extractAiStreamText(payload[key])
        if (extracted) return extracted
      }
    }
    return Object.values(payload)
      .map(extractAiStreamText)
      .join('')
  }
  return ''
}

export function parseStreamLine(line: string): string {
  const trimmed = line.trim()
  if (!trimmed) return ''

  const payload = trimmed.startsWith('0:') ? trimmed.slice(2) : trimmed
  if (!payload) return ''

  try {
    const parsed = JSON.parse(payload)
    return extractAiStreamText(parsed)
  } catch {
    return ''
  }
}

export async function readStreamText(
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
  onTextChunk?: (chunk: string) => void,
): Promise<string> {
  if (!reader) return ''

  const decoder = new TextDecoder()
  let text = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const chunkText = parseStreamLine(line)
      if (!chunkText) continue
      text += chunkText
      onTextChunk?.(chunkText)
    }
  }

  if (buffer) {
    const chunkText = parseStreamLine(buffer)
    if (chunkText) {
      text += chunkText
      onTextChunk?.(chunkText)
    }
  }

  return text
}
