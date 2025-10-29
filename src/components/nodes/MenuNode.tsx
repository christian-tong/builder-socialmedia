'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import type {
    QuickReplyInteractive,
    ListInteractive,
    ListOption,
} from '@/types/getDataComplete'

/* ------------------------------------------------------------
 🧩 Subcomponente: QuickReplyPreview
------------------------------------------------------------ */
function QuickReplyPreview({
    interactive,
    handleColor,
}: {
    interactive: QuickReplyInteractive
    handleColor: string
}) {
    const options = interactive.options || []

    return (
        <div className="relative mt-2 space-y-1 text-xs">
            {options.map((opt, idx) => (
                <div
                    key={idx}
                    className="relative flex items-center justify-between rounded-md bg-purple-800/40 px-2 py-1 text-gray-100"
                >
                    <div className="flex items-center gap-2 pr-6">
                        <span className="text-[10px] opacity-70">
                            #{opt.postbackText}
                        </span>
                        <span className="truncate">
                            {opt.title || `(Opción ${opt.postbackText})`}
                        </span>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={opt.postbackText}
                        className={`absolute !h-2.5 !w-2.5 ${handleColor}`}
                        style={{
                            top: '50%',
                            right: '-6px',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </div>
            ))}
        </div>
    )
}

/* ------------------------------------------------------------
 🧩 Subcomponente: ListPreview
------------------------------------------------------------ */
function ListPreview({
    interactive,
    handleColor,
}: {
    interactive: ListInteractive
    handleColor: string
}) {
    const items = interactive.items || []

    return (
        <div className="relative mt-1 space-y-1 text-xs">
            {items.map((item, iIdx) => (
                <div key={iIdx}>
                    {/* 🏷️ Título del grupo */}
                    <div className="mb-0.5 truncate text-[10px] font-semibold text-blue-300/80">
                        {decodeURIComponent(item.title || `Grupo ${iIdx + 1}`)}
                    </div>

                    {item.options.map((opt: ListOption, oIdx: number) => (
                        <div
                            key={oIdx}
                            className="relative flex items-center justify-between rounded-md bg-blue-800/40 px-2 py-1 text-gray-100"
                        >
                            <div className="flex flex-col gap-[1px] pr-6">
                                <span className="flex items-center gap-2 text-[10px]">
                                    <span className="opacity-70">
                                        #{opt.postbackText}
                                    </span>
                                    {decodeURIComponent(opt.title || '')}
                                </span>
                                {opt.description && (
                                    <span className="truncate text-[9px] italic opacity-60">
                                        {decodeURIComponent(opt.description)}
                                    </span>
                                )}
                            </div>

                            {/* 🎯 Handle de conexión */}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={opt.postbackText}
                                className={`absolute !h-2.5 !w-2.5 ${handleColor}`}
                                style={{
                                    top: '50%',
                                    right: '-6px',
                                    transform: 'translateY(-50%)',
                                }}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

/* ------------------------------------------------------------
 💬 Componente principal: MenuNode
------------------------------------------------------------ */
export function MenuNode({ id, data }: { id: string; data: any }) {
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGetDataCompleteBaseStore()
    const { setSelectedNode } = useNodeConfigStore()

    const nodeData = getNodeData(id)
    const interactive = nodeData?.interactive as
        | QuickReplyInteractive
        | ListInteractive
        | undefined

    const type = interactive?.type || 'quick_reply'
    const isList = type === 'list'

    // 🎨 Colores base
    const colorBase = isList ? 'blue' : 'purple'
    const bgClass = isList
        ? 'bg-blue-950 border-blue-600'
        : 'bg-purple-950 border-purple-600'
    const handleColor = '!bg-emerald-400'

    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left

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
                    setSelectedNode({ id, type: 'menuNode', data })
                }}
                data-id={id}
                className={`relative w-[260px] cursor-pointer rounded-xl border select-none ${bgClass} p-3 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🏷️ Encabezado */}
                <div className="flex flex-col border-b border-white/10 pb-1">
                    <span className="text-xs tracking-wide text-white/70 uppercase">
                        {isList ? 'List' : 'Quick Reply'}
                    </span>
                    <span className="truncate text-sm font-semibold">
                        {nodeData.alias || nodeData.variable || id}
                    </span>
                </div>

                {/* 💬 Contenido principal */}
                {interactive &&
                    type === 'quick_reply' &&
                    'content' in interactive && (
                        <div className="mt-1 line-clamp-3 text-[11px] whitespace-pre-wrap text-gray-200/90 italic">
                            {interactive.content?.text}
                        </div>
                    )}

                {interactive &&
                    isList &&
                    (interactive as ListInteractive)?.body && (
                        <div className="mt-1 line-clamp-3 text-[11px] whitespace-pre-wrap text-gray-200/90 italic">
                            {decodeURIComponent(
                                (interactive as ListInteractive).body || ''
                            )}
                        </div>
                    )}

                {/* 🧩 Opciones */}
                {!isList && interactive && 'options' in interactive && (
                    <QuickReplyPreview
                        interactive={interactive as QuickReplyInteractive}
                        handleColor={handleColor}
                    />
                )}

                {isList && (
                    <ListPreview
                        interactive={interactive as ListInteractive}
                        handleColor={handleColor}
                    />
                )}

                {/* 🎯 Handle de entrada principal */}
                <Handle
                    type="target"
                    position={handleTarget}
                    id="in"
                    className={`!bg-${colorBase}-400`}
                />

                {/* 🟢🔴🟠 Handles globales */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onTrue"
                    className="!bg-green-500"
                    style={{ left: '30%' }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onFalse"
                    className="!bg-red-500"
                    style={{ left: '50%' }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="onError"
                    className="!bg-orange-500"
                    style={{ left: '70%' }}
                />
            </Card>
        </motion.div>
    )
}
