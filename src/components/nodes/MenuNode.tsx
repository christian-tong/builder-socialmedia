// src/components/nodes/MenuNode.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import type { QuickReplyInteractive } from '@/types/getDataComplete'

/**
 * 🧠 MenuNode (v3.3 EdgeFixedRight)
 * ------------------------------------------------------
 * - Los handles de opciones están anclados al borde derecho del card.
 * - Cada handle se alinea exactamente con la altura de su opción.
 * - Sin offsets exagerados ni transformaciones arbitrarias.
 */
export function MenuNode({ id, data }: { id: string; data: any }) {
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGetDataCompleteBaseStore()
    const { setSelectedNode } = useNodeConfigStore()

    const nodeData = getNodeData(id)
    const interactive = nodeData?.interactive as
        | QuickReplyInteractive
        | undefined
    const type = interactive?.type || 'quick_reply'
    const options = interactive?.options || []

    // 🎨 Colores base por tipo
    const colorBase = type === 'quick_reply' ? 'purple' : 'blue'
    const bgClass =
        type === 'quick_reply'
            ? 'bg-purple-950 border-purple-600'
            : 'bg-blue-950 border-blue-600'
    const optionBg =
        type === 'quick_reply' ? 'bg-purple-800/40' : 'bg-blue-800/40'

    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
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
                    setSelectedNode({ id, type: 'menuNode', data })
                }}
                data-id={id}
                className={`relative w-[260px] cursor-pointer rounded-xl border select-none ${bgClass} p-3 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🏷️ Encabezado */}
                <div className="flex flex-col border-b border-white/10 pb-1.5">
                    <span className="text-xs tracking-wide text-white/70 uppercase">
                        {type === 'quick_reply' ? 'Quick Reply' : 'List'}
                    </span>
                    <span className="truncate text-sm font-semibold">
                        {nodeData.alias || nodeData.variable || id}
                    </span>
                </div>

                {/* 💬 Contenido */}
                {interactive?.content?.text && (
                    <div className="mt-2 line-clamp-3 text-[11px] whitespace-pre-wrap text-gray-200/90 italic">
                        {interactive.content.text}
                    </div>
                )}

                {/* 🔘 Opciones visuales */}
                {options.length > 0 && (
                    <div className="relative mt-3 space-y-1 text-xs">
                        {options.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`relative flex items-center justify-between rounded-md ${optionBg} px-2 py-1 text-gray-100`}
                            >
                                {/* Texto de opción */}
                                <div className="flex items-center gap-2 pr-6">
                                    <span className="text-[10px] opacity-70">
                                        #{opt.postbackText}
                                    </span>
                                    <span className="truncate">
                                        {opt.title ||
                                            `(Opción ${opt.postbackText})`}
                                    </span>
                                </div>

                                {/* 🎯 Handle anclado al borde derecho */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={opt.postbackText}
                                    className="absolute !h-2.5 !w-2.5 !bg-emerald-400"
                                    style={{
                                        top: '50%',
                                        right: '-6px', // 👈 exactamente al borde derecho del card
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 🎯 Handle de entrada principal */}
                <Handle
                    type="target"
                    position={handleTarget}
                    id="in"
                    className={`!bg-${colorBase}-400`}
                />

                {/* 🟢🔴🟠 Handles globales (onTrue/onFalse/onError) */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onTrue"
                    className="!bg-green-500"
                    style={{ left: '30%' }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onFalse"
                    className="!bg-red-500"
                    style={{ left: '50%' }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onError"
                    className="!bg-orange-500"
                    style={{ left: '70%' }}
                />
            </Card>
        </motion.div>
    )
}
