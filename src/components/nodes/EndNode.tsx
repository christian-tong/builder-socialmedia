// src\components\nodes\EndNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import { Power } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🔴 EndNode
 * ----------------------------------------------------
 * - Nodo final del flujo
 * - Animación fluida (entrada + movimiento)
 * - Compatible con Framer Motion v11+
 */
export default function EndNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 90,
                damping: 15,
                mass: 0.7,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'endNode', data })
                }}
                data-id={id}
                data-animated={data.__animated ? 'true' : 'false'}
                className="cursor-pointer rounded-lg border border-rose-700 bg-rose-600 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg"
            >
                <div className="flex items-center justify-center gap-2">
                    <Power className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {data.label || 'Fin'}
                    </span>
                </div>

                {/* 🔴 Handle de conexión (entrada) */}
                <Handle
                    type="target"
                    position={handlePosition}
                    className="!bg-rose-400"
                />
            </Card>
        </motion.div>
    )
}
