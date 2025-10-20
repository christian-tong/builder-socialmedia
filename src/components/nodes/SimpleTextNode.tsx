// src\components\nodes\SimpleTextNode.tsx
'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🟦 SimpleTextNode
 * ----------------------------------------------------
 * - Nodo visual de tipo texto simple
 * - Tiene ancho máximo fijo y altura dinámica
 * - Soporta orientación vertical/horizontal
 * - Abre FormSimpleTextNode al hacer clic
 */
export function SimpleTextNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    // 🔄 Posición dinámica de los handles
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <Card
            onClick={(e) => {
                e.stopPropagation()
                setSelectedNode({ id, type: 'simpleTextNode', data })
            }}
            data-id={id}
            className="relative w-full max-w-[220px] cursor-pointer rounded-lg border border-indigo-700 bg-indigo-600 px-3 py-2 text-center text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.02]"
        >
            <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                {/* 🔹 Título */}
                <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium break-words">
                        {data.label || 'Texto sin título'}
                    </span>
                </div>

                {/* 🔹 Contenido dinámico */}
                {data.message && (
                    <p
                        className="mt-1 text-center text-[11px] leading-snug break-words opacity-85"
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {data.message}
                    </p>
                )}
            </div>

            {/* 🟢🟡🔴 Handles de conexión */}
            <Handle
                type="target"
                position={targetPosition}
                className="!bg-indigo-400"
            />
            <Handle
                type="source"
                position={sourcePosition}
                className="!bg-indigo-400"
            />
        </Card>
    )
}
