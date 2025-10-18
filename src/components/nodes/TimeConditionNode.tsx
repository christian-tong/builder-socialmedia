// src\components\nodes\TimeConditionNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

export default function TimeConditionNode({ id, data }: any) {
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
                setSelectedNode({ id, type: 'timeConditionNode', data })
            }}
            className="relative cursor-pointer rounded-lg border border-sky-600 bg-sky-500 px-3 py-2 text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.02] dark:bg-sky-700"
        >
            <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                        {data.label || 'Condición Horaria'}
                    </span>
                </div>
                {data.condition && (
                    <p className="text-[10px] opacity-90">{data.condition}</p>
                )}
            </div>

            <Handle
                type="target"
                position={targetPosition}
                className="!bg-sky-300"
            />
            <Handle
                type="source"
                position={sourcePosition}
                className="!bg-sky-300"
            />
        </Card>
    )
}
