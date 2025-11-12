// src/components/nodes/MenuNode.tsx

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'
import {
    QuickReplyInteractive,
    ListInteractive,
    GetDataInteractive,
    SimpleTextInteractive,
    ListOption,
    GetDataCompleteObject,
} from '@/types/getDataComplete'
import { MessageSquare, ListTree, FileText, StickyNote } from 'lucide-react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'

/* ---------- Helpers de tipado ---------- */
type OptionDisplay = {
    postbackText: string
    title?: string
    description?: string
}

function hasOptions(
    i:
        | QuickReplyInteractive
        | ListInteractive
        | GetDataInteractive
        | SimpleTextInteractive
        | undefined
): i is QuickReplyInteractive & { options: OptionDisplay[] } {
    return !!i && Array.isArray((i as any).options)
}

function hasItems(
    i:
        | QuickReplyInteractive
        | ListInteractive
        | GetDataInteractive
        | SimpleTextInteractive
        | undefined
): i is ListInteractive & {
    items: Array<{ title?: string; options: OptionDisplay[] }>
} {
    return !!i && Array.isArray((i as any).items)
}

/* 🟪 Configuración base por tipo */
const CONFIG_MAP = {
    quick_reply: {
        color: 'purple',
        bg: 'bg-purple-950 border-purple-600',
        icon: <MessageSquare size={14} className="text-purple-400" />,
        label: 'Quick Reply',
        gradient: 'bg-gradient-to-b from-purple-700 to-purple-600',
        handleColor: '!bg-purple-300',
    },
    list: {
        color: 'blue',
        bg: 'bg-blue-950 border-blue-600',
        icon: <ListTree size={14} className="text-blue-400" />,
        label: 'List',
        gradient: 'bg-gradient-to-b from-blue-700 to-blue-600',
        handleColor: '!bg-blue-300',
    },
    GETDATA: {
        color: 'amber',
        bg: 'bg-amber-950 border-amber-600',
        icon: <FileText size={14} className="text-amber-400" />,
        label: 'GetData',
        gradient: 'bg-gradient-to-b from-amber-700 to-amber-600',
        handleColor: '!bg-amber-300',
    },
    SIMPLETEXT: {
        color: 'emerald',
        bg: 'bg-emerald-950 border-emerald-600',
        icon: <StickyNote size={14} className="text-emerald-400" />,
        label: 'SimpleText',
        gradient: 'bg-gradient-to-b from-emerald-700 to-emerald-600',
        handleColor: '!bg-emerald-300',
    },
} as const

/* 🧩 MenuNode Principal */
const MenuNode: React.FC<NodeProps> = ({ id, data }) => {
    const { orientation } = useFlowOrientationStore()
    const { simplifiedView } = useSettingsStore()
    const { getNodeData } = useGetDataCompleteBaseStore()
    const { setSelectedNode } = useNodeConfigStore()

    const nodeData = getNodeData(id) as GetDataCompleteObject
    const interactive = nodeData?.interactive as
        | QuickReplyInteractive
        | ListInteractive
        | GetDataInteractive
        | SimpleTextInteractive
        | undefined

    const typeRaw =
        interactive?.type ||
        nodeData?.type ||
        (nodeData?.setvariables ? 'SIMPLETEXT' : 'quick_reply')

    const normalizedType = (() => {
        switch (typeRaw?.toUpperCase()) {
            case 'GETDATA':
                return 'GETDATA'
            case 'SIMPLETEXT':
            case 'SIMPLE_TEXT':
                return 'SIMPLETEXT'
            case 'LIST':
                return 'list'
            default:
                return 'quick_reply'
        }
    })()

    const config = CONFIG_MAP[normalizedType]
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const tooltipDescription =
        data.description?.trim() ||
        nodeData?.description?.trim() ||
        nodeData?.alias?.trim() ||
        nodeData?.variable?.trim() ||
        'Menú interactivo'

    /* 🧠 Determinar opciones visibles (con type guards) */
    const options = useMemo<OptionDisplay[]>(() => {
        if (hasOptions(interactive)) return interactive.options
        if (hasItems(interactive))
            return interactive.items.flatMap((g) => g.options || [])
        if (nodeData?.setvariables)
            return Object.entries(nodeData.setvariables).map(([k, v]) => ({
                postbackText: k,
                title: decodeURIComponent(v || ''),
            }))
        return []
    }, [interactive, nodeData])

    /* 🧩 Handles adicionales inferiores */
    const baseHandles = [
        { id: 'onTrue', color: '!bg-green-500' },
        { id: 'onFalse', color: '!bg-red-500' },
        { id: 'onError', color: '!bg-orange-500' },
    ]
    const timeoutHandles =
        normalizedType === 'GETDATA' || normalizedType === 'SIMPLETEXT'
            ? [
                  { id: 'onTimeOut', color: '!bg-sky-500' },
                  { id: 'onTimeOutError', color: '!bg-violet-500' },
              ]
            : []
    const allHandles = [...baseHandles, ...timeoutHandles]

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({ id, type: 'menuNode', data })
                            }}
                            data-id={id}
                            className={`cursor-pointer border ${config.bg} text-white shadow-md transition-all select-none hover:scale-[1.03] hover:shadow-lg ${
                                simplifiedView
                                    ? `flex min-w-[70px] flex-col items-center justify-start gap-1 rounded-2xl ${config.gradient} p-1`
                                    : 'w-[320px] rounded-xl p-3'
                            }`}
                        >
                            {simplifiedView ? (
                                <>
                                    {/* 🧩 Vista simplificada */}
                                    <div className="flex flex-col items-center justify-center border-b-2 border-white/20">
                                        {config.icon}
                                    </div>
                                    <div className="flex w-full flex-col items-center gap-[2px]">
                                        {options.length === 0 ? (
                                            <div className="text-[8px] italic opacity-70">
                                                Sin opciones
                                            </div>
                                        ) : (
                                            options.map((opt, i) => {
                                                const isCond =
                                                    normalizedType ===
                                                        'GETDATA' ||
                                                    normalizedType ===
                                                        'SIMPLETEXT'
                                                const handleId = isCond
                                                    ? `cond_${opt.postbackText}`
                                                    : `option_${opt.postbackText}`
                                                return (
                                                    <div
                                                        key={`${opt.postbackText}-${i}`}
                                                        className="relative flex w-full items-center justify-center py-[1px]"
                                                    >
                                                        <span className="truncate text-[8px] font-medium tracking-wide">
                                                            #{opt.postbackText}
                                                        </span>
                                                        <Handle
                                                            id={handleId}
                                                            type="source"
                                                            position={
                                                                Position.Right
                                                            }
                                                            className={`absolute right-[-3px] h-[6px] w-[6px] rounded-full ${config.handleColor}`}
                                                            title={`Opción: ${opt.title || opt.postbackText}`}
                                                        />
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 🧩 Vista completa original */}
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                                        <div className="flex items-center gap-2 text-xs tracking-wide text-white/70 uppercase">
                                            {config.icon}
                                            <span>{config.label}</span>
                                        </div>
                                        <div className="flex max-w-[160px] flex-col items-end text-right">
                                            <div className="text-center text-[10px] text-white/60">
                                                <span className="rounded-md border border-white/10 bg-white/10 px-2 py-[1px]">
                                                    {id}
                                                </span>
                                            </div>
                                            <span
                                                className="mt-[1px] max-w-full overflow-hidden text-[11px] font-medium opacity-80"
                                                title={
                                                    nodeData.alias ||
                                                    nodeData.variable ||
                                                    id
                                                }
                                            >
                                                {nodeData.alias ||
                                                    nodeData.variable ||
                                                    id}
                                            </span>
                                        </div>
                                    </div>

                                    {normalizedType === 'quick_reply' && (
                                        <QuickReplyPreview
                                            interactive={
                                                interactive as QuickReplyInteractive
                                            }
                                            handleColor={config.handleColor}
                                        />
                                    )}
                                    {normalizedType === 'list' && (
                                        <ListPreview
                                            interactive={
                                                interactive as ListInteractive
                                            }
                                            handleColor={config.handleColor}
                                        />
                                    )}
                                    {normalizedType === 'GETDATA' && (
                                        <GetDataPreview object={nodeData} />
                                    )}
                                    {normalizedType === 'SIMPLETEXT' && (
                                        <SimpleTextPreview object={nodeData} />
                                    )}
                                </>
                            )}

                            {/* 🎯 Handle Target */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                className={`!bg-${config.color}-400`}
                            />

                            {/* 🔹 Handles inferiores visibles */}
                            {allHandles.map((h, i) => (
                                <Handle
                                    key={h.id}
                                    type="source"
                                    position={Position.Bottom}
                                    id={h.id}
                                    className={h.color}
                                    style={{
                                        left: `${(100 / (allHandles.length + 1)) * (i + 1)}%`,
                                    }}
                                />
                            ))}

                            {/* 🕒 Handles invisibles permanentes (garantizan compatibilidad ReactFlow) */}
                            <Handle
                                id="onTimeOut"
                                type="source"
                                position={Position.Bottom}
                                className="pointer-events-none absolute opacity-0"
                                style={{ left: '40%' }}
                            />
                            <Handle
                                id="onTimeOutError"
                                type="source"
                                position={Position.Bottom}
                                className="pointer-events-none absolute opacity-0"
                                style={{ left: '60%' }}
                            />
                        </Card>
                    </TooltipTrigger>

                    {simplifiedView && (
                        <TooltipContent
                            side="top"
                            className="max-w-[220px] text-center text-xs font-medium"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-70">
                                    ID: {id}
                                </span>
                                <span className="break-words whitespace-normal">
                                    {tooltipDescription}
                                </span>
                                <span className="text-[10px] opacity-60">
                                    Variante: {config.label}
                                </span>
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    )
}

/* ---------- Subcomponentes Preview (sin cambios) ---------- */
function QuickReplyPreview({ interactive, handleColor }: any) {
    const options = interactive.options || []
    return (
        <div className="relative mt-2 space-y-1 text-xs">
            {options.map((opt: any, idx: number) => {
                const handleId = `option_${opt.postbackText}`
                return (
                    <div
                        key={idx}
                        className="relative flex items-center justify-between rounded-md bg-purple-800/40 px-2 py-1 text-gray-100"
                    >
                        <div className="flex items-center gap-2 pr-6">
                            <span className="text-[10px] opacity-70">
                                #{opt.postbackText}
                            </span>
                            <span className="truncate">
                                {decodeURIComponent(
                                    opt.title || `(Opción ${opt.postbackText})`
                                )}
                            </span>
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={handleId}
                            className={`absolute !h-2.5 !w-2.5 ${handleColor}`}
                            style={{
                                top: '50%',
                                right: '-6px',
                                transform: 'translateY(-50%)',
                            }}
                        />
                    </div>
                )
            })}
        </div>
    )
}

function ListPreview({ interactive, handleColor }: any) {
    const items = interactive.items || []
    return (
        <div className="relative mt-1 space-y-1 text-xs">
            {items.map((item: any, iIdx: number) => (
                <div key={iIdx}>
                    <div className="mb-0.5 truncate text-[10px] font-semibold text-blue-300/80">
                        {decodeURIComponent(item.title || `Grupo ${iIdx + 1}`)}
                    </div>
                    {item.options.map((opt: ListOption, oIdx: number) => {
                        const handleId = `option_${opt.postbackText}`
                        return (
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
                                            {decodeURIComponent(
                                                opt.description
                                            )}
                                        </span>
                                    )}
                                </div>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={handleId}
                                    className={`absolute !h-2.5 !w-2.5 ${handleColor}`}
                                    style={{
                                        top: '50%',
                                        right: '-6px',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

function GetDataPreview({ object }: any) {
    const { setvariables, prompt } = object || {}
    const entries = Object.entries(setvariables || {})
    return (
        <div className="mt-2 space-y-1 text-xs">
            {prompt && (
                <div className="rounded-md bg-amber-900/40 p-2 text-[11px] text-amber-100/80 italic">
                    {decodeURIComponent(prompt || 'Sin prompt definido')}
                </div>
            )}
            {entries.map(([key, val]) => (
                <div
                    key={key}
                    className="relative flex items-center justify-between rounded-md bg-amber-800/40 px-2 py-1 text-gray-100"
                >
                    <div className="flex items-center gap-2 pr-6">
                        <span className="text-[10px] opacity-70">#{key}</span>
                        <span className="truncate">
                            {decodeURIComponent(val || '')}
                        </span>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`cond_${key}`}
                        className="absolute !h-2.5 !w-2.5 !bg-amber-400"
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

function SimpleTextPreview({ object }: any) {
    const { prompt, description, setvariables } = object || {}
    const entries = Object.entries(setvariables || {})
    return (
        <div className="mt-2 space-y-1 text-xs">
            {prompt && (
                <div className="rounded-md bg-emerald-900/40 p-2 text-[11px] text-emerald-100/80 italic">
                    {decodeURIComponent(prompt || 'Sin prompt definido')}
                </div>
            )}
            {description && (
                <div className="text-[10px] text-emerald-200/70 italic">
                    {decodeURIComponent(description || '')}
                </div>
            )}
            {entries.map(([key, val]) => (
                <div
                    key={key}
                    className="relative flex items-center justify-between rounded-md bg-emerald-800/40 px-2 py-1 text-gray-100"
                >
                    <div className="flex items-center gap-2 pr-6">
                        <span className="text-[10px] opacity-70">#{key}</span>
                        <span className="truncate">
                            {decodeURIComponent(val || '')}
                        </span>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={`cond_${key}`}
                        className="absolute !h-2.5 !w-2.5 !bg-emerald-400"
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

export default MenuNode
