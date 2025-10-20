// src\components\nodes\MenuNodePrincipal.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { ListTree } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 💜 MenuNodePrincipal — versión extendida con control de flujo
 * -------------------------------------------------------------
 * - Ahora incluye 3 salidas de control fijas: 🟢 onTrue | 🟡 onFalse | 🔴 onError
 * - Cada handle tiene posición independiente.
 */
const MenuNodePrincipal = ({ id, data }: any) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const options = data.options || []

    const handleBase: React.CSSProperties = {
        width: 10,
        height: 10,
        borderRadius: '50%',
        zIndex: 15,
        pointerEvents: 'auto',
        position: 'absolute',
    }

    return (
        <Card
            onClick={(e) => {
                e.stopPropagation()
                setSelectedNode({ id, type: 'menuNodePrincipal', data })
            }}
            data-id={id}
            className="relative cursor-pointer overflow-visible rounded-xl border border-violet-800 bg-violet-600 text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.01] dark:bg-violet-700"
        >
            {/* 🔹 Encabezado */}
            <div className="px-3 pt-1.5 pb-1">
                <div className="flex items-center gap-2 leading-none">
                    <ListTree className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                        {data.label || 'Menú Principal'}
                    </span>
                </div>
                {data.variable && (
                    <p className="mt-0.5 font-mono text-[11px] opacity-90">
                        Var: {data.variable}
                    </p>
                )}
            </div>

            {/* 📨 Mensaje (opcional) */}
            {data.message && (
                <div className="mx-3 my-1 rounded-md border border-violet-500/40 bg-violet-800/40 px-2.5 py-1 text-[11px] text-violet-100 italic">
                    {data.message}
                </div>
            )}

            {/* 🎯 Handle de entrada */}
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

            {/* 🔸 Opciones (costado derecho) */}
            <div className="mt-0.5 flex flex-col">
                {options.map((opt: any, index: number) => (
                    <div
                        key={index}
                        className="relative flex items-center justify-between border-t border-violet-700/50 bg-violet-700/40 px-3 py-[6px] text-[12px] transition-colors hover:bg-violet-700/60"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{index + 1}:</span>
                            <span className="truncate">
                                {opt.title || `Opción ${index + 1}`}
                            </span>
                        </div>

                        {/* Handle de salida para cada opción */}
                        <Handle
                            id={`option-${index}`}
                            type="source"
                            position={Position.Right}
                            style={{
                                top: '50%',
                                right: '-5px',
                                transform: 'translateY(-50%)',
                            }}
                            className="h-[10px] w-[10px] rounded-full !bg-white shadow-sm"
                        />
                    </div>
                ))}
            </div>

            {/* 🟢🟡🔴 Handles de control (fijos, separados horizontalmente) */}
            <Handle
                type="source"
                id="onTrue"
                position={Position.Bottom}
                title="onTrue"
                style={{
                    ...handleBase,
                    background: '#16a34a',
                    bottom: '-6px',
                    left: '25%',
                }}
            />
            <Handle
                type="source"
                id="onFalse"
                position={Position.Bottom}
                title="onFalse"
                style={{
                    ...handleBase,
                    background: '#f59e0b',
                    bottom: '-6px',
                    left: '50%',
                }}
            />
            <Handle
                type="source"
                id="onError"
                position={Position.Bottom}
                title="onError"
                style={{
                    ...handleBase,
                    background: '#dc2626',
                    bottom: '-6px',
                    left: '75%',
                }}
            />
        </Card>
    )
}

export default MenuNodePrincipal
