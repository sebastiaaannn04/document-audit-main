import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DocAudit — Plataforma de Auditoría de Documentos",
  description: "Garantiza la integridad de documentos corporativos con hashing criptográfico SHA-256. Registro inmutable, verificación pública y cadena de custodia completa.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
