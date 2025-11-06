// src\components\nodes\GenerateTokenNode.tsx

'use client'

import { motion } from 'framer-motion'
import { KeyRound } from 'lucide-react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useGenerateTokenStore } from '@/store/useGenerateTokenStore'

export default function GenerateTokenNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGenerateTokenStore()

    const nodeData = getNodeData(id)
    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧩 Formatear body con límite de 5 líneas
    let formattedBody = '{}'
    if (nodeData?.body) {
        try {
            const json = JSON.parse(
                typeof nodeData.body === 'string'
                    ? nodeData.body
                    : JSON.stringify(nodeData.body)
            )
            const pretty = JSON.stringify(json, null, 2)
            const lines = pretty.split('\n')
            formattedBody =
                lines.length > 5
                    ? lines.slice(0, 5).join('\n') + '\n...'
                    : pretty
        } catch {
            const text = String(nodeData.body)
            const lines = text.split('\n')
            formattedBody =
                lines.length > 5 ? lines.slice(0, 5).join('\n') + '\n...' : text
        }
    }

    // 🎨 Color del badge según el modo
    const mode = nodeData?.mode || '(sin modo)'
    const badgeColor =
        mode === 'button'
            ? 'bg-blue-500 text-white'
            : 'bg-pink-200 text-[#AA3E98] dark:bg-[#AA3E98]/30 dark:text-pink-200'

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
                    setSelectedNode({ id, type: 'generateTokenNode', data })
                }}
                className="relative w-[280px] cursor-pointer overflow-hidden rounded-xl border border-[#AA3E98] bg-[#C969B9] p-3 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🔹 Encabezado */}
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-white" />
                        <span className="text-sm font-semibold">
                            {data?.label || 'Generate Token'}
                        </span>
                    </div>

                    {/* 🎯 Badge del modo */}
                    <span
                        className={`rounded-full px-2 py-[1px] text-[10px] font-semibold capitalize ${badgeColor}`}
                    >
                        {mode}
                    </span>
                </div>

                {/* 🔸 Contenido */}
                <div className="space-y-1 pt-2 text-[11px] leading-tight text-gray-100">
                    <div>
                        <span className="font-semibold text-white">Texto:</span>{' '}
                        {nodeData.text || '(sin texto)'}
                    </div>

                    {/* 🧾 Body con {} y saltos */}
                    <div className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-white">
                        <span className="font-semibold text-[#FFE6F8]">
                            Body:
                        </span>
                        <pre className="mt-0.5 max-h-[80px] overflow-hidden whitespace-pre-wrap">
                            {formattedBody}
                        </pre>
                    </div>
                </div>

                {/* 🟣 Handles */}
                <Handle
                    type="target"
                    position={handleTarget}
                    className="!bg-[#AA3E98]"
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onTrue"
                    className="!bg-[#C65DB2]"
                />
            </Card>
        </motion.div>
    )
}
