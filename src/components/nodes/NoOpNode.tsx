// src\components\nodes\NoOpNode.tsx

'use client'

import { motion } from 'framer-motion'
import { MinusCircle } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🟤 NoOpNode
 * ----------------------------------------------------
 * - Nodo neutro, no realiza operaciones
 * - Ideal como separador o marcador visual
 */
export default function NoOpNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'noopNode', data })
                }}
                data-id={id}
                className="relative w-full max-w-[180px] cursor-pointer rounded-lg border px-3 py-2 text-center shadow-sm transition-all duration-300 hover:shadow-md"
                style={{
                    backgroundColor: '#F3F4F6',
                    borderColor: '#9CA3AF',
                    color: '#374151',
                }}
            >
                <div className="flex flex-col items-center justify-center gap-1">
                    <MinusCircle className="h-4 w-4 opacity-70" />
                    <span className="text-xs font-semibold tracking-wide">
                        No Operacion
                    </span>
                    <span className="text-[10px] opacity-60">{id}</span>
                </div>

                {/* Handles */}
                <Handle
                    type="target"
                    position={targetPosition}
                    className="!bg-gray-400"
                />
                <Handle
                    type="source"
                    position={sourcePosition}
                    id="noop"
                    className="!bg-gray-400"
                />
            </Card>
        </motion.div>
    )
}
