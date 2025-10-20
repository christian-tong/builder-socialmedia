// src\components\nodes\DerivateNode.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import { UserCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🟨 DerivateNode
 * ----------------------------------------------------
 * - Nodo de derivación a un skill o asesor
 * - Incluye animación suave (entrada + movimiento)
 * - Compatible con Framer Motion v11+
 */
const DerivateNode = ({ id, data }: any) => {
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
                stiffness: 80,
                damping: 14,
                mass: 0.6,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'derivateNode', data })
                }}
                data-id={id}
                data-animated={data.__animated ? 'true' : 'false'}
                className="relative cursor-pointer rounded-lg border border-amber-600 bg-amber-500 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg dark:bg-amber-700"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    {/* 🔹 Título */}
                    <div className="flex items-center justify-center gap-2">
                        <UserCircle2 className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            {data.label || 'Derivación'}
                        </span>
                    </div>

                    {/* 🔹 Skill asociado */}
                    {data.skillLabel && (
                        <p className="text-[10px] opacity-90">
                            {data.skillLabel}
                        </p>
                    )}
                </div>

                {/* 🟢🟡🔴 Handles */}
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
        </motion.div>
    )
}

export default DerivateNode
