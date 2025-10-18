// src\components\layout\Sidebar.tsx

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface SidebarProps {
    isOpen: boolean
    children: React.ReactNode
}

/**
 * 🧱 Sidebar — Panel lateral con animación fluida
 * -------------------------------------------------------------
 * - Usa max-width + scale + opacity para una transición estable.
 * - Usa origin-left para expansión natural.
 * - Envuelve su contenido en un wrapper interno con suavizado.
 */
export function Sidebar({ isOpen, children }: SidebarProps) {
    const { isDark } = useTheme()

    return (
        <aside
            data-state={isOpen ? 'open' : 'closed'}
            className={cn(
                'flex origin-left transform flex-col gap-3 overflow-hidden border-r p-3 transition-all duration-500 ease-in-out',
                isDark
                    ? 'border-gray-800 bg-[#141416] text-gray-200'
                    : 'border-gray-200 bg-white text-gray-800',
                isOpen
                    ? 'max-w-[208px] scale-x-100 opacity-100'
                    : 'pointer-events-none max-w-0 scale-x-95 opacity-0'
            )}
        >
            <div
                className={cn(
                    'transition-all duration-500 ease-in-out',
                    isOpen
                        ? 'translate-x-0 opacity-100 delay-150'
                        : '-translate-x-3 opacity-0 delay-0'
                )}
            >
                {children}
            </div>
        </aside>
    )
}

export default Sidebar
