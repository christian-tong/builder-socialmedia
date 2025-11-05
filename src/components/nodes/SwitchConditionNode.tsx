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
 * 🧩 SwitchConditionNode (v3.4 — Target dinámico, opciones fijas)
 * --------------------------------------------------------------------
 * ✅ Handle de entrada cambia (Top/Left) según orientación
 * ✅ Handles de salida (opciones) fijos a la derecha
 * ✅ Compatible con orientación vertical u horizontal
 * ✅ Estilo coherente con VariablesNode y MenuNode
 */
const SwitchConditionNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { byId, initNode } = useSwitchConditionStore()

    // 🔹 Entrada se adapta a orientación
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    // 🧠 Inicializa nodo
    useEffect(() => {
        initNode(id)
    }, [id, initNode])

    const cfg = byId[id]
    const values = cfg?.values ?? ['SI'] // fallback

    const nodeColor = 'violet'
    const bgColor = `bg-${nodeColor}-600`
    const borderColor = `border-${nodeColor}-800`

    // 🔀 Handles dinámicos
    const dynamicHandles = useMemo(
        () =>
            values.map((val, i) => ({
                label: val || `Condición ${i + 1}`,
                id: getSwitchHandleId(id, val || String(i)),
            })),
        [values, id]
    )

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
                className={`relative cursor-pointer overflow-visible rounded-xl border ${borderColor} ${bgColor} text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🏷️ Encabezado */}
                <div className="px-3 pt-1.5 pb-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label || 'Condición por Variable'}
                        </span>
                    </div>
                    {cfg?.variable && (
                        <p className="mt-0.5 font-mono text-[11px] break-words opacity-90">
                            Var: {cfg.variable}{' '}
                            {cfg.mode === 'strict' ? '(=)' : '(~)'}
                        </p>
                    )}
                </div>

                {/* 🎯 Handle de entrada (dinámico según orientación) */}
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

                {/* 🔀 Handles de opciones (fijos a la derecha) */}
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

                                {/* 🎯 Handle fijo lateral derecho */}
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
