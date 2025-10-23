// src\components\nodes\MenuNode.tsx

'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { ListTree } from 'lucide-react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'

/* ------------------------------------------------------------
   🎨 Tipos y mapa de colores
------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   🟣 MenuNode — Nodo principal interactivo
------------------------------------------------------------ */
const MenuNode: React.FC<NodeProps> = ({ id, data }) => {
    const { setSelectedNode } = useNodeConfigStore()
    const { createEdge, edges } = useFlowStore()
    const { orientation } = useFlowOrientationStore()

    // 🧠 Tipo de variante según tipo de interacción
    const variantType: VariantType =
        data?.object?.interactive?.type === 'list' ? 'list' : 'quick_reply'

    const style = colorMap[variantType]

    // 🔢 Obtener opciones seguras
    const options = useMemo(() => {
        const opts =
            data?.object?.interactive?.options ??
            data?.object?.interactive?.items?.[0]?.options ??
            []
        return Array.isArray(opts) ? opts : []
    }, [data])

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const handleBase: React.CSSProperties = {
        width: 10,
        height: 10,
        borderRadius: '50%',
        zIndex: 15,
        pointerEvents: 'auto',
        position: 'absolute',
    }

    /* --------------------------------------------------------
       🔗 Sincronización visual automática de edges
       - Evita duplicar conexiones preexistentes
       - Crea edges solo si el handle no existe aún
    -------------------------------------------------------- */
    const creatingRef = useRef(false)

    useEffect(() => {
        if (creatingRef.current) return
        creatingRef.current = true

        const conditions = data?.object?.conditions ?? {}
        if (!conditions || typeof conditions !== 'object') return

        let added = false
        Object.entries(conditions).forEach(([key, targetId]) => {
            const handleId = `option-${key}`
            if (!targetId || typeof targetId !== 'string') return

            const alreadyExists = edges.some(
                (e) =>
                    e.source === id &&
                    e.target === targetId &&
                    e.sourceHandle === handleId
            )

            if (!alreadyExists) {
                createEdge(id, targetId, handleId)
                added = true
            }
        })

        if (added) {
            setTimeout(() => {
                creatingRef.current = false
            }, 100)
        } else {
            creatingRef.current = false
        }
    }, [data?.object?.conditions, edges, id, createEdge])

    /* --------------------------------------------------------
       🧩 Renderizado del nodo visual
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
                className={`relative w-full max-w-[240px] cursor-pointer overflow-visible rounded-xl border ${style.border} ${style.bg} text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🔹 Encabezado */}
                <div className="px-3 pt-1.5 pb-1 text-center">
                    <div className="flex items-center justify-center gap-2 leading-none">
                        <ListTree className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-semibold break-words">
                            {data?.label || 'Menú Principal'}
                        </span>
                    </div>
                    {data?.object?.variable && (
                        <p className="mt-0.5 font-mono text-[11px] break-words opacity-90">
                            Var: {data.object.variable}
                        </p>
                    )}
                </div>

                {/* 📨 Mensaje visible */}
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

                {/* 🔸 Opciones dinámicas */}
                <div className="mt-0.5 flex flex-col">
                    {options.map(
                        (
                            opt: { postbackText?: string; title?: string },
                            i: number
                        ) => (
                            <div
                                key={opt.postbackText ?? i}
                                className={`relative flex items-center justify-between border-t border-white/20 ${style.optionBg} px-3 py-[6px] text-[12px] transition-colors ${style.optionHover}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">
                                        {opt.postbackText ?? i + 1}:
                                    </span>
                                    <span className="truncate">
                                        {decodeURIComponent(opt.title || '')}
                                    </span>
                                </div>
                                {/* ✅ Handle corregido: usa índice, no postbackText */}
                                <Handle
                                    id={`option-${i}`}
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
                        )
                    )}
                </div>

                {/* 🟢🟡🔴 Handles de control (onTrue / onFalse / onError) */}
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
