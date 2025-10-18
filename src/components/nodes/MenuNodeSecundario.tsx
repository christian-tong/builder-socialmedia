// src\components\nodes\MenuNodeSecundario.tsx

'use client'

import React from 'react'
import { Handle, Position } from 'reactflow'
import { ListChecks } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🔵 MenuNodeSecundario
 * -------------------------------------------------------
 * - Variante azul del Menu Principal.
 * - Representa menús secundarios (GetDataCompleteXXXX).
 * - Handles perfectamente alineados al borde.
 */
const MenuNodeSecundario = ({ id, data }: any) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const options = data.options || []

    return (
        <Card
            onClick={(e) => {
                e.stopPropagation()
                setSelectedNode({ id, type: 'menuNodeSecundario', data })
            }}
            data-id={id}
            className="relative cursor-pointer overflow-visible rounded-xl border border-sky-800 bg-sky-600 text-white shadow-md transition-transform duration-200 select-none hover:scale-[1.01] dark:bg-sky-700"
        >
            {/* 🔹 Encabezado */}
            <div className="px-3 pt-1.5 pb-1">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                        {data.label || 'Menú Secundario'}
                    </span>
                </div>
                {data.variable && (
                    <p className="mt-0.5 font-mono text-[11px] opacity-90">
                        Var: {data.variable}
                    </p>
                )}
            </div>

            {/* 📨 Mensaje (si existe) */}
            {data.message && (
                <div className="mx-3 my-1 rounded-md border border-sky-500/40 bg-sky-800/40 px-2.5 py-1 text-[11px] text-sky-100 italic">
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
                className="h-[10px] w-[10px] rounded-full !bg-sky-300 shadow-sm"
            />

            {/* 🔸 Opciones */}
            <div className="mt-0.5 flex flex-col">
                {options.map((opt: any, index: number) => (
                    <div
                        key={index}
                        className="relative flex items-center justify-between border-t border-sky-700/50 bg-sky-700/40 px-3 py-[6px] text-[12px] transition-colors hover:bg-sky-700/60"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{index + 1}:</span>
                            <span className="truncate">
                                {opt.title || `Opción ${index + 1}`}
                            </span>
                        </div>

                        {/* 🔹 Handle al borde */}
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
        </Card>
    )
}

export default MenuNodeSecundario
