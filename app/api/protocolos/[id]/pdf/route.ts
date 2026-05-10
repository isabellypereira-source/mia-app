import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { ProtocoloPDF } from '@/lib/protocolos/pdf'
import { getProtocolo } from '@/lib/protocolos/data'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const protocolo = getProtocolo(id)
  if (!protocolo) {
    return NextResponse.json({ error: 'Protocolo não encontrado' }, { status: 404 })
  }

  const stream = await renderToStream(<ProtocoloPDF p={protocolo} />)

  // Converter Node Readable -> Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
      stream.on('end', () => controller.close())
      stream.on('error', (err) => controller.error(err))
    },
  })

  return new NextResponse(webStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="protocolo_${id}_mia.pdf"`,
      'Cache-Control': 'no-cache',
    },
  })
}
