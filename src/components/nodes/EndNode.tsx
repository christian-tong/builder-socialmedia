// src\components\nodes\EndNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Power } from 'lucide-react'
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
 * 🔴 EndNode (v3.0 – Ícono Dinámico + Tooltip + SimplifiedView)
 * -------------------------------------------------------------
 * ✅ Ícono centrado y responsivo (size-7 / size-4)
 * ✅ Vista simplificada + Tooltip con ID y descripción
 * ✅ Solo permite conexiones entrantes (target)
 */
export default function EndNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    // 🚫 Evita conexiones salientes
    const isValidConnection = (connection: Connection) => {
        if (connection.source === id) {
            toast.warning('Conexión no permitida', {
                description:
                    'El nodo de Fin no puede tener conexiones salientes.',
            })
            return false
        }
        return true
    }

    // 🧠 Tooltip dinámico (usa descripción o label)
    const tooltipDescription =
        data.description?.trim() ||
        data.label?.trim() ||
        'Fin del flujo (Hangup)'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 90,
                damping: 14,
                mass: 0.7,
            }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({ id, type: 'endNode', data })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-rose-700 bg-rose-600 text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg dark:border-rose-800 dark:bg-rose-800 ${
                                simplifiedView
                                    ? // ✅ Ícono centrado en modo simplificado
                                      'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[220px] rounded-lg px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // ✅ Ícono visible y centrado perfectamente
                                <div className="flex h-full w-full items-center justify-center">
                                    <Power
                                        className={`${
                                            simplifiedView ? 'size-7' : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center">
                                    {/* 🔹 Cabecera */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Power className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {data.label || 'Fin del flujo'}
                                        </span>
                                    </div>

                                    {/* 🔹 Descripción opcional */}
                                    {data.description && (
                                        <p className="mt-1 text-[11px] leading-tight text-rose-50/90">
                                            {data.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 🔴 Handle de conexión (entrada) */}
                            <Handle
                                type="target"
                                position={handlePosition}
                                className="!bg-rose-400"
                                isValidConnection={isValidConnection}
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip Simplificado */}
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
