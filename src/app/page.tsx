import UploadDocumentForm from '@/components/UploadDocumentForm'
import { getDocuments } from '@/app/actions/documentActions'
import DashboardClient from './DashboardClient'
import { verifySession } from '@/lib/session'
import { logout } from '@/app/actions/authActions'
import { LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const documents = await getDocuments()
  const session = await verifySession()

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#ededed' }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        background: '#0f0f0f'
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: '#3ECF8E', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#000'
          }}>D</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>DocAudit</span>
          <span style={{
            marginLeft: 4, padding: '2px 8px', background: 'rgba(62,207,142,0.1)',
            color: '#3ECF8E', fontSize: 11, borderRadius: 4, border: '1px solid rgba(62,207,142,0.2)',
            fontWeight: 500, letterSpacing: '0.03em'
          }}>v1.0</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session?.name && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#888',
              padding: '4px 10px', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.08)', background: '#1a1a1a'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3ECF8E', display: 'inline-block' }} />
              {session.name}
            </span>
          )}

          <Link href="/verify" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', color: '#3ECF8E',
            border: '1px solid rgba(62,207,142,0.25)',
            background: 'rgba(62,207,142,0.05)',
            transition: 'all 0.15s ease'
          }}>
            <ShieldCheck size={14} />
            Verificar
          </Link>

          <form action={logout}>
            <button type="submit" className="sb-btn-logout"
            >
              <LogOut size={14} />
              Salir
            </button>
          </form>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Panel de Control</h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Gestiona y audita los documentos de tu organización con respaldo criptográfico SHA-256.
          </p>
        </div>

        {/* Dashboard */}
        <DashboardClient initialDocuments={documents} userRole={session?.role || 'COMPANY'} currentUserId={session?.userId || ''} />
      </div>

    </div>
  )
}
