// src\components\nodes\TimeConditionNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🕒 TimeConditionNode
 * ----------------------------------------------------
 * - Nodo de condición horaria o lógica
 * - Animación suave y equilibrada
 * - Compatible con Framer Motion v11+
 */
export default function TimeConditionNode({ id, data }: any) {
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
            transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14,
                mass: 0.8,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'timeConditionNode', data })
                }}
                data-id={id}
                className="relative cursor-pointer rounded-lg border border-sky-600 bg-sky-500 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg dark:bg-sky-700"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            {data.label || 'Condición Horaria'}
                        </span>
                    </div>
                    {data.condition && (
                        <p className="text-[10px] opacity-90">
                            {data.condition}
                        </p>
                    )}
                </div>

                {/* 🔹 Handles */}
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
        </motion.div>
    )
}
