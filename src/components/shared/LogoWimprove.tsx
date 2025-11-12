// src\components\shared\LogoWimprove.tsx

'use client'

import Image from 'next/image'
import React from 'react'
import { cn } from '@/lib/utils'
import getConfig from 'next/config'

interface LogoWimproveProps {
    height?: number
    className?: string
}

export default function LogoWimprove({
    height = 28,
    className,
}: LogoWimproveProps) {
    const { publicRuntimeConfig } = getConfig()
    const basePath = publicRuntimeConfig?.basePath || ''
    const logoSrc = `${basePath}/logo-interno.png`

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center px-2 transition-all duration-500 ease-in-out select-none',
                'max-w-[180px]',
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
                width={height * 3.5}
                sizes="(max-width: 768px) 120px, 180px"
                priority
                className="h-full w-auto object-contain transition-all duration-500 ease-in-out"
            />
        </div>
    )
}
