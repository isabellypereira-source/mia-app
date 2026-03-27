import type { NextConfig } from 'next' // configuração MIA

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

export default nextConfig
