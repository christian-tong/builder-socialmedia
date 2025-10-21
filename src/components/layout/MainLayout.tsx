// src\components\layout\MainLayout.tsx
'use client'

import type React from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

/**
 * 🧱 MainLayout
 * ---------------------------------------------------------
 * - Contiene el Header, contenido principal y Footer
 * - Aplica el tema global (oscuro / claro)
 * - Sirve como layout base para las vistas del proyecto
 */
interface Props {
    children: React.ReactNode
}

export function MainLayout({ children }: Props) {
    const { isDark, mounted } = useTheme()

    if (!mounted) return null // evita error de hidratación SSR/CSR

    return (
        <div
            className={cn(
                'flex h-screen w-screen flex-col transition-colors duration-500',
                isDark
                    ? 'bg-[#0e0e10] text-gray-100'
                    : 'bg-[#fafafa] text-gray-900'
            )}
        >
            {/* 🔹 Cabecera reutilizable */}
            <Header />

            {/* 🔸 Contenido principal */}
            <main className="flex-1 overflow-hidden">{children}</main>

            {/* 🔹 Pie de página reutilizable */}
            <Footer />
        </div>
    )
}

export default MainLayout
