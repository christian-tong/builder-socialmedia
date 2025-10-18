// src\components\nodes\EndNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { Power } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

export default function EndNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    return (
        <Card
            onClick={() => setSelectedNode({ id, type: 'endNode', data })}
            className="cursor-pointer rounded-lg border border-rose-700 bg-rose-600 px-3 py-2 text-white shadow-md transition-transform duration-200 hover:scale-[1.02]"
        >
            <div className="flex items-center justify-center gap-2">
                <Power className="h-4 w-4" />
                <span className="text-sm font-medium">
                    {data.label || 'Fin'}
                </span>
            </div>

            <Handle
                type="target"
                position={handlePosition}
                className="!bg-rose-400"
            />
        </Card>
    )
}
