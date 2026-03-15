'use client'

import { useState } from 'react'
import { uploadDocument } from '@/app/actions/documentActions'
import { UploadCloud, File as FileIcon, Loader2, CheckCircle2, X } from 'lucide-react'

export default function UploadDocumentForm() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null) // We don't have userRole here directly, but it's fine, we just need to add category
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Debes seleccionar un archivo.')
      return
    }

    if (!title.trim()) {
      setError('El título es obligatorio para identificar el registro.')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)

    try {
      const result = await uploadDocument(formData)
      if (result.success) {
        setSuccess('¡Documento registrado con éxito! El hash SHA-256 ya forma parte del registro inmutable.')
        setFile(null); setTitle(''); setDescription(''); setCategory('General')
      } else {
        setError(result.error || 'No se pudo completar el registro. Intenta nuevamente.')
      }
    } catch (err: any) {
      console.error('Frontend upload catch:', err)
      setError('Ocurrió un fallo inesperado en el navegador o en la conexión. Revisa tu internet e intenta subirlo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <UploadCloud size={16} color="#3ECF8E" />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#ededed' }}>Registrar Documento</h2>
      </div>

      <div className="sb-card" style={{ padding: 20 }}>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 14px', background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6,
            color: '#f87171', fontSize: 13, marginBottom: 16
          }}>
            <X size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 14px', background: 'rgba(62,207,142,0.07)',
            border: '1px solid rgba(62,207,142,0.2)', borderRadius: 6,
            color: '#3ECF8E', fontSize: 13, marginBottom: 16
          }}>
            <CheckCircle2 size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#9e9e9e', marginBottom: 6, fontWeight: 500 }}>
              Título del Documento
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Contrato de Arrendamiento 2024"
              className="sb-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#9e9e9e', marginBottom: 6, fontWeight: 500 }}>
              Descripción <span style={{ color: '#444' }}>(Opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles adicionales sobre este documento..."
              rows={3}
              className="sb-input"
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#9e9e9e', marginBottom: 6, fontWeight: 500 }}>
              Categoría
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="sb-input"
              style={{ appearance: 'auto' }}
            >
              <option value="General">General</option>
              <option value="Nómina">Nómina</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Producción">Producción</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>

          {/* Drop Zone */}
          <div>
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: `1px dashed ${isDragging ? '#3ECF8E' : file ? 'rgba(62,207,142,0.2)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 8, padding: file ? '16px' : '28px 20px',
                cursor: 'pointer', transition: 'all 0.15s',
                background: isDragging ? 'rgba(62,207,142,0.04)' : file ? 'rgba(62,207,142,0.04)' : 'transparent',
                textAlign: 'center', gap: 8
              }}
            >
              {file ? (
                <>
                  <FileIcon size={18} color="#3ECF8E" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#ededed' }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud size={22} color="#444" />
                  <div>
                    <p style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>Arrastra el archivo aquí o haz clic</p>
                    <p style={{ fontSize: 12, color: '#444', marginTop: 4 }}>PDF, DOCX, XLSX, PNG — cualquier formato</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="sb-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 18px', opacity: (!file || !title) ? 0.6 : 1 }}
          >
            {isUploading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generando Firma...</>
              : 'Registrar Documento'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
