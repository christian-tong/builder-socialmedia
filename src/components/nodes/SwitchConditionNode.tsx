// src\components\nodes\SwitchConditionNode.tsx

'use client'

import React, { useEffect } from 'react'
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

const SwitchConditionNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { byId, initNode } = useSwitchConditionStore()

    useEffect(() => {
        initNode(id)
    }, [id, initNode])
    const cfg = byId[id]
    const values = cfg?.values ?? []
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    return (
        <motion.div
            layout
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 70,
                damping: 12,
                mass: 0.8,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'switchConditionNode', data })
                }}
                data-id={id}
                className="relative w-full max-w-[260px] cursor-pointer overflow-visible rounded-xl border border-violet-800 bg-violet-600 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* Header */}
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

                {/* Entrada */}
                <Handle
                    type="target"
                    position={targetPosition}
                    style={{
                        top: orientation === 'vertical' ? '-5px' : '50%',
                        left: orientation === 'vertical' ? '50%' : '-5px',
                        transform:
                            orientation === 'vertical'
                                ? 'translateX(-50%)'
                                : 'translateY(-50%)',
                    }}
                    className="h-[10px] w-[10px] rounded-full !bg-violet-300 shadow-sm"
                />

                {/* Valores dinámicos */}
                <div className="relative mt-0.5 flex flex-col">
                    {values.map((val, i) => {
                        const handleId = getSwitchHandleId(id, val ?? String(i))
                        return (
                            <div
                                key={`${id}-val-${i}`}
                                className="relative flex items-center justify-between border-t border-white/20 bg-violet-700/40 px-3 py-[6px] text-[12px] hover:bg-violet-700/60"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">=</span>
                                    <span className="max-w-[160px] truncate">
                                        {val || <em>(vacío)</em>}
                                    </span>
                                </div>
                                <Handle
                                    id={handleId}
                                    data-handleid={handleId}
                                    type="source"
                                    position={Position.Right}
                                    className="h-[10px] w-[10px] rounded-full !bg-violet-200 transition-all duration-150 hover:scale-110"
                                    title={handleId}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* onTrue/onFalse/onError */}
                {[
                    { id: 'onTrue', color: '#16a34a', left: '33%' },
                    { id: 'onError', color: '#dc2626', left: '66%' },
                ].map((h) => (
                    <Handle
                        key={h.id}
                        type="source"
                        id={h.id}
                        position={Position.Bottom}
                        title={h.id}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            zIndex: 15,
                            pointerEvents: 'auto',
                            position: 'absolute',
                            bottom: '-6px',
                            left: h.left,
                            background: h.color,
                        }}
                    />
                ))}
            </Card>
        </motion.div>
    )
}

export default SwitchConditionNode
