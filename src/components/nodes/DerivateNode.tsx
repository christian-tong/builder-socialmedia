// src\components\nodes\DerivateNode.tsx

'use client'

import { motion } from 'framer-motion'
import { UserCircle2, Clock4 } from 'lucide-react'
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
 * 🟨 DerivateNode (v3.2 — Fix icono centrado + SimplifiedView)
 * -------------------------------------------------------------
 * ✅ Ícono dinámico con mismo tamaño responsive (size-7 / size-4)
 * ✅ Tooltip con ID + descripción
 * ✅ Handles centrados según orientación
 * ✅ Compatibilidad total con esquema amarillo
 */
export function DerivateNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Tooltip dinámico
    const tooltipDescription =
        data.description?.trim() ||
        data.skillLabel?.trim() ||
        data.label?.trim() ||
        'Derivación a skill'

    // 🎯 Datos principales
    const skillLabel =
        data?.skillLabel?.trim() ||
        (data?.skill ? `Skill ${data.skill}` : 'Sin skill')

    const timeoutMessage = data?.timeoutMessage
        ? decodeURIComponent(data.timeoutMessage)
        : ''
    const queueMessage = data?.queueMessage
        ? decodeURIComponent(data.queueMessage)
        : ''
    const inboundMessage = data?.inboundMessage
        ? decodeURIComponent(data.inboundMessage)
        : ''

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
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'derivateNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-amber-500 bg-amber-500 text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg dark:border-amber-700 dark:bg-amber-800 ${
                                simplifiedView
                                    ? // ✅ Ícono centrado en modo simplificado
                                      'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[250px] rounded-xl px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // ✅ Ícono visible y centrado perfectamente
                                <div className="flex h-full w-full items-center justify-center">
                                    <UserCircle2
                                        className={`${
                                            simplifiedView ? 'size-7' : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                                    {/* 🔹 Título */}
                                    <div className="flex items-center justify-center gap-2">
                                        <UserCircle2 className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium break-words">
                                            {data.label || 'Derivación'}
                                        </span>
                                    </div>

                                    {/* 🔹 Skill destino */}
                                    <p className="text-[11px] leading-tight text-amber-50/90">
                                        Skill: {skillLabel}
                                    </p>

                                    {/* 🔹 Timeout */}
                                    {timeoutMessage && (
                                        <div className="mt-1 flex items-start justify-center gap-1">
                                            <Clock4 className="h-3 w-3 flex-shrink-0 text-amber-200/80" />
                                            <p
                                                className="max-w-[200px] text-[10px] leading-snug break-words text-amber-50/80"
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                }}
                                            >
                                                {timeoutMessage}
                                            </p>
                                        </div>
                                    )}

                                    {/* 🔹 Queue */}
                                    {queueMessage && (
                                        <p className="max-w-[200px] text-[10px] leading-snug text-amber-50/70">
                                            {queueMessage}
                                        </p>
                                    )}

                                    {/* 🔹 Inbound */}
                                    {inboundMessage && (
                                        <p className="max-w-[200px] text-[10px] leading-snug text-amber-50/70">
                                            {inboundMessage}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 🟡 Handles */}
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
