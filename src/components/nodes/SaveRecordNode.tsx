// src\components\nodes\SaveRecordNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'

/**
 * 🧾 SaveRecordNode
 * ------------------------------------------------------------
 * - Muestra auth.url y resumen del body
 * - Inspirado en ChatBotIARequestNode
 * - Colores cálidos (naranja/ámbar)
 */
export default function SaveRecordNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSaveRecordStore()

    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    const nodeData = getNodeData(id)
    const url = nodeData?.auth?.url || '(sin URL)'
    const body =
        nodeData?.body && nodeData.body.trim() !== '' ? nodeData.body : '{ }'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 12 }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'saveRecordNode', data })
                }}
                data-id={id}
                className="relative w-full max-w-[240px] cursor-pointer overflow-visible rounded-xl border border-amber-700 bg-amber-950 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🔹 Encabezado */}
                <div className="border-b border-amber-800/40 px-3 pt-1.5 pb-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Save className="h-4 w-4 text-amber-300" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label || 'Save Record'}
                        </span>
                    </div>
                </div>

                {/* 🔸 Contenido principal */}
                <div className="space-y-1 px-3 py-1.5 text-[11px] text-gray-200">
                    <div className="break-words">
                        <span className="font-semibold text-amber-300">
                            URL:
                        </span>{' '}
                        {url}
                    </div>

                    <div className="rounded-md border border-amber-700/40 bg-amber-900/30 px-2 py-1 font-mono text-[10px] leading-tight break-words whitespace-pre-wrap text-amber-200">
                        <span className="font-semibold text-amber-400">
                            Body:
                        </span>{' '}
                        {body}
                    </div>
                </div>

                <Handle
                    type="target"
                    position={handleTarget}
                    id="in"
                    className="!bg-amber-600"
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onTrue"
                    className="!bg-amber-400"
                />
            </Card>
        </motion.div>
    )
}
