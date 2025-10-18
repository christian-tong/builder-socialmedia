// src\components\shared\LogoWimprove.tsx

'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * 🧩 LogoWimprove — Logo principal reutilizable
 * =============================================================
 * - Mantiene proporción natural con ancho ajustado al contenido.
 * - Evita expansión visual excesiva (usa inline-flex + max-w).
 * - Transición suave, sin deformaciones ni saltos.
 * - Ideal para headers o barras compactas.
 *
 * 🔹 Props:
 * - height (number): alto en píxeles (por defecto: 28)
 * - className (string): clases opcionales.
 */
interface LogoWimproveProps {
    height?: number
    className?: string
}

export default function LogoWimprove({
    height = 28,
    className,
}: LogoWimproveProps) {
    const logoSrc = '/logo-interno.png'

    return (
        <div
            className={cn(
                // inline-flex para que el ancho se ajuste exactamente al contenido
                'inline-flex items-center justify-center px-2 transition-all duration-500 ease-in-out select-none',
                'max-w-[180px]', // límite de expansión visual
                className
            )}
            style={{
                height: `${height}px`,
            }}
        >
            <Image
                src={logoSrc}
                alt="Wimprove Logo"
                height={height}
                width={height * 3.5} // ratio controlado (ajustable si tu logo es más ancho)
                sizes="(max-width: 768px) 120px, 180px"
                priority
                className="h-full w-auto object-contain transition-all duration-500 ease-in-out"
            />
        </div>
    )
}
