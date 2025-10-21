// src/components/flow/FlowStylePanel.tsx

'use client'

import { ArrowLeftRight, ArrowUpDown } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useFlowStyleStore } from '@/store/useFlowStyleStore'

export function FlowStylePanel() {
    const { backgroundType, edgeType, setBackgroundType, setEdgeType } =
        useFlowStyleStore()

    const { orientation, toggleOrientation } = useFlowOrientationStore()

    const backgrounds = [
        { key: 'dots', label: 'Puntos' },
        { key: 'lines', label: 'Líneas' },
    ] as const

    const edges = [
        { key: 'default', label: 'Curvo' },
        { key: 'straight', label: 'Recto' },
        { key: 'step', label: 'Escalonado' },
        { key: 'smoothstep', label: 'Suave' },
    ] as const

    return (
        <div className="absolute right-4 bottom-4 z-50 min-w-[220px] rounded-lg border border-gray-300 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/90">
            {/* 🎨 Fondo */}
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                🎨 Fondo
            </p>
            <div className="mb-3 flex gap-2">
                {backgrounds.map((b) => (
                    <button
                        key={b.key}
                        onClick={() => setBackgroundType(b.key)}
                        className={cn(
                            'rounded-md border px-2 py-1 text-xs transition-colors',
                            backgroundType === b.key
                                ? 'border-indigo-600 bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        )}
                    >
                        {b.label}
                    </button>
                ))}
            </div>

            {/* 🔗 Tipo de Conexión */}
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                🔗 Conexiones
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
                {edges.map((e) => (
                    <button
                        key={e.key}
                        onClick={() => setEdgeType(e.key)}
                        className={cn(
                            'rounded-md border px-2 py-1 text-xs transition-colors',
                            edgeType === e.key
                                ? 'border-indigo-600 bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        )}
                    >
                        {e.label}
                    </button>
                ))}
            </div>

            {/* 🧭 Orientación del flujo */}
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                🧭 Orientación
            </p>
            <div className="flex gap-2">
                <button
                    onClick={toggleOrientation}
                    className={cn(
                        'flex w-full items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                        orientation === 'vertical'
                            ? 'border-indigo-600 bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                >
                    <ArrowUpDown className="h-4 w-4" />
                    Vertical
                </button>

                <button
                    onClick={toggleOrientation}
                    className={cn(
                        'flex w-full items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                        orientation === 'horizontal'
                            ? 'border-indigo-600 bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                >
                    <ArrowLeftRight className="h-4 w-4" />
                    Horizontal
                </button>
            </div>
        </div>
    )
}
