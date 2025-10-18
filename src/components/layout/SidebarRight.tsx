// src\components\layout\SidebarRight.tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface SidebarRightProps {
    isOpen: boolean
    children: React.ReactNode
}

export function SidebarRight({ isOpen, children }: SidebarRightProps) {
    const { isDark } = useTheme()

    return (
        <aside
            data-state={isOpen ? 'open' : 'closed'}
            aria-hidden={!isOpen}
            className={cn(
                'fixed top-0 right-0 z-[50] flex h-full origin-right flex-col border-l transition-all duration-500 ease-in-out',
                isDark
                    ? 'border-gray-800 bg-[#141416] text-gray-200'
                    : 'border-gray-200 bg-white text-gray-800',
                isOpen
                    ? 'w-[320px] translate-x-0 opacity-100 sm:w-[380px]'
                    : 'pointer-events-none w-0 translate-x-10 opacity-0'
            )}
        >
            {/* Contenido con ScrollArea (ocupa todo el alto y da padding interno) */}
            <ScrollArea
                className={cn(
                    'flex-1 transform p-4 transition-all duration-500 ease-in-out',
                    isOpen
                        ? 'translate-x-0 opacity-100 delay-150'
                        : 'translate-x-3 opacity-0 delay-0'
                )}
            >
                {children}
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </aside>
    )
}

export default SidebarRight
