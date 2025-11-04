// src\components\shared\NodeConnectionsAccordion.tsx

'use client'

import { ChevronDown, Link2, PlugZap, AlertTriangle } from 'lucide-react'
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface NodeConnectionsAccordionProps {
    title: string
    nodesList: string[]
    accentColor?: string
}

interface NodeSelectionAccordionProps {
    title?: string
    availableNodes: any[]
    hasConnection: (id: string, handleId?: string) => boolean
    toggleConnection: (id: string, checked: boolean, handleId?: string) => void
    accentColor?: string
    handleId?: 'onTrue' | 'onFalse' | 'onError'
}

/* 🎨 Paleta contextual */
const colorMap = {
    onTrue: {
        base: 'text-green-700 dark:text-green-300',
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-300 dark:border-green-800',
        badge: 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300',
        icon: (
            <PlugZap className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        ),
        label: 'trueStep',
    },
    onFalse: {
        base: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-900/10',
        border: 'border-rose-300 dark:border-rose-800',
        badge: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: (
            <Link2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
        ),
        label: 'falseStep',
    },
    onError: {
        base: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        border: 'border-amber-300 dark:border-amber-800',
        badge: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        ),
        label: 'errorStep',
    },
}

/* 📘 NodeConnectionsAccordion – badges inline o colapsables según cantidad */
export function NodeConnectionsAccordion({
    title,
    nodesList,
    accentColor = 'text-gray-700 dark:text-gray-300',
}: NodeConnectionsAccordionProps) {
    const isPrevSection = title.toLowerCase().includes('anterior')
    const showAccordion = isPrevSection && nodesList.length > 2
    const visible = nodesList.slice(0, 2)
    const hidden = nodesList.slice(2)

    return (
        <div className="flex flex-col gap-2">
            {/* 🔹 Caso sin nodos */}
            {nodesList.length === 0 && (
                <>
                    <Label className={`text-sm font-medium ${accentColor}`}>
                        {title}
                    </Label>
                    <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        No hay nodos conectados aún
                    </div>
                </>
            )}

            {/* 🔹 Caso con 1 badge → misma línea que el título */}
            {nodesList.length === 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className={`text-sm font-medium ${accentColor}`}>
                        {title}
                    </Label>
                    <Badge
                        variant="outline"
                        className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    >
                        {nodesList[0]}
                    </Badge>
                </div>
            )}

            {/* 🔹 Caso 2 badges o no-prev → badges inline normales */}
            {!showAccordion && nodesList.length > 1 && (
                <>
                    <Label className={`text-sm font-medium ${accentColor}`}>
                        {title}
                    </Label>
                    <div className="flex flex-wrap gap-1">
                        {nodesList.map((n, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                            >
                                {n}
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            {/* 🔹 Caso prevNodes grandes → vista colapsable */}
            {showAccordion && (
                <>
                    <Label className={`text-sm font-medium ${accentColor}`}>
                        {title}
                    </Label>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="prev-list">
                            <AccordionTrigger className="flex justify-between rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:bg-sky-900/10 dark:text-sky-300">
                                <div className="flex flex-wrap gap-1">
                                    {visible.map((n, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                                        >
                                            {n}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] opacity-70">
                                    {`+${hidden.length} más`}
                                    <ChevronDown className="h-3 w-3" />
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="mt-1 space-y-1 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs dark:border-sky-800 dark:bg-sky-900/10">
                                {hidden.map((n, i) => (
                                    <div
                                        key={i}
                                        className="rounded-md px-2 py-1 transition hover:bg-sky-100 dark:hover:bg-sky-800/30"
                                    >
                                        {n}
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </>
            )}
        </div>
    )
}

/* 🧩 NodeSelectionAccordion (v2.5 – sin cambios funcionales) */
export function NodeSelectionAccordion({
    title = 'Seleccionar conexión',
    availableNodes,
    hasConnection,
    toggleConnection,
    accentColor = 'text-gray-700 dark:text-gray-300',
    handleId = 'onTrue',
}: NodeSelectionAccordionProps) {
    const palette = colorMap[handleId] || colorMap.onTrue

    const currentConnectedId =
        availableNodes.find((n) => hasConnection(n.id, handleId))?.id ?? null

    const handleSelectSingle = (nodeId: string, checked: boolean) => {
        if (checked) {
            if (currentConnectedId && currentConnectedId !== nodeId) {
                toggleConnection(currentConnectedId, false, handleId)
            }
            toggleConnection(nodeId, true, handleId)
        } else {
            toggleConnection(nodeId, false, handleId)
        }
    }

    return (
        <div
            className={`flex flex-col gap-2 rounded-xl border ${palette.border} ${palette.bg} p-3 transition-all hover:shadow-sm dark:border-gray-800`}
        >
            {/* 🔹 Encabezado contextual */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {palette.icon}
                    <Label className={`text-sm font-semibold ${palette.base}`}>
                        {palette.label}
                    </Label>
                </div>
                <Badge
                    variant="outline"
                    className="text-[10px] font-medium text-gray-500 dark:text-gray-400"
                >
                    {availableNodes.length} nodos
                </Badge>
            </div>

            {/* 🪄 Selector limpio */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="available">
                    <AccordionTrigger className="mt-1 flex justify-between rounded-md bg-white px-3 py-2 text-xs text-gray-700 shadow-sm dark:bg-gray-950 dark:text-gray-200">
                        {title}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                    </AccordionTrigger>
                    <AccordionContent className="mt-1 rounded-md bg-white px-3 py-2 text-xs dark:bg-gray-950">
                        {availableNodes.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">
                                No hay otros nodos
                            </p>
                        ) : (
                            <div className="max-h-[220px] space-y-1 overflow-y-auto">
                                {availableNodes.map((node) => {
                                    const connected = hasConnection(
                                        node.id,
                                        handleId
                                    )
                                    return (
                                        <div
                                            key={node.id}
                                            className={`flex items-center justify-between rounded px-2 py-1 transition ${
                                                connected
                                                    ? 'bg-green-50 dark:bg-green-900/20'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`check-${node.id}-${handleId}`}
                                                    checked={connected}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSelectSingle(
                                                            node.id,
                                                            Boolean(checked)
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`check-${node.id}-${handleId}`}
                                                    className="cursor-pointer text-xs"
                                                >
                                                    {node.data?.label ||
                                                        node.id}
                                                </label>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="px-1 py-0.5 text-[9px] text-gray-600 dark:text-gray-300"
                                            >
                                                {node.type}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
