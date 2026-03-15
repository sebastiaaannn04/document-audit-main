/**
 * Calculates the SHA-256 hash of a File object entirely in the browser.
 * This ensures the file is never uploaded during the verification process.
 * 
 * @param file The file chosen or dropped by the user
 * @returns A Promise resolving to the hex string of the SHA-256 hash
 */
export async function calculateFileHash(file: File): Promise<string> {
  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()
  
  // Use the native browser crypto API to hash the buffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  
  // Convert the hash buffer into a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}
