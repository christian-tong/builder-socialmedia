// src\components\nodes\GetDataCompleteNode.tsx

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import type { QuickReplyInteractive } from '@/types/getDataComplete'

/**
 * 🧠 GetDataCompleteNode (v2.0 OptionFlow)
 * ------------------------------------------------------
 * - Muestra título, mensaje y opciones del Quick Reply
 * - Renderiza handles de onTrue/onFalse/onError
 * - Crea dinámicamente un handle para cada opción (1, 2, 3, etc.)
 * - Totalmente compatible con el patrón SafeSync (sin re-render innecesario)
 */
export function GetDataCompleteNode({ id, data }: { id: string; data: any }) {
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGetDataCompleteBaseStore()
    const { setSelectedNode } = useNodeConfigStore()

    const nodeData = getNodeData(id)
    const interactive = nodeData?.interactive as
        | QuickReplyInteractive
        | undefined

    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    const options = interactive?.options || []

    const handlePositions = useMemo(() => {
        if (orientation === 'vertical') return Position.Bottom
        return Position.Right
    }, [orientation])

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'GetDataCompleteNode', data })
                }}
                className="relative w-[260px] cursor-pointer rounded-xl border border-purple-600 bg-purple-950 p-3 text-white shadow-md transition-all select-none hover:shadow-lg"
            >
                {/* 🧾 Header */}
                <div className="mb-1 text-xs tracking-wide text-purple-300 uppercase">
                    🧩 GetDataComplete
                </div>
                <div className="text-sm font-semibold">
                    {nodeData.alias || nodeData.variable || id}
                </div>

                {/* 💬 Mensaje */}
                {interactive?.content?.text && (
                    <div className="mt-2 line-clamp-3 text-[11px] whitespace-pre-wrap text-purple-200/90 italic">
                        {interactive.content.text}
                    </div>
                )}

                {/* 🔘 Opciones */}
                {options.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs">
                        {options.map((opt, idx) => (
                            <div
                                key={idx}
                                className="relative flex items-center justify-between rounded-md bg-purple-800/40 px-2 py-1 text-purple-100"
                            >
                                <span className="w-[160px] truncate">
                                    {opt.title ||
                                        `(Opción ${opt.postbackText})`}
                                </span>
                                <span className="text-[10px] opacity-70">
                                    #{opt.postbackText}
                                </span>

                                {/* 🎯 Handle de conexión por opción */}
                                <Handle
                                    type="source"
                                    position={handlePositions}
                                    id={opt.postbackText}
                                    className="absolute top-1/2 -right-2 !h-2.5 !w-2.5 -translate-y-1/2 !bg-emerald-400"
                                    style={{
                                        right:
                                            orientation === 'vertical'
                                                ? '50%'
                                                : '-6px',
                                        top:
                                            orientation === 'vertical'
                                                ? 'auto'
                                                : '50%',
                                        bottom:
                                            orientation === 'vertical'
                                                ? '-6px'
                                                : 'auto',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 🟢🔴🟠 Handles globales */}
                <Handle
                    type="target"
                    position={handleTarget}
                    className="!bg-purple-400"
                />

                <Handle
                    type="source"
                    position={handleSource}
                    id="onTrue"
                    className="!bg-green-400"
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onFalse"
                    className="ml-3 !bg-red-400"
                    style={{
                        left: orientation === 'vertical' ? '48%' : undefined,
                    }}
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onError"
                    className="ml-6 !bg-orange-400"
                    style={{
                        left: orientation === 'vertical' ? '60%' : undefined,
                    }}
                />
            </Card>
        </motion.div>
    )
}
