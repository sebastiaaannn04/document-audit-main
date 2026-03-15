import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatePDF } from '@/components/CertificatePDF'
import { getSupabaseServerClient } from '@/lib/supabase'
import React from 'react'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('documentId')
  const hash = searchParams.get('hash')

  if (!documentId && !hash) {
    return NextResponse.json({ error: 'documentId or hash is required' }, { status: 400 })
  }

  // Find the document
  const supabase = getSupabaseServerClient()
  const { data: document, error } = await supabase
    .from('documents')
    .select('id, title, current_hash, created_at, status, uploader:users(name)')
    .match(documentId ? { id: documentId } : { current_hash: hash! })
    .maybeSingle()

  if (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Error fetching document' }, { status: 500 })
  }

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Render the PDF certificate to a buffer
  const pdfElement = React.createElement(CertificatePDF, {
    data: {
      documentTitle: document.title,
      uploaderName: document.uploader?.name || '',
      hash: document.current_hash,
      createdAt: document.created_at,
      status: document.status,
    }
  })

  // @ts-expect-error — renderToBuffer accepts any valid React element from @react-pdf/renderer
  const buffer: Buffer = await renderToBuffer(pdfElement)

  // Build a safe filename
  const safeName = document.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-docaudit-${safeName}.pdf"`,
      'Cache-Control': 'no-store',
    }
  })
}
