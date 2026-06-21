import QRCode from 'qrcode'

/** Generate a QR code as a data URL (PNG). Server-side use. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 512,
    errorCorrectionLevel: 'M',
    color: { dark: '#0a0a0a', light: '#ffffff' },
  })
}
