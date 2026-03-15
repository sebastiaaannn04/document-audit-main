'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { getSupabaseServerClient } from '@/lib/supabase'
import { verifySession } from '@/lib/session'

type UserRow = {
  id: string
  name: string
  email: string
  role: string
}

type DocumentRow = {
  id: string
  title: string
  description: string | null
  category: string
  file_url: string
  current_hash: string
  status: string
  company_id: string
  uploader_id: string
  created_at: string
  updated_at: string
  uploader?: UserRow | null
}

type AuditLogRow = {
  id: string
  action: string
  hash_value: string
  timestamp: string
  details: string | null
  user?: UserRow | null
}

const mapDocumentRow = (row: DocumentRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  fileUrl: row.file_url,
  currentHash: row.current_hash,
  status: row.status,
  companyId: row.company_id,
  uploaderId: row.uploader_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  uploader: row.uploader ? { name: row.uploader.name, email: row.uploader.email, role: row.uploader.role } : undefined,
})

const mapAuditLogRow = (row: AuditLogRow) => ({
  id: row.id,
  action: row.action,
  hashValue: row.hash_value,
  timestamp: row.timestamp,
  details: row.details,
  user: row.user ? { name: row.user.name, role: row.user.role } : { name: '', role: '' },
})

export async function uploadDocument(formData: FormData) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return { success: false, error: 'Usuario no autorizado' }
    }

    const supabase = getSupabaseServerClient()

    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null
    const category = (formData.get('category') as string) || 'General'

    if (!file || !title) {
      return { success: false, error: 'El archivo y el título son obligatorios.' }
    }

    // 1. Convert file to buffer and calculate SHA-256 Hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(buffer)
    const currentHash = hashSum.digest('hex')

    // 2. Save file to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const uniqueFilename = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)
    
    // Relative URL for frontend to access optionally (if wanted)
    const fileUrl = `/uploads/${uniqueFilename}`

    // 4. Create internal Document record and Audit Log transiton
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        category,
        file_url: fileUrl,
        current_hash: currentHash,
        company_id: session.companyId,
        uploader_id: session.userId,
        status: 'UPLOADED',
      })
      .select('id, title, description, category, file_url, current_hash, status, company_id, uploader_id, created_at, updated_at')
      .single()

    if (documentError || !document) {
      console.error('Error uploading document:', documentError)
      if (documentError?.code === '23505') {
        return { success: false, error: 'Ya existe un documento con este mismo hash.' }
      }
      return { success: false, error: 'Ocurrió un error inesperado al subir el documento.' }
    }

    const { error: auditError } = await supabase.from('audit_logs').insert({
      document_id: document.id,
      action: 'UPLOADED',
      hash_value: currentHash,
      user_id: session.userId,
      details: 'Documento original registrado',
    })

    if (auditError) {
      console.error('Error uploading document audit log:', auditError)
      return { success: false, error: 'Ocurrió un error al registrar el historial.' }
    }

    revalidatePath('/')
    return { success: true, document: mapDocumentRow(document as DocumentRow) }
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return { success: false, error: error.message || 'Ocurrió un error inesperado al subir el documento.' }
  }
}

export async function getDocuments() {
  const session = await verifySession()
  
  if (!session) return []

  const supabase = getSupabaseServerClient()

  // If COMPANY, only show their own documents
  if (session.role === 'COMPANY') {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, description, category, file_url, current_hash, status, company_id, uploader_id, created_at, updated_at, uploader:users(name, email, role)')
      .eq('company_id', session.companyId)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data.map((row) => mapDocumentRow(row as DocumentRow))
  }

  // If AUDITOR, show all documents cross-companies
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, description, category, file_url, current_hash, status, company_id, uploader_id, created_at, updated_at, uploader:users(name, email, role)')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data.map((row) => mapDocumentRow(row as DocumentRow))
}

export async function getDocumentHistory(documentId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, hash_value, timestamp, details, user:users(name, role)')
    .eq('document_id', documentId)
    .order('timestamp', { ascending: false })

  if (error || !data) {
    console.error('Error fetching document history:', error)
    return []
  }

  return data.map((row) => mapAuditLogRow(row as AuditLogRow))
}

export async function uploadNewVersion(documentId: string, formData: FormData) {
  try {
    const session = await verifySession()
    if (!session || !session.userId || session.role !== 'COMPANY') {
      return { success: false, error: 'Acceso no autorizado' }
    }

    const supabase = getSupabaseServerClient()

    const file = formData.get('file') as File | null
    if (!file) {
      return { success: false, error: 'Debes proporcionar un archivo' }
    }

    // 1. Verify existence and ownership
    const { data: existingDoc, error: existingDocError } = await supabase
      .from('documents')
      .select('id, uploader_id, current_hash')
      .eq('id', documentId)
      .maybeSingle()

    if (existingDocError) {
      console.error('Error fetching document:', existingDocError)
      return { success: false, error: 'Ocurrió un error al validar el documento' }
    }

    if (!existingDoc || existingDoc.uploader_id !== session.userId) {
      return { success: false, error: 'Documento no encontrado o no tienes permisos' }
    }

    // 2. Calculate New Hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(buffer)
    const newHash = hashSum.digest('hex')

    if (newHash === existingDoc.current_hash) {
      return { success: false, error: 'Este archivo es idéntico a la versión actual. El Hash no ha cambiado.' }
    }

    // 3. Save new file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const uniqueFilename = `${Date.now()}-v2-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)
    const fileUrl = `/uploads/${uniqueFilename}`

    // 4. Update Database within a Transaction
    const { data: updatedDocument, error: updatedDocumentError } = await supabase
      .from('documents')
      .update({
        current_hash: newHash,
        file_url: fileUrl,
        status: 'VERSION_UPDATED',
        title: file.name,
      })
      .eq('id', documentId)
      .select('id, title, description, category, file_url, current_hash, status, company_id, uploader_id, created_at, updated_at')
      .single()

    if (updatedDocumentError || !updatedDocument) {
      console.error('Error updating document:', updatedDocumentError)
      if (updatedDocumentError?.code === '23505') {
        return { success: false, error: 'Este documento o Hash ya existe en el registro' }
      }
      return { success: false, error: 'Ocurrió un error al actualizar el documento' }
    }

    const { error: auditError } = await supabase.from('audit_logs').insert({
      document_id: updatedDocument.id,
      action: 'VERSION_UPDATED',
      hash_value: newHash,
      user_id: session.userId,
      details: 'Se actualizó a una nueva versión del archivo original',
    })

    if (auditError) {
      console.error('Error updating document audit log:', auditError)
      return { success: false, error: 'Ocurrió un error al registrar el historial' }
    }

    revalidatePath('/')
    return { success: true, document: mapDocumentRow(updatedDocument as DocumentRow) }
  } catch (error: any) {
    console.error('Error uploading new version:', error)
    return { success: false, error: 'Ocurrió un error al subir la nueva versión' }
  }
}
