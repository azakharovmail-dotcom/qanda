import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Standalone output only when self-hosting (Docker/VPS). On Vercel, leave
  // unset — Vercel configures its own output, and forcing standalone can 500.
  output: process.env.SELF_HOST === '1' ? 'standalone' : undefined,
  poweredByHeader: false,
  images: {
    // Event logos served from Supabase Storage (added later).
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}

export default nextConfig
