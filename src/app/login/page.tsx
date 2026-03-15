'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/authActions'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await login(formData)
  }, { error: '' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f0f0f' }}>
      
      {/* Subtle background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="w-full max-w-sm relative z-10 animate-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{
            width: 48, height: 48, background: '#3ECF8E', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontWeight: 800, fontSize: 22, color: '#000'
          }}>D</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ededed', marginBottom: 6 }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Accede a tu panel de auditoría
          </p>
        </div>

        {/* Card */}
        <div className="sb-card" style={{ padding: 28 }}>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {state?.error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6,
                color: '#f87171', fontSize: 13, textAlign: 'center'
              }}>
                {state.error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#9e9e9e', fontWeight: 500 }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="empresa@ejemplo.com"
                className="sb-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#9e9e9e', fontWeight: 500 }}>
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="sb-input"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="sb-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', marginTop: 4 }}
            >
              {isPending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {isPending ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <hr className="sb-divider" style={{ margin: '20px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" style={{ color: '#3ECF8E', textDecoration: 'none', fontWeight: 500 }}>
              Registrar empresa
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#444' }}>
          DocAudit — Plataforma de Auditoría Inmutable
        </p>
      </div>
    </div>
  )
}
