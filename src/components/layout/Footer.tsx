// src\components\layout\Footer.tsx

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

/**
 * 🔹 Footer — Pie de página reutilizable
 * -----------------------------------------------------------
 * - Muestra información del proyecto y año actual
 * - Adapta sus colores dinámicamente al tema global
 */
export function Footer() {
    const { isDark } = useTheme()
    const year = new Date().getFullYear()

    return (
        <footer
            className={cn(
                'flex h-6 items-center justify-center border-t text-center text-[11px] transition-colors duration-500',
                isDark
                    ? 'border-gray-800 bg-[#141416] text-gray-600'
                    : 'border-gray-200 bg-white text-gray-500'
            )}
        >
            © {year} Flow Builder — powered by React Flow ⚙️
        </footer>
    )
}

export default Footer
