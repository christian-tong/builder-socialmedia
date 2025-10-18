// src\components\nodes\DerivateNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { UserCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🟨 DerivateNode
 * ----------------------------------------------------
 * - Nodo de derivación a un skill o asesor
 * - Muestra su label y el skill asociado
 * - Integra con useNodeConfigStore
 */
const DerivateNode = ({ id, data }: any) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <Card
            onClick={(e) => {
                e.stopPropagation()
                setSelectedNode({ id, type: 'derivateNode', data })
            }}
            data-id={id}
            className="relative cursor-pointer rounded-lg border border-amber-600 bg-amber-500 px-3 py-2 text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.02] dark:bg-amber-700"
        >
            <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                        {data.label || 'Derivación'}
                    </span>
                </div>
                {data.skillLabel && (
                    <p className="text-[10px] opacity-90">{data.skillLabel}</p>
                )}
            </div>

            {/* Handles de conexión */}
            <Handle
                type="target"
                position={targetPosition}
                className="!bg-amber-300"
            />
            <Handle
                type="source"
                position={sourcePosition}
                className="!bg-amber-300"
            />
        </Card>
    )
}

export default DerivateNode
