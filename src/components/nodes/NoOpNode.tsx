// src\components\nodes\NoOpNode.tsx
'use client'

import { motion } from 'framer-motion'
import { MinusCircle } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'

/**
 * 🟤 NoOpNode (v3.0 – SimplifiedView + Tooltip)
 * ----------------------------------------------------
 * ✅ Nodo neutro sin operaciones
 * ✅ Vista simplificada con ícono centrado
 * ✅ Tooltip dinámico con descripción o texto por defecto
 * ✅ Colores grises institucionales
 */
export default function NoOpNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Tooltip dinámico
    const tooltipDescription =
        data.description?.trim() || 'Nodo sin operación (placeholder visual)'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({ id, type: 'noopNode', data })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-gray-400 bg-gray-100 text-gray-700 shadow-sm transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-md ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[180px] rounded-xl px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // 🟤 Ícono centrado
                                <div className="flex h-full w-full items-center justify-center">
                                    <MinusCircle
                                        className={`${
                                            simplifiedView
                                                ? 'size-7 opacity-70'
                                                : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <MinusCircle className="h-4 w-4 opacity-70" />
                                    <span className="text-xs font-semibold tracking-wide">
                                        No Operación
                                    </span>
                                    {data.description && (
                                        <span className="line-clamp-2 text-[10px] opacity-60">
                                            {data.description}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Handles */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                className="!bg-gray-400"
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip visible solo en vista simplificada */}
                    {simplifiedView && (
                        <TooltipContent
                            side="top"
                            className="max-w-[220px] text-center text-xs font-medium"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-70">
                                    ID: {id}
                                </span>
                                <span>{tooltipDescription}</span>
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    )
}
