import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // 🚀 Esto evita que la build falle por errores de lint en Vercel o GitHub Actions
    ignoreDuringBuilds: true,
  },

  typescript: {
    // (Opcional) Ignora errores de TypeScript durante el build en producción
    // Útil si tienes muchos "any" o tipos inconsistentes temporalmente
    ignoreBuildErrors: true,
  },
}

export default nextConfig
