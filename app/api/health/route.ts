export const dynamic = 'force-dynamic'

/** Liveness probe. Timestamp is computed per request (never prerendered). */
export async function GET() {
  return Response.json({ ok: true, ts: new Date().toISOString() })
}
