'use server'

import { getSupabaseServerClient } from '@/lib/supabase'

export type VerificationResult = 
  | { success: true; document: { title: string; uploaderName: string; createdAt: string; hash: string } }
  | { success: false; error: string }

/**
 * Searches the database for a document matching the exact exact given hash.
 * 
 * @param hash The calculated SHA-256 hash of the file to verify
 */
export async function verifyDocumentHash(hash: string): Promise<VerificationResult> {
  try {
    const supabase = getSupabaseServerClient()

    const { data: document, error } = await supabase
      .from('documents')
      .select('title, current_hash, created_at, uploader:users(name)')
      .eq('current_hash', hash)
      .maybeSingle()

    if (error) {
      console.error('Error verifying document:', error)
      return { success: false, error: 'Ocurrió un error al intentar verificar el documento. Intenta nuevamente.' }
    }

    if (!document) {
      return { 
        success: false, 
        error: 'El hash no coincide con ningún documento registrado. El archivo puede haber sido alterado o nunca fue subido a la plataforma.'
      }
    }

    // Return only necessary data to the client
    return {
      success: true,
      document: {
        title: document.title,
        uploaderName: document.uploader?.name || '',
        createdAt: document.created_at,
        hash: document.current_hash
      }
    }

  } catch (error) {
    console.error('Error verifying document:', error)
    return { success: false, error: 'Ocurrió un error al intentar verificar el documento. Intenta nuevamente.' }
  }
}
