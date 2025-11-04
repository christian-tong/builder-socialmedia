// src\components\nodes\ChatBotIARequestNode.tsx
'use client'

import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useChatBotIAStore } from '@/store/useChatBotIAStore'

/**
 * 🤖 ChatBotIARequestNode (v2.1 – AutoHeight + Colors Preserved)
 * ------------------------------------------------------------
 * ✅ Mantiene colores originales (indigo oscuro)
 * ✅ Altura dinámica según contenido del body
 * ✅ Formato JSON con saltos de línea visibles
 * ✅ No se trunca ni oculta el contenido
 */
export default function ChatBotIARequestNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useChatBotIAStore()

    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left

    const nodeData = getNodeData(id)
    const variable = nodeData?.variable || '(sin variable)'
    const url = nodeData?.url || '(sin URL)'
    const rawBody =
        nodeData?.body && nodeData.body.trim() !== '' ? nodeData.body : '{}'

    // 🧩 Intenta formatear el body como JSON legible
    let formattedBody = rawBody
    try {
        const parsed = JSON.parse(rawBody)
        formattedBody = JSON.stringify(parsed, null, 2)
    } catch {
        // si no es JSON válido, se deja texto plano
        formattedBody = rawBody
    }

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
                    setSelectedNode({ id, type: 'chatBotIARequestNode', data })
                }}
                data-id={id}
                className="relative w-full max-w-[260px] cursor-pointer overflow-visible rounded-xl border border-indigo-700 bg-indigo-950 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🔹 Encabezado */}
                <div className="border-b border-indigo-800/40 px-3 pt-1.5 pb-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Brain className="h-4 w-4 text-indigo-300" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label || 'ChatBot IA Request'}
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
                    {/* URL */}
                    <div className="break-words">
                        <span className="font-semibold text-indigo-300">
                            URL:
                        </span>{' '}
                        {url}
                    </div>

                    {/* Body dinámico */}
                    <div className="rounded-md border border-indigo-700/40 bg-indigo-900/30 px-2 py-1 font-mono text-[10px] leading-tight break-words whitespace-pre-wrap text-indigo-200">
                        <span className="font-semibold text-indigo-400">
                            Body:
                        </span>
                        <pre className="mt-1 break-words whitespace-pre-wrap">
                            {formattedBody}
                        </pre>
                    </div>
                </div>

                {/* 🎯 Handle de entrada */}
                <Handle
                    type="target"
                    position={handleTarget}
                    id="in"
                    className="!bg-indigo-600"
                />

                {/* 🟢🔴 Handles de salida */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onTrue"
                    className="!bg-green-500"
                    style={{
                        left: '35%',
                    }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onFalse"
                    className="!bg-red-500"
                    style={{
                        left: '65%',
                    }}
                />
            </Card>
        </motion.div>
    )
}
