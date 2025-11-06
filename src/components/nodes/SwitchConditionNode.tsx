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

/**
 * 🧩 SwitchConditionNode (v3.6 — con badge dinámico de modo)
 * --------------------------------------------------------------------
 * ✅ Muestra modo de coincidencia (estricto o flexible)
 * ✅ Mantiene colores originales violeta
 * ✅ Badge dinámico azul/violeta claro
 */
const SwitchConditionNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { byId, initNode } = useSwitchConditionStore()

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
                    setSelectedNode({ id, type: 'switchConditionNode', data })
                }}
                data-id={id}
                className="relative w-[280px] cursor-pointer overflow-visible rounded-xl border border-violet-800 bg-violet-600 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🏷️ Encabezado */}
                <div className="flex items-center justify-between border-b border-white/20 px-3 pt-1.5 pb-1">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label || 'Condición por Variable'}
                        </span>
                    </div>

                    {/* 🔹 Badge dinámico de modo */}
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
                            {cfg.alias ? `(${cfg.alias})` : ''}
                        </span>
                    </p>
                )}

                {/* 🎯 Handle de entrada */}
                <Handle
                    type="target"
                    position={targetPosition}
                    id="in"
                    className="h-[10px] w-[10px] rounded-full !bg-violet-300 shadow-sm"
                    style={{
                        top: orientation === 'vertical' ? '-5px' : '50%',
                        left: orientation === 'vertical' ? '50%' : '-6px',
                        transform:
                            orientation === 'vertical'
                                ? 'translateX(-50%)'
                                : 'translateY(-50%)',
                    }}
                />

                {/* 🟢 Handle OnTrue */}
                <Handle
                    type="source"
                    id="onTrue"
                    position={Position.Bottom}
                    className="h-[10px] w-[10px] rounded-full !bg-green-400 hover:scale-110"
                    title="onTrue"
                />

                {/* 🔀 Handles dinámicos */}
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
                                    position={Position.Right}
                                    className="h-[10px] w-[10px] rounded-full !bg-violet-200 transition-all duration-150 hover:scale-110"
                                    title={`Condición: ${h.label}`}
                                    style={{
                                        top: '50%',
                                        right: '-6px',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

export default SwitchConditionNode
