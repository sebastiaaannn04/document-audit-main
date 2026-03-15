import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// --- Estilos ---
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0f0f0f',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // Top green accent stripe
  accentStripe: {
    backgroundColor: '#3ECF8E',
    height: 6,
    width: '100%',
  },
  body: {
    padding: '36px 48px',
    flex: 1,
  },
  // Header row
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  logoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    backgroundColor: '#3ECF8E',
    width: 36,
    height: 36,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#000000',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  appName: {
    color: '#ededed',
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 10,
    marginTop: 8,
  },
  dateText: {
    color: '#666666',
    fontSize: 10,
    marginTop: 10,
  },
  // Title section
  titleSection: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    borderBottomStyle: 'solid',
  },
  certLabel: {
    color: '#3ECF8E',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  certTitle: {
    color: '#ededed',
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.3,
  },
  certSubtitle: {
    color: '#888888',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 1.5,
  },
  // Info cards
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderStyle: 'solid',
  },
  infoLabel: {
    color: '#555555',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoValue: {
    color: '#ededed',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.4,
  },
  // Hash section
  hashSection: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
    borderStyle: 'solid',
    borderLeftWidth: 3,
    borderLeftColor: '#3ECF8E',
    borderLeftStyle: 'solid',
  },
  hashLabel: {
    color: '#3ECF8E',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  hashValue: {
    color: '#9e9e9e',
    fontSize: 10,
    fontFamily: 'Courier',
    lineHeight: 1.7,
    wordBreak: 'break-all',
  },
  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2b1f',
    borderRadius: 8,
    padding: '10px 16px',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1a4a30',
    borderStyle: 'solid',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3ECF8E',
    marginRight: 8,
  },
  statusText: {
    color: '#3ECF8E',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    borderTopStyle: 'solid',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    color: '#444444',
    fontSize: 9,
    lineHeight: 1.6,
    flex: 1,
  },
  footerRight: {
    color: '#444444',
    fontSize: 9,
    textAlign: 'right',
  },
})

// --- Tipos ---
interface CertificateData {
  documentTitle: string
  uploaderName: string
  hash: string
  createdAt: Date
  status: string
}

// --- Componente principal ---
export function CertificatePDF({ data }: { data: CertificateData }) {
  const isVersioned = data.status === 'VERSION_UPDATED'

  return (
    <Document
      title={`Certificado DocAudit — ${data.documentTitle}`}
      author="DocAudit Platform"
      subject="Certificado de Integridad Documental"
    >
      <Page size="A4" style={styles.page}>
        {/* Stripe verde superior */}
        <View style={styles.accentStripe} />

        <View style={styles.body}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBlock}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>D</Text>
              </View>
              <Text style={styles.appName}>DocAudit</Text>
            </View>
            <Text style={styles.dateText}>
              Emitido el {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
          </View>

          {/* Título */}
          <View style={styles.titleSection}>
            <Text style={styles.certLabel}>Certificado de Integridad Documental</Text>
            <Text style={styles.certTitle}>
              {data.documentTitle}
            </Text>
            <Text style={styles.certSubtitle}>
              Este certificado acredita que el documento arriba mencionado fue registrado en la
              Plataforma DocAudit y su integridad ha sido verificada mediante el algoritmo
              criptográfico SHA-256.
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Empresa Certificadora</Text>
              <Text style={styles.infoValue}>{data.uploaderName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Fecha de Registro</Text>
              <Text style={styles.infoValue}>
                {format(new Date(data.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Versión del Documento</Text>
              <Text style={styles.infoValue}>{isVersioned ? '2 o superior' : '1 (Original)'}</Text>
            </View>
          </View>

          {/* Hash */}
          <View style={styles.hashSection}>
            <Text style={styles.hashLabel}>Firma Criptográfica (SHA-256)</Text>
            <Text style={styles.hashValue}>{data.hash}</Text>
          </View>

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              DOCUMENTO ÍNTEGRO — El hash coincide con el registro inmutable de la plataforma
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerLeft}>
              Este certificado fue generado automáticamente por la Plataforma DocAudit.{'\n'}
              Para verificar la autenticidad de este documento visite: docaudit.app/verify
            </Text>
            <Text style={styles.footerRight}>
              DocAudit v1.0{'\n'}
              Plataforma de Auditoría Documental
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
