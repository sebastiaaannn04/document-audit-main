'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { verifyDocumentHash, VerificationResult } from '@/app/actions/verifyActions'
import { calculateFileHash } from '@/lib/hashFile'
import { CheckCircle2, XCircle, UploadCloud, ArrowLeft, Loader2, ShieldCheck, FileDown } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) await processFile(e.dataTransfer.files[0])
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) await processFile(e.target.files[0])
  }

  const processFile = async (file: File) => {
    setIsVerifying(true)
    setResult(null)
    try {
      const hash = await calculateFileHash(file)
      setResult(await verifyDocumentHash(hash))
    } catch {
      setResult({ success: false, error: 'Error al procesar el archivo.' })
    } finally {
      setIsVerifying(false)
    }
  }

  const reset = () => {
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#ededed' }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        background: '#0f0f0f'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#3ECF8E', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#000' }}>D</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>DocAudit</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} />
          Volver al Panel
        </Link>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, background: 'rgba(62,207,142,0.1)',
            borderRadius: 12, border: '1px solid rgba(62,207,142,0.2)', marginBottom: 20
          }}>
            <ShieldCheck size={24} color="#3ECF8E" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Verificador de Documentos</h1>
          <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
            Sube cualquier archivo para comprobar si fue registrado en la plataforma. El hash se calcula en tu navegador — el archivo nunca sale de tu equipo.
          </p>
        </div>

        {/* Drop Zone */}
        {!result && !isVerifying && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#3ECF8E' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 12,
              padding: '56px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isDragging ? 'rgba(62,207,142,0.05)' : 'transparent',
              boxShadow: isDragging ? '0 0 0 1px rgba(62,207,142,0.15)' : 'none'
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            <UploadCloud size={36} color={isDragging ? '#3ECF8E' : '#444'} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Arrastra un archivo o haz clic para explorar</p>
            <p style={{ fontSize: 13, color: '#555' }}>Cualquier tipo de archivo — PDF, DOCX, XLSX, etc.</p>
          </div>
        )}

        {/* Loading */}
        {isVerifying && (
          <div style={{ textAlign: 'center', padding: '64px 32px', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <Loader2 size={32} color="#3ECF8E" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>Calculando firma criptográfica...</p>
            <p style={{ color: '#555', fontSize: 13, marginTop: 6 }}>Comparando con los registros inmutables</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background: '#1c1c1c',
            border: `1px solid ${result.success ? 'rgba(62,207,142,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 12, overflow: 'hidden'
          }}>
            {/* Result Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: `1px solid ${result.success ? 'rgba(62,207,142,0.1)' : 'rgba(239,68,68,0.1)'}`,
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              {result.success
                ? <CheckCircle2 size={28} color="#3ECF8E" />
                : <XCircle size={28} color="#ef4444" />
              }
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
                  {result.success ? 'Documento Auténtico' : 'No Encontrado'}
                </p>
                <p style={{ color: '#666', fontSize: 13 }}>
                  {result.success
                    ? 'El hash coincide con un registro existente en la base de datos'
                    : 'Este documento no existe o fue modificado después de su registro'
                  }
                </p>
              </div>
            </div>

            {/* Result Details */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result.success ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: '#151515', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Empresa Certificadora</p>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{result.document.uploaderName}</p>
                    </div>
                    <div style={{ background: '#151515', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Fecha de Registro</p>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{new Date(result.document.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div style={{ background: '#151515', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Nombre de Archivo Registrado</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{result.document.title}</p>
                  </div>
                  <div style={{ background: '#151515', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Firma SHA-256</p>
                    <p className="sb-mono" style={{ fontSize: 11, wordBreak: 'break-all', lineHeight: 1.7 }}>{result.document.hash}</p>
                  </div>
                </>
              ) : (
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{result.error}</p>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 28px', background: '#181818', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {result.success && (
                <a
                  href={`/api/certificate?hash=${result.document.hash}`}
                  download
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                    color: '#000', textDecoration: 'none',
                    background: '#3ECF8E',
                    transition: 'opacity 0.15s'
                  }}
                >
                  <FileDown size={14} />
                  Descargar Certificado PDF
                </a>
              )}
              <button onClick={reset} className="sb-btn-outline" style={{ fontSize: 13 }}>
                Verificar otro archivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
