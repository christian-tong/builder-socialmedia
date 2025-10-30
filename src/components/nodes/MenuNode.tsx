// src\components\nodes\MenuNode.tsx

'use client'

import React, { JSX } from 'react'
import { motion } from 'framer-motion'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    QuickReplyInteractive,
    ListInteractive,
    GetDataInteractive,
    SimpleTextInteractive,
    ListOption,
} from '@/types/getDataComplete'
import { MessageSquare, ListTree, FileText, StickyNote } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* 🟣 Subcomponente: QuickReplyPreview                                         */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* 🔵 Subcomponente: ListPreview                                              */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* 🧾 Subcomponente: GetDataPreview                                           */
/* -------------------------------------------------------------------------- */
function GetDataPreview({ interactive }: { interactive: GetDataInteractive }) {
    return (
        <div className="mt-2 text-[11px] text-amber-200/90 italic">
            {decodeURIComponent(interactive.prompt || 'Sin prompt definido')}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* 🗒️ Subcomponente: SimpleTextPreview                                        */
/* -------------------------------------------------------------------------- */
function SimpleTextPreview({
    interactive,
}: {
    interactive: SimpleTextInteractive
}) {
    return (
        <div className="mt-2 text-[11px] text-emerald-100/90 italic">
            {decodeURIComponent(interactive.prompt || 'Texto vacío')}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/* 💬 Componente principal: MenuNode                                          */
/* -------------------------------------------------------------------------- */
export function MenuNode({ id, data }: { id: string; data: any }) {
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGetDataCompleteBaseStore()
    const { setSelectedNode } = useNodeConfigStore()

    const nodeData = getNodeData(id)
    const interactive = nodeData?.interactive as
        | QuickReplyInteractive
        | ListInteractive
        | GetDataInteractive
        | SimpleTextInteractive
        | undefined

    const type = interactive?.type || 'quick_reply'

    // 🧠 Tipo de configuración visual
    interface NodeVisualConfig {
        color: string
        bg: string
        icon: JSX.Element
        label: string
    }

    // 🎨 Config visual según tipo
    const CONFIG_MAP: Record<
        'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT',
        NodeVisualConfig
    > = {
        quick_reply: {
            color: 'purple',
            bg: 'bg-purple-950 border-purple-600',
            icon: <MessageSquare size={14} className="text-purple-400" />,
            label: 'Quick Reply',
        },
        list: {
            color: 'blue',
            bg: 'bg-blue-950 border-blue-600',
            icon: <ListTree size={14} className="text-blue-400" />,
            label: 'List',
        },
        GETDATA: {
            color: 'amber',
            bg: 'bg-amber-950 border-amber-600',
            icon: <FileText size={14} className="text-amber-400" />,
            label: 'GetData',
        },
        SIMPLETEXT: {
            color: 'emerald',
            bg: 'bg-emerald-950 border-emerald-600',
            icon: <StickyNote size={14} className="text-emerald-400" />,
            label: 'SimpleText',
        },
    }

    // 🧩 Selección segura
    const config: NodeVisualConfig =
        CONFIG_MAP[type as keyof typeof CONFIG_MAP] ?? CONFIG_MAP.quick_reply

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
                className={`relative w-[260px] cursor-pointer rounded-xl border select-none ${config.bg} p-3 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
                {/* 🏷️ Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <div className="flex items-center gap-2 text-xs tracking-wide text-white/70 uppercase">
                        {config.icon}
                        <span>{config.label}</span>
                    </div>
                    <span className="truncate text-[11px] opacity-70">
                        {nodeData.alias || nodeData.variable || id}
                    </span>
                </div>

                {/* 💬 Contenido principal */}
                {interactive?.type === 'quick_reply' && (
                    <QuickReplyPreview
                        interactive={interactive}
                        handleColor="!bg-purple-400"
                    />
                )}

                {interactive?.type === 'list' && (
                    <ListPreview
                        interactive={interactive}
                        handleColor="!bg-blue-400"
                    />
                )}

                {interactive?.type === 'GETDATA' && (
                    <GetDataPreview interactive={interactive} />
                )}

                {interactive?.type === 'SIMPLETEXT' && (
                    <SimpleTextPreview interactive={interactive} />
                )}

                {/* 🎯 Handle de entrada */}
                <Handle
                    type="target"
                    position={handleTarget}
                    id="in"
                    className={`!bg-${config.color}-400`}
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
