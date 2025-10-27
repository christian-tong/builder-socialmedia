// src\components\nodes\MySQLQueryNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import React from 'react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useMySQLQueryStore } from '@/store/useMySQLQueryStore'

/**
 * 🧠 MySQLQueryNode
 * ----------------------------------------------------
 * - Nodo que ejecuta una consulta SQL y guarda resultados
 * - Color base: azul oscuro (#2D3E50)
 * - Anima su entrada con spring
 */
export default function MySQLQueryNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { byId } = useMySQLQueryStore()

    const queryData = byId[id] || data.object || {}

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14,
                mass: 0.7,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'mysqlQueryNode', data })
                }}
                data-id={id}
                className="relative w-full max-w-[240px] cursor-pointer rounded-lg border px-3 py-2 text-center text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg"
                style={{
                    backgroundColor: '#2D3E50',
                    borderColor: '#2D3E50',
                }}
            >
                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                    {/* 🔹 Título */}
                    <div className="flex items-center justify-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="text-sm font-medium break-words">
                            {data.label || 'MySQL Query'}
                        </span>
                    </div>

                    {/* 🔹 Variable destino */}
                    {queryData.setvar && (
                        <p className="mt-1 text-[10px] opacity-90">
                            ⇢ {queryData.setvar}
                        </p>
                    )}

                    {/* 🔹 Resumen de query */}
                    {queryData.query && (
                        <p
                            className="mt-1 text-[10px] leading-snug text-gray-200 opacity-85"
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 200,
                            }}
                        >
                            {queryData.query}
                        </p>
                    )}
                </div>

                {/* Handles */}
                <Handle
                    type="target"
                    position={targetPosition}
                    className="!bg-[#4C6FA3]"
                />
                <Handle
                    type="source"
                    position={sourcePosition}
                    id="onTrue"
                    className="!bg-[#4C6FA3]"
                />
            </Card>
        </motion.div>
    )
}
