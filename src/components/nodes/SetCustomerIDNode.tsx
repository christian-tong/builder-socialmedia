// src\components\nodes\SetCustomerIDNode.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { IdCard } from 'lucide-react'
import { Handle, Position, type Connection } from 'reactflow'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useSetCustomerIDStore,
    type SetCustomerIDObject,
} from '@/store/useSetCustomerIDStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'

/**
 * 🧠 SetCustomerIDNode (v2.5 — SimplifiedView + Tooltip + Description)
 * -------------------------------------------------------------------
 * ✅ Añade vista simplificada (ícono centrado, tooltip dinámico)
 * ✅ Compatible con orientación vertical/horizontal
 * ✅ Colores azul acero (#2C5282)
 * ✅ Integrado con Zustand (useSetCustomerIDStore)
 * ✅ Muestra JSON truncado del objeto “options”
 */
export default function SetCustomerIDNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSetCustomerIDStore()
    const { simplifiedView } = useSettingsStore()

    const nodeData: SetCustomerIDObject = getNodeData(id)
    const options = nodeData?.options ?? {}

    // 📐 Posiciones según orientación
    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // ⚠️ Evita conexiones entrantes
    const isValidConnection = (connection: Connection): boolean => {
        if (connection.target === id) {
            toast.warning('❌ Conexión no permitida', {
                description: 'Este nodo no puede recibir conexiones entrantes.',
            })
            return false
        }
        return true
    }

    // 🧾 Formato JSON truncado (máx. 5 líneas)
    let formattedJSON = '{}'
    try {
        const jsonStr = JSON.stringify(options, null, 2)
        const lines = jsonStr.split('\n')
        formattedJSON =
            lines.length > 5 ? lines.slice(0, 5).join('\n') + '\n...' : jsonStr
    } catch {
        formattedJSON = String(options)
    }

    // 💬 Tooltip dinámico
    const tooltipDescription =
        data.description?.trim() ||
        data.label?.trim() ||
        'Establece el ID del cliente dentro del flujo actual'

    return (
        <motion.div
            layout
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 85, damping: 14 }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'setCustomerIDNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`relative cursor-pointer overflow-visible border border-[#1E3A5F] bg-[#2C5282] text-white shadow-md transition-all select-none ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'w-[240px] rounded-xl px-3 py-2'
                            }`}
                        >
                            {simplifiedView ? (
                                // 🟦 Vista simplificada (ícono centrado)
                                <div className="flex h-full w-full items-center justify-center">
                                    <IdCard className="size-7 text-sky-200" />
                                </div>
                            ) : (
                                <>
                                    {/* 🔹 Header */}
                                    <div className="flex items-center justify-between border-b border-white/20 pb-1">
                                        <div className="flex items-center gap-2">
                                            <IdCard className="h-4 w-4 text-white" />
                                            <span className="text-sm font-semibold">
                                                {data?.label ||
                                                    'Set Customer ID'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 🧾 Contenido estilo JSON */}
                                    <div className="space-y-1 pt-2 text-[11px] leading-tight text-gray-200">
                                        <div>
                                            <span className="font-semibold text-white">
                                                Opciones:
                                            </span>
                                        </div>

                                        <div className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-white">
                                            <pre className="max-h-[80px] overflow-hidden whitespace-pre-wrap">
                                                {formattedJSON}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 🟦 Handles */}
                            <Handle
                                type="target"
                                position={handleTarget}
                                className="!z-[5] !bg-[#4A6FA5]"
                                isValidConnection={isValidConnection}
                            />
                            <Handle
                                type="source"
                                position={handleSource}
                                id="onTrue"
                                className="!z-[5] !bg-[#2C5282]"
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip solo en vista simplificada */}
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
