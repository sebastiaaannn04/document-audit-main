'use client'

import { useState, useTransition, useRef } from 'react'
import { uploadNewVersion } from '@/app/actions/documentActions'
import { format } from 'date-fns'
import { FileText, ShieldCheck, Activity, User as UserIcon, Loader2, GitCommitHorizontal, ArrowUpCircle, FileDown } from 'lucide-react'

type DocumentProps = {
  document: {
    id: string
    title: string
    description: string | null
    category: string
    currentHash: string
    status: string
    createdAt: Date
    updatedAt: Date
    uploader: { name: string, email: string, role: string }
  }
}

type TimelineProps = {
  history: {
    id: string
    action: string
    hashValue: string
    timestamp: Date
    details: string | null
    user: { name: string, role: string }
  }[]
}

const ACTION_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  UPLOADED: { label: 'Subida Inicial', color: '#3ECF8E', bg: 'rgba(62,207,142,0.08)', border: 'rgba(62,207,142,0.2)' },
  VERSION_UPDATED: { label: 'Nueva Versión', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)' },
  VERIFIED: { label: 'Verificado', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  MODIFIED: { label: 'Modificado', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)' },
}

export function DocumentCard({
  document,
  isSelected,
  onClick,
  showUpdateForm = false
}: DocumentProps & { isSelected: boolean, onClick: () => void, showUpdateForm?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleUploadNewVersion = async (formData: FormData) => {
    setError(null); setSuccessMsg(null)
    startTransition(async () => {
      try {
        const response = await uploadNewVersion(document.id, formData)
        if (response.success) {
          setSuccessMsg('¡Nueva versión registrada correctamente! El historial ha sido actualizado.')
          if (formRef.current) formRef.current.reset()
        } else {
          setError(response.error || 'Ocurrió un error al procesar el archivo.')
        }
      } catch (err) {
        console.error('Version upload error:', err)
        setError('Error de conexión o fallo inesperado al subir la nueva versión.')
      }
    })
  }

  const isVersioned = document.status === 'VERSION_UPDATED'

  return (
    <div
      style={{
        background: isSelected ? 'rgba(62,207,142,0.04)' : '#1c1c1c',
        border: `1px solid ${isSelected ? 'rgba(62,207,142,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8,
        transition: 'all 0.15s ease',
        overflow: 'hidden'
      }}
    >
      {/* Card Header — clickable */}
      <div
        onClick={onClick}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 6, flexShrink: 0,
            background: isSelected ? 'rgba(62,207,142,0.1)' : 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={16} color={isSelected ? '#3ECF8E' : '#666'} />
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#ededed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {document.title}
              </p>
              <span style={{
                fontSize: 10, fontWeight: 500, color: '#999', background: 'rgba(255,255,255,0.06)', 
                padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap'
              }}>
                {document.category}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#555', marginTop: 1 }}>
              {format(new Date(document.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{
            padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 500,
            background: 'rgba(62,207,142,0.08)', color: '#3ECF8E',
            border: '1px solid rgba(62,207,142,0.15)'
          }}>
            {isVersioned ? 'v2+' : 'v1'}
          </span>
          <ShieldCheck size={13} color="#3ECF8E" />
        </div>
      </div>

      {/* Hash - always visible */}
      <div style={{ padding: '0 16px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <UserIcon size={11} color="#444" />
          <span style={{ fontSize: 12, color: '#555' }}>{document.uploader.name}</span>
        </div>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
          {document.uploader.email}
        </div>
        <p className="sb-mono" style={{ fontSize: 10.5, wordBreak: 'break-all', color: '#444', lineHeight: 1.6 }}>
          {document.currentHash}
        </p>
      </div>

      {/* Download Certificate Button — shows when selected */}
      {isSelected && (
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#181818' }}>
          <a
            href={`/api/certificate?documentId=${document.id}`}
            download
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              color: '#3ECF8E', textDecoration: 'none',
              border: '1px solid rgba(62,207,142,0.25)',
              background: 'rgba(62,207,142,0.05)',
              transition: 'all 0.15s'
            }}
          >
            <FileDown size={13} />
            Descargar Certificado PDF
          </a>
        </div>
      )}

      {/* Version Update Form — Only shows when selected */}
      {isSelected && showUpdateForm && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#181818' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <ArrowUpCircle size={13} color="#60a5fa" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9e9e9e' }}>Subir nueva versión</span>
          </div>

          {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.07)', borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)' }}>{error}</p>}
          {successMsg && <p style={{ fontSize: 12, color: '#3ECF8E', marginBottom: 8, padding: '6px 10px', background: 'rgba(62,207,142,0.07)', borderRadius: 4, border: '1px solid rgba(62,207,142,0.15)' }}>{successMsg}</p>}

          <form ref={formRef} action={handleUploadNewVersion} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="file"
              name="file"
              required
              style={{ flex: 1, fontSize: 12, color: '#888', minWidth: 0 }}
            />
            <button
              type="submit"
              disabled={isPending}
              className="sb-btn-outline"
              style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}
            >
              {isPending ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Subir'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export function AuditTimeline({ history }: TimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div style={{
        background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
        padding: '48px 24px', textAlign: 'center', color: '#444', fontSize: 14
      }}>
        No hay eventos en el historial de este documento.
      </div>
    )
  }

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Activity size={15} color="#3ECF8E" />
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Línea de Tiempo de Auditoría</h3>
        <span style={{ fontSize: 12, color: '#555' }}>— Registro Inmutable</span>
      </div>

      <div className="sb-card" style={{ overflow: 'hidden' }}>
        {history.map((log, index) => {
          const style = ACTION_STYLES[log.action] || ACTION_STYLES['UPLOADED']
          const isLast = index === history.length - 1

          return (
            <div key={log.id} style={{
              padding: '16px 20px',
              borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 14
            }}>
              {/* Left: Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: style.bg, border: `1px solid ${style.border}`
                }}>
                  {log.action === 'UPLOADED' ? <GitCommitHorizontal size={13} color={style.color} /> : <ArrowUpCircle size={13} color={style.color} />}
                </div>
                {!isLast && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', minHeight: 16 }} />}
              </div>

              {/* Right: Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    color: style.color, background: style.bg, border: `1px solid ${style.border}`,
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {style.label}
                  </span>
                  <time style={{ fontSize: 12, color: '#555' }}>
                    {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}
                  </time>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <UserIcon size={11} color="#444" />
                  <span style={{ fontSize: 12, color: '#777' }}>{log.user.name}</span>
                  <span style={{ fontSize: 12, color: '#444' }}>— {log.user.role}</span>
                </div>

                {log.details && (
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>{log.details}</p>
                )}

                <div style={{
                  background: '#151515', borderRadius: 6, padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <p style={{ fontSize: 11, color: '#444', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SHA-256</p>
                  <p className="sb-mono" style={{ wordBreak: 'break-all', fontSize: 11, lineHeight: 1.7 }}>{log.hashValue}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
