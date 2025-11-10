// src/components/nodes/SaveRecordNode.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Handle, Position } from 'reactflow'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'

/**
 * 🟠 SaveRecordNode (v3.5 — Fix edge layering + smooth handles)
 * ------------------------------------------------------------
 * ✅ Corrige el bug visual donde los edges parecen estar debajo del nodo
 * ✅ Elimina stacking context de transformaciones hover
 * ✅ Usa z-index controlado en handles
 * ✅ Mantiene tooltip y vista simplificada
 * ✅ Paleta ámbar uniforme
 */
export default function SaveRecordNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSaveRecordStore()
    const { simplifiedView } = useSettingsStore()
    const { nextNodes, prevNodes } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const url = nodeData?.auth?.url?.trim() || '(sin URL)'

    // 🔹 Formateo visual del body (máximo 5 líneas)
    let formattedBody = '{}'
    if (nodeData?.body) {
        try {
            const json = JSON.parse(nodeData.body)
            const pretty = JSON.stringify(json, null, 2)
            const lines = pretty.split('\n')
            formattedBody =
                lines.length > 5
                    ? lines.slice(0, 5).join('\n') + '\n...'
                    : pretty
        } catch {
            const lines = nodeData.body.split('\n')
            formattedBody =
                lines.length > 5
                    ? lines.slice(0, 5).join('\n') + '\n...'
                    : nodeData.body
        }
    }

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Tooltip dinámico
    const tooltipDescription =
        data.description?.trim() ||
        data.label?.trim() ||
        'Guarda los datos procesados o resultados en un registro remoto'

    return (
        <motion.div
            layout
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 75, damping: 13 }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'saveRecordNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer overflow-visible border border-amber-500 bg-amber-900 text-white shadow-md transition-all select-none ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'w-full max-w-[260px] rounded-xl'
                            }`}
                        >
                            {simplifiedView ? (
                                // 🟡 Ícono centrado (vista compacta)
                                <div className="flex h-full w-full items-center justify-center">
                                    <Save className="size-7 text-amber-300" />
                                </div>
                            ) : (
                                <>
                                    {/* 🔹 Encabezado */}
                                    <div className="flex items-center justify-between border-b border-amber-700/40 px-3 pt-1.5 pb-1">
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4 text-amber-300" />
                                            <span className="text-sm font-semibold">
                                                {data?.label || 'Save Record'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 🔸 Contenido */}
                                    <div className="space-y-1 px-3 py-2 text-[11px] leading-tight text-gray-200">
                                        <div className="flex items-start gap-1">
                                            <span className="font-semibold text-amber-300">
                                                URL:
                                            </span>
                                            <span
                                                className="block max-w-[190px] truncate"
                                                title={url}
                                            >
                                                {url}
                                            </span>
                                        </div>

                                        <div className="rounded-md border border-amber-700/40 bg-amber-900/40 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-amber-200">
                                            <span className="font-semibold text-amber-400">
                                                Body:
                                            </span>
                                            <pre className="mt-0.5 max-h-[80px] overflow-hidden whitespace-pre-wrap">
                                                {formattedBody}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 🟠 Handles (ajustados para edges correctos) */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                id="in"
                                className="!z-[5] !bg-amber-300"
                            />
                            <Handle
                                type="source"
                                position={sourcePosition}
                                id="onTrue"
                                className="!z-[5] !bg-amber-300"
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip solo en modo simplificado */}
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
