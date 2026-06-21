import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Compact, self-contained server bundle for Docker / VPS self-hosting.
  output: 'standalone',
  poweredByHeader: false,
  images: {
    // Event logos served from Supabase Storage (added later).
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}

export default nextConfig
