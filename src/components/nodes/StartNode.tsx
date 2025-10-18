// src\components\nodes\StartNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

export function StartNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <Card
            onClick={() => setSelectedNode({ id, type: 'startNode', data })}
            className="cursor-pointer rounded-lg border border-emerald-700 bg-emerald-600 px-3 py-2 text-white shadow-md transition-transform duration-200 hover:scale-[1.02]"
        >
            <div className="flex items-center justify-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{data.label}</span>
            </div>

            <Handle
                type="source"
                position={handlePosition}
                className="!bg-emerald-400"
            />
        </Card>
    )
}
