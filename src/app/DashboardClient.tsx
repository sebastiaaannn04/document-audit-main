'use client'

import { useState, useEffect } from 'react'
import UploadDocumentForm from '@/components/UploadDocumentForm'
import { DocumentCard, AuditTimeline } from '@/components/AuditTimeline'
import { getDocumentHistory } from '@/app/actions/documentActions'
import { Archive, GitFork, Layers } from 'lucide-react'

export default function DashboardClient({
  initialDocuments,
  userRole,
  currentUserId
}: {
  initialDocuments: any[]
  userRole: string
  currentUserId: string
}) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (userRole === 'AUDITOR' && initialDocuments.length > 0 && !selectedDoc) {
      handleSelectDocument(initialDocuments[0].id)
    }
  }, [userRole, initialDocuments])

  const handleSelectDocument = async (id: string) => {
    setSelectedDoc(id)
    setIsLoadingHistory(true)
    const logs = await getDocumentHistory(id)
    setHistory(logs)
    setIsLoadingHistory(false)
  }

  const isCompany = userRole === 'COMPANY'

  return (
    <div>
      {/* Role Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12,
          padding: '4px 10px', borderRadius: 6,
          background: isCompany ? 'rgba(62,207,142,0.06)' : 'rgba(96,165,250,0.06)',
          border: `1px solid ${isCompany ? 'rgba(62,207,142,0.15)' : 'rgba(96,165,250,0.15)'}`,
          color: isCompany ? '#3ECF8E' : '#60a5fa', fontWeight: 500
        }}>
          {isCompany ? <Layers size={12} /> : <GitFork size={12} />}
          {isCompany ? 'Vista de Empresa' : 'Vista de Auditor'}
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>
          {initialDocuments.length} documento{initialDocuments.length !== 1 ? 's' : ''} registrado{initialDocuments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCompany ? '320px 1fr' : '280px 1fr', gap: 24 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isCompany && <UploadDocumentForm />}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Archive size={15} color={isCompany ? '#3ECF8E' : '#60a5fa'} />
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>
                {isCompany ? 'Mis Documentos' : 'Registro Global'}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
              {initialDocuments.length === 0 ? (
                <div style={{
                  background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
                  padding: '32px 20px', textAlign: 'center', color: '#444', fontSize: 13
                }}>
                  No hay documentos registrados.
                </div>
              ) : (
                initialDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    isSelected={selectedDoc === doc.id}
                    onClick={() => handleSelectDocument(doc.id)}
                    showUpdateForm={isCompany && doc.uploaderId === currentUserId}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Timeline */}
        <div>
          {selectedDoc ? (
            isLoadingHistory ? (
              <div style={{
                background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '48px 24px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 12, color: '#555'
              }}>
                <div style={{
                  width: 24, height: 24,
                  border: '2px solid rgba(62,207,142,0.3)',
                  borderTopColor: '#3ECF8E',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ fontSize: 13 }}>Cargando historial...</span>
              </div>
            ) : (
              <AuditTimeline history={history} />
            )
          ) : (
            <div style={{
              background: '#1c1c1c', border: '1px dashed rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '80px 24px', textAlign: 'center',
              color: '#444', fontSize: 14, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 16
            }}>
              <Archive size={32} color="#2a2a2a" />
              <div>
                <p style={{ color: '#666', fontWeight: 500, marginBottom: 4 }}>Selecciona un documento</p>
                <p style={{ color: '#3a3a3a', fontSize: 13 }}>
                  Al seleccionarlo verás su cadena de custodia completa e inmutable
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
