// src\components\nodes\MenuNode.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ListTree } from 'lucide-react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

type VariantType = 'quick_reply' | 'list'

interface ColorStyle {
    bg: string
    border: string
    optionBg: string
    optionHover: string
    handle: string
}

const colorMap: Record<VariantType, ColorStyle> = {
    quick_reply: {
        bg: 'bg-violet-600',
        border: 'border-violet-800',
        optionBg: 'bg-violet-700/40',
        optionHover: 'hover:bg-violet-700/60',
        handle: '!bg-violet-300',
    },
    list: {
        bg: 'bg-sky-600',
        border: 'border-sky-800',
        optionBg: 'bg-sky-700/40',
        optionHover: 'hover:bg-sky-700/60',
        handle: '!bg-sky-200',
    },
}

/**
 * 🟣 MenuNode
 * ------------------------------------------------------
 * - Renderiza el nodo visualmente
 * - Lee datos desde useVariantTypeStore (variantType, options, conditions)
 * - La creación/eliminación de edges dinámicos se maneja globalmente
 *   por el hook useVariantFlowSync.
 */
const MenuNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getVariantType, getVariantOptions } = useVariantTypeStore()

    // 🧠 Fuente de verdad: Zustand store
    const variantType = getVariantType(id)
    const options = getVariantOptions(id)

    // 🎨 Estilo dinámico por tipo
    const style = colorMap[variantType as VariantType]

    // 🎯 Posición dinámica del handle de entrada
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    // ⚙️ Estilo base de handles
    const handleBase: React.CSSProperties = {
        width: 10,
        height: 10,
        borderRadius: '50%',
        zIndex: 15,
        pointerEvents: 'auto',
        position: 'absolute',
    }

    /* --------------------------------------------------------
       🎨 Render visual del nodo
    -------------------------------------------------------- */
    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
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
                    setSelectedNode({ id, type: 'menuNode', data })
                }}
                data-id={id}
                className={`relative w-full max-w-[240px] cursor-pointer overflow-visible rounded-xl border ${style.border} ${style.bg} text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🔹 Encabezado */}
                <div className="px-3 pt-1.5 pb-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <ListTree className="h-4 w-4" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label ||
                                (variantType === 'list'
                                    ? 'Menú Secundario'
                                    : 'Menú Principal')}
                        </span>
                    </div>
                    {data?.object?.variable && (
                        <p className="mt-0.5 font-mono text-[11px] break-words opacity-90">
                            Var: {data.object.variable}
                        </p>
                    )}
                </div>

                {/* 📨 Cuerpo del mensaje (solo list muestra body) */}
                {data?.object?.interactive?.body && (
                    <div className="mx-3 my-1 rounded-md border border-white/30 bg-black/10 px-2.5 py-1 text-[11px] text-white/90 italic">
                        {decodeURIComponent(data.object.interactive.body || '')}
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
                    className={`h-[10px] w-[10px] rounded-full ${style.handle} shadow-sm`}
                />

                {/* 🔸 Opciones dinámicas (handles por cada opción) */}
                <div className="mt-0.5 flex flex-col">
                    {options.map((opt: any, i: number) => (
                        <div
                            key={`${id}-opt-${i}`}
                            className={`relative flex items-center justify-between border-t border-white/20 ${style.optionBg} px-3 py-[6px] text-[12px] ${style.optionHover}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-bold">
                                    {opt.postbackText ?? i}:
                                </span>
                                <span>
                                    {decodeURIComponent(opt.title || '')}
                                </span>
                            </div>

                            {/* 🎯 Handle visual de salida */}
                            <Handle
                                id={`option-${i}`}
                                data-handleid={`option-${i}`}
                                type="source"
                                position={Position.Right}
                                style={{
                                    top: '50%',
                                    right: '-5px',
                                    transform: 'translateY(-50%)',
                                }}
                                className={`h-[10px] w-[10px] rounded-full ${style.handle} shadow-sm`}
                            />
                        </div>
                    ))}
                </div>

                {/* 🟢🟡🔴 Handles inferiores */}
                {[
                    { id: 'onTrue', color: '#16a34a', left: '25%' },
                    { id: 'onFalse', color: '#f59e0b', left: '50%' },
                    { id: 'onError', color: '#dc2626', left: '75%' },
                ].map((h) => (
                    <Handle
                        key={h.id}
                        type="source"
                        id={h.id}
                        position={Position.Bottom}
                        title={h.id}
                        style={{
                            ...handleBase,
                            background: h.color,
                            bottom: '-6px',
                            left: h.left,
                        }}
                    />
                ))}
            </Card>
        </motion.div>
    )
}

export default MenuNode
