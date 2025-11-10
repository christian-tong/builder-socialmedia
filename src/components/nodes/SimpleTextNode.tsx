// src\components\nodes\SimpleTextNode.tsx

'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * 🟦 SimpleTextNode
 * ----------------------------------------------------
 * - Corrige render del ícono en vista simplificada
 * - Tooltip dinámico con descripción o mensaje
 * - Soporta orientación vertical/horizontal
 */
export function SimpleTextNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Tooltip dinámico (prioridad: descripción → mensaje → label)
    const tooltipDescription =
        data.description?.trim() ||
        data.message?.trim() ||
        data.label?.trim() ||
        'Mensaje sin descripción'

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
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'simpleTextNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-indigo-700 bg-indigo-600 text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg ${
                                simplifiedView
                                    ? // ✅ Vista simplificada con centrado real
                                      'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[220px] rounded-lg px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // ✅ Ícono siempre visible y centrado perfectamente
                                <div className="flex h-full w-full items-center justify-center">
                                    <MessageSquare
                                        className={`${
                                            simplifiedView
                                                ? 'size-7'
                                                : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                                    {/* 🔹 Título */}
                                    <div className="flex items-center justify-center gap-2">
                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium break-words">
                                            {data.label || 'Texto sin título'}
                                        </span>
                                    </div>

                                    {/* 🔹 Contenido dinámico */}
                                    {data.message && (
                                        <p
                                            className="mt-1 text-center text-[11px] leading-snug break-words opacity-85"
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {data.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 🟢🟡🔵 Handles */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                className="!bg-indigo-400"
                            />
                            <Handle
                                type="source"
                                position={sourcePosition}
                                id="onTrue"
                                className="!bg-indigo-400"
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip al pasar el mouse (simplifiedView) */}
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
