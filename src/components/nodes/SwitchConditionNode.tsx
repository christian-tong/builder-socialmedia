// src\components\nodes\SwitchConditionNode.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GitBranch } from 'lucide-react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useSwitchConditionStore,
    getSwitchHandleId,
} from '@/store/useSwitchConditionStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'

/**
 * 🧩 SwitchConditionNode (v3.9 – Simplified con todas las opciones)
 * ---------------------------------------------------------------------
 * ✅ Vista simplificada con degradado violeta
 * ✅ Muestra todas las condiciones con espaciado uniforme
 * ✅ Tooltip dinámico con descripción o variable
 * ✅ Handles activos y alineados
 */
const SwitchConditionNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { byId, initNode } = useSwitchConditionStore()
    const { simplifiedView } = useSettingsStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    useEffect(() => {
        initNode(id)
    }, [id, initNode])

    const cfg = byId[id]
    const values = cfg?.values ?? ['SI']

    const dynamicHandles = useMemo(
        () =>
            values.map((val, i) => ({
                label: val || `Condición ${i + 1}`,
                short: (val || `Cond${i + 1}`).substring(0, 5).toUpperCase(),
                id: getSwitchHandleId(id, val || String(i)),
            })),
        [values, id]
    )

    // 🎨 Badge dinámico según modo
    const mode = cfg?.mode === 'strict' ? 'Estricto' : 'Flexible'
    const badgeColor =
        cfg?.mode === 'strict'
            ? 'bg-violet-200 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200'
            : 'bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'

    // 💬 Tooltip dinámico
    const tooltipDescription =
        data.description?.trim() ||
        cfg?.variable?.trim() ||
        data.label?.trim() ||
        'Condición sin descripción'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 75,
                damping: 13,
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
                                    type: 'switchConditionNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-violet-800 text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg ${
                                simplifiedView
                                    ? 'flex min-w-[60px] flex-col items-center justify-start gap-2 rounded-2xl bg-gradient-to-b from-violet-700 to-violet-600 p-1'
                                    : 'w-[280px] overflow-visible rounded-xl bg-violet-600'
                            }`}
                        >
                            {simplifiedView ? (
                                <>
                                    {/* 🟣 Ícono centrado */}
                                    <div className="mt-0.5 flex items-center justify-center border-b-2 border-violet-400">
                                        <GitBranch className="size-7 opacity-90" />
                                    </div>

                                    {/* 🔠 Todas las condiciones abreviadas */}
                                    <div className="flex w-full flex-col items-center gap-1">
                                        {dynamicHandles.length === 0 ? (
                                            <div className="text-[8px] italic opacity-70">
                                                Sin opciones
                                            </div>
                                        ) : (
                                            dynamicHandles.map((h) => (
                                                <div
                                                    key={h.id}
                                                    className="relative flex w-full items-center justify-center py-[2px]"
                                                >
                                                    <span className="truncate text-[8px] font-medium tracking-wide">
                                                        {h.short}
                                                    </span>
                                                    <Handle
                                                        id={h.id}
                                                        type="source"
                                                        position={
                                                            Position.Right
                                                        }
                                                        className="absolute right-[-3px] h-[6px] w-[6px] rounded-full !bg-violet-200 transition-all duration-150 hover:scale-110"
                                                        title={`Condición: ${h.label}`}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 🏷️ Encabezado */}
                                    <div className="flex items-center justify-between border-b border-white/20 px-3 pt-1.5 pb-1">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-4 w-4" />
                                            <span className="text-sm font-semibold break-words">
                                                {data?.label ||
                                                    'Condición por Variable'}
                                            </span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-[1px] text-[10px] font-semibold capitalize ${badgeColor}`}
                                        >
                                            {mode}
                                        </span>
                                    </div>

                                    {/* Variable + alias */}
                                    {cfg?.variable && (
                                        <p className="px-3 pt-1 font-mono text-[11px] break-words opacity-90">
                                            Var: {cfg.variable}{' '}
                                            <span className="opacity-70">
                                                {cfg.alias
                                                    ? `(${cfg.alias})`
                                                    : ''}
                                            </span>
                                        </p>
                                    )}

                                    {/* 🔀 Condiciones dinámicas */}
                                    <div className="relative mt-0.5 flex flex-col">
                                        {dynamicHandles.length === 0 ? (
                                            <div className="border-t border-white/20 bg-violet-700/30 px-3 py-[6px] text-[12px] italic opacity-80">
                                                Sin condiciones configuradas
                                            </div>
                                        ) : (
                                            dynamicHandles.map((h) => (
                                                <div
                                                    key={h.id}
                                                    className="relative flex items-center justify-between border-t border-white/20 bg-violet-700/40 px-3 py-[6px] text-[12px] hover:bg-violet-700/60"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-violet-200">
                                                            =
                                                        </span>
                                                        <span className="max-w-[160px] truncate">
                                                            {h.label}
                                                        </span>
                                                    </div>
                                                    <Handle
                                                        id={h.id}
                                                        type="source"
                                                        position={
                                                            Position.Right
                                                        }
                                                        className="h-[10px] w-[10px] rounded-full !bg-violet-200 transition-all duration-150 hover:scale-110"
                                                        title={`Condición: ${h.label}`}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 🟣 Handles base */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                id="in"
                                className="!bg-violet-400"
                            />
                            <Handle
                                type="source"
                                position={sourcePosition}
                                id="onTrue"
                                className="!bg-violet-400"
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip simplificado */}
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

export default SwitchConditionNode
