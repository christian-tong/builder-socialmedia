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

/**
 * 🧾 SaveRecordNode (v1.4 – Integrado con useNodeConnections)
 * ------------------------------------------------------------
 * ✅ Refleja conexiones reales (prev / next)
 * ✅ Mantiene el patrón diferido (solo renderiza datos guardados)
 * ✅ Estructura coherente con SimpleTextNode
 */
export default function SaveRecordNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSaveRecordStore()
    const { nextNodes, prevNodes } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const url = nodeData?.auth?.url?.trim() || '(sin URL)'
    const bodyPreview = nodeData?.body
        ? nodeData.body.length > 100
            ? nodeData.body.slice(0, 100) + '...'
            : nodeData.body
        : '{}'

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

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
                className="relative w-full max-w-[260px] cursor-pointer overflow-hidden rounded-xl border border-amber-700 bg-amber-950 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🔹 Encabezado */}
                <div className="flex items-center justify-between border-b border-amber-800/40 px-3 pt-1.5 pb-1">
                    <div className="flex items-center gap-2">
                        <Save className="h-4 w-4 text-amber-300" />
                        <span className="text-sm font-semibold">
                            {data?.label || 'Save Record'}
                        </span>
                    </div>
                </div>

                {/* 🔸 Contenido */}
                <div className="space-y-1 px-3 py-2 text-[11px] leading-tight text-gray-200">
                    <div>
                        <span className="font-semibold text-amber-300">
                            URL:
                        </span>{' '}
                        {url}
                    </div>
                    <div className="rounded-md border border-amber-700/40 bg-amber-900/30 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-amber-200">
                        <span className="font-semibold text-amber-400">
                            Body:
                        </span>{' '}
                        {bodyPreview}
                    </div>
                </div>

                {/* 🟠 Handles dinámicos */}
                <Handle
                    type="target"
                    position={targetPosition}
                    id="in"
                    className="!bg-amber-600"
                />
                <Handle
                    type="source"
                    position={sourcePosition}
                    id="onTrue"
                    className="!bg-amber-400"
                />
            </Card>
        </motion.div>
    )
}
