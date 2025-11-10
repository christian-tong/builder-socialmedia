// src\components\nodes\StartNode.tsx

'use client'

import { motion } from 'framer-motion'
import { PlayCircle } from 'lucide-react'
import React from 'react'
import { type Connection, Handle, Position } from 'reactflow'
import { toast } from 'sonner'
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
 * 🟢 StartNode
 * ----------------------------------------------------
 * - Nodo inicial del flujo
 * - Compatible con vista simplificada (solo ícono)
 * - Tooltip con ID + descripción (o label si descripción vacía)
 */
export function StartNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    const isValidConnection = (connection: Connection) => {
        if (connection.target === id) {
            toast.warning('Conexión no permitida', {
                description:
                    'El nodo de Inicio no puede recibir conexiones entrantes.',
            })
            return false
        }
        return true
    }

    // 🧠 Tooltip dinámico — usa descripción o fallback
    const tooltipDescription =
        data.description?.trim() || data.label?.trim() || 'Inicio del flujo'

    return (
        <motion.div
            layout
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 100,
                damping: 10,
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
                                    type: 'startNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`flex cursor-pointer items-center justify-center border border-emerald-700 bg-emerald-600 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-lg ${
                                simplifiedView
                                    ? 'size-12 rounded-2xl'
                                    : 'rounded-lg px-3 py-2'
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center ${
                                    simplifiedView ? '' : 'gap-2'
                                }`}
                            >
                                <PlayCircle
                                    className={`${
                                        simplifiedView ? 'size-7' : 'size-4'
                                    }`}
                                />
                                {!simplifiedView && (
                                    <span className="text-sm font-medium">
                                        {data.label || 'Inicio'}
                                    </span>
                                )}
                            </div>

                            {/* 🟢 Handle de salida */}
                            <Handle
                                type="source"
                                position={handlePosition}
                                className="!bg-emerald-400"
                                id="onTrue"
                                isValidConnection={isValidConnection}
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip al pasar el mouse */}
                    {simplifiedView && (
                        <TooltipContent
                            side="top"
                            className="max-w-[200px] text-center text-xs font-medium"
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
