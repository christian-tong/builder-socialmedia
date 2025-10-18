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
 * - Al hacer clic, abre el formulario asociado (FormSimpleTextNode)
 * - Soporta orientación dinámica (vertical / horizontal)
 * - Datos sincronizados vía Zustand (useNodeConfigStore)
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
                e.stopPropagation() // ✅ evita propagación al canvas
                setSelectedNode({ id, type: 'simpleTextNode', data })
            }}
            data-id={id}
            className="relative cursor-pointer rounded-lg border border-indigo-700 bg-indigo-600 px-3 py-2 text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.02]"
        >
            <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {data.label || 'Texto sin título'}
                    </span>
                </div>
                {data.message && (
                    <p className="text-[10px] opacity-80">{data.message}</p>
                )}
            </div>

            {/* Handles de conexión */}
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
