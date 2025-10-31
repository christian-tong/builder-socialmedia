// src\components\nodes\DerivateNode.tsx

'use client'

import { motion } from 'framer-motion'
import { UserCircle2, Clock4 } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🟨 DerivateNode (v2.3)
 * ----------------------------------------------------
 * - Muestra el skill destino y el mensaje de timeout
 * - Se actualiza en tiempo real con los cambios del formulario
 * - Diseño coherente con SimpleTextNode
 */
export default function DerivateNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Datos principales
    const skillLabel =
        data.skillLabel || (data.skill ? `Skill ${data.skill}` : 'Sin skill')
    const timeoutMessage = data.timeoutMessage
        ? decodeURIComponent(data.timeoutMessage)
        : ''

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
                className="relative w-full max-w-[240px] cursor-pointer rounded-lg border border-amber-600 bg-amber-500 px-3 py-2 text-center text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg dark:bg-amber-700"
            >
                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                    {/* 🔹 Título */}
                    <div className="flex items-center justify-center gap-2">
                        <UserCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium break-words">
                            {data.label || 'Derivación'}
                        </span>
                    </div>

                    {/* 🎯 Skill asociado */}
                    {skillLabel && (
                        <p className="text-[11px] leading-tight text-amber-50/90">
                            Skill: {skillLabel}
                        </p>
                    )}

                    {/* ⏳ Timeout Message */}
                    {timeoutMessage && (
                        <div className="mt-1 flex items-start justify-center gap-1">
                            <p
                                className="max-w-[200px] text-[10px] leading-snug break-words text-amber-50/80"
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {timeoutMessage}
                            </p>
                        </div>
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
                    id="onTrue"
                    className="!bg-amber-300"
                />
            </Card>
        </motion.div>
    )
}
