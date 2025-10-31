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

export default function SaveRecordNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSaveRecordStore()
    const { nextNodes, prevNodes } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const url = nodeData?.auth?.url?.trim() || '(sin URL)'

    // 🔹 Preprocesar body para mostrarlo con saltos de línea y solo 5 primeras líneas
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
            // Si no es JSON válido, solo recortar el texto plano
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

                    <div className="rounded-md border border-amber-700/40 bg-amber-900/30 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-amber-200">
                        <span className="font-semibold text-amber-400">
                            Body:
                        </span>
                        <pre className="mt-0.5 max-h-[80px] overflow-hidden whitespace-pre-wrap">
                            {formattedBody}
                        </pre>
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
