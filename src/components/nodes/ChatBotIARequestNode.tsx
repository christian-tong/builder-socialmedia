// src\components\nodes\ChatBotIARequestNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import React, { useMemo } from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useChatBotIAStore } from '@/store/useChatBotIAStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * 🤖 ChatBotIARequestNode (v3.0 — SimplifiedView + Tooltip + Dynamic Handles)
 * ---------------------------------------------------------------------------
 * ✅ Soporta vista simplificada con ícono central
 * ✅ Tooltip dinámico con ID y descripción
 * ✅ Handles dinámicos según orientación
 * ✅ Mantiene colores originales y formato JSON
 */
export default function ChatBotIARequestNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useChatBotIAStore()
    const { simplifiedView } = useSettingsStore()

    const nodeData = getNodeData(id)
    const variable = nodeData?.variable || '(sin variable)'
    const url = nodeData?.url || '(sin URL)'
    const rawBody =
        nodeData?.body && nodeData.body.trim() !== '' ? nodeData.body : '{}'

    // 🧩 Formateo del JSON
    const formattedBody = useMemo(() => {
        try {
            const parsed = JSON.parse(rawBody)
            return JSON.stringify(parsed, null, 2)
        } catch {
            return rawBody
        }
    }, [rawBody])

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const tooltipDescription =
        data.description?.trim() || data.label?.trim() || 'Petición ChatBot IA'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'chatBotIARequestNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`relative cursor-pointer border border-indigo-700 bg-indigo-950 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'w-full max-w-[260px] overflow-visible rounded-xl'
                            }`}
                        >
                            {simplifiedView ? (
                                // 🧠 Ícono centrado
                                <div className="flex h-full w-full items-center justify-center">
                                    <Brain className="size-7 text-indigo-300" />
                                </div>
                            ) : (
                                <>
                                    {/* 🔹 Encabezado */}
                                    <div className="border-b border-indigo-800/40 px-3 pt-1.5 pb-1 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Brain className="h-4 w-4 text-indigo-300" />
                                            <span className="text-sm font-semibold break-words">
                                                {data?.label ||
                                                    'ChatBot IA Request'}
                                            </span>
                                        </div>
                                        {variable && (
                                            <p className="mt-0.5 font-mono text-[11px] break-words text-indigo-200 opacity-90">
                                                Var: {variable}
                                            </p>
                                        )}
                                    </div>

                                    {/* 🔸 Contenido principal */}
                                    <div className="space-y-1 px-3 py-2 text-[11px] text-gray-200">
                                        <div className="break-words">
                                            <span className="font-semibold text-indigo-300">
                                                URL:
                                            </span>{' '}
                                            {url}
                                        </div>

                                        <div className="rounded-md border border-indigo-700/40 bg-indigo-900/30 px-2 py-1 font-mono text-[10px] leading-tight break-words whitespace-pre-wrap text-indigo-200">
                                            <span className="font-semibold text-indigo-400">
                                                Body:
                                            </span>
                                            <pre className="mt-1 break-words whitespace-pre-wrap">
                                                {formattedBody}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 🎯 Handle de entrada */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                id="in"
                                className="!bg-indigo-600"
                            />

                            {/* 🟢🔴 Handles dinámicos según orientación */}
                            {orientation === 'vertical' ? (
                                <>
                                    <Handle
                                        type="source"
                                        id="onTrue"
                                        position={Position.Bottom}
                                        style={{ left: '35%' }}
                                        className="!bg-green-500"
                                    />
                                    <Handle
                                        type="source"
                                        id="onFalse"
                                        position={Position.Bottom}
                                        style={{ left: '65%' }}
                                        className="!bg-red-500"
                                    />
                                </>
                            ) : (
                                <>
                                    <Handle
                                        type="source"
                                        id="onTrue"
                                        position={Position.Right}
                                        style={{ top: '35%' }}
                                        className="!bg-green-500"
                                    />
                                    <Handle
                                        type="source"
                                        id="onFalse"
                                        position={Position.Right}
                                        style={{ top: '65%' }}
                                        className="!bg-red-500"
                                    />
                                </>
                            )}
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
