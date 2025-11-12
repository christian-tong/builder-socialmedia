/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    basePath: '/builder',
    output: 'standalone',
    trailingSlash: true,

    images: {
        unoptimized: true, // ✅ sigue sirviendo desde /builder/public/
    },

    publicRuntimeConfig: {
        basePath: '/builder', // ✅ accesible en client y server
    },

    experimental: {
        optimizeCss: false,
        turbo: { rules: {} },
    },
}

export default nextConfig
