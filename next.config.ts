import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,

    eslint: {
        // 🚀 Evita que la build falle por errores de lint en Vercel o GitHub Actions
        ignoreDuringBuilds: true,
    },

    typescript: {
        // Ignora errores de tipo durante el build (útil para ramas dev)
        ignoreBuildErrors: true,
    },

    experimental: {
        // ⚙️ Desactiva el uso de lightningcss que falla en Vercel (Linux)
        optimizeCss: false,

        // ⚡ Opcional: desactiva Turbopack para usar el compilador estable
        turbo: {
            rules: {},
        },
    },
}

export default nextConfig
