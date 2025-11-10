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
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * 🧠 MySQLQueryNode (v3.1 — Estilo SimpleTextNode)
 * ---------------------------------------------------------
 * ✅ Ícono dinámico centrado (size-7 / size-4)
 * ✅ Tooltip con ID + descripción
 * ✅ Handles adaptativos (vertical / horizontal)
 * ✅ Colores coherentes #2D3E50 / #4C6FA3
 * ✅ Estructura y animación unificada con SimpleTextNode
 */
export function MySQLQueryNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()
    const { byId } = useMySQLQueryStore()

    const queryData = byId[id] || data.object || {}

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // 🧠 Tooltip dinámico (prioridad: descripción → label → fallback)
    const tooltipDescription =
        data.description?.trim() ||
        data.label?.trim() ||
        'Ejecuta una consulta MySQL y guarda los resultados'

    const variable = queryData?.setvar || '(sin variable)'
    const script =
        queryData?.script?.trim() || queryData?.query?.trim() || '(sin query)'

    // 🧩 Limitar líneas visibles
    const limitedScript =
        script.split('\n').length > 4
            ? script.split('\n').slice(0, 4).join('\n') + '\n...'
            : script

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 80,
                damping: 14,
                mass: 0.6,
            }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'mysqlQueryNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-[#4C6FA3] bg-[#2D3E50] text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[240px] rounded-lg px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // ✅ Ícono centrado dinámico (como SimpleTextNode)
                                <div className="flex h-full w-full items-center justify-center">
                                    <Database
                                        className={`${
                                            simplifiedView ? 'size-7' : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                                    {/* 🔹 Título */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Database className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium break-words">
                                            {data.label || 'MySQL Query'}
                                        </span>
                                    </div>

                                    {/* 🔹 Variable */}
                                    <p className="font-mono text-[11px] text-sky-200 opacity-90">
                                        ⇢ {variable}
                                    </p>

                                    {/* 🔹 Script truncado */}
                                    <pre
                                        className="mt-1 text-[10px] leading-snug break-words whitespace-pre-wrap text-gray-200 opacity-85"
                                        style={{ whiteSpace: 'pre-wrap' }}
                                    >
                                        {limitedScript}
                                    </pre>
                                </div>
                            )}

                            {/* 🟢🟡 Handles */}
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
                    </TooltipTrigger>

                    {/* 💬 Tooltip (solo en vista simplificada) */}
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
