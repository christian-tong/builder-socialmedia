// src\components\shared\VariantOptionAccordion.tsx

'use client'

import React, { useEffect } from 'react'
import clsx from 'clsx'
import { Label, Input, Button } from '@/components/ui'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'

export interface VariantOption {
    postbackText: string
    title: string
    type?: string
}

interface VariantOptionAccordionProps {
    index: number
    nodeId: string
    option: VariantOption
    color?: 'violet' | 'sky'
    conditions?: Record<string, string>
    setvariables?: Record<string, string>
    usedNumbers?: string[]
    expanded?: boolean
    onExpand?: (index: number | null) => void
    onUpdate: (index: number, field: keyof VariantOption, value: string) => void
    onRemove: (index: number) => void
    onChange: (path: string, value: unknown) => void
}

export function VariantOptionAccordion({
    index,
    nodeId,
    option,
    color = 'violet',
    conditions = {},
    setvariables = {},
    usedNumbers = [],
    expanded = false,
    onExpand,
    onUpdate,
    onRemove,
    onChange,
}: VariantOptionAccordionProps) {
    const accent =
        color === 'sky'
            ? 'text-sky-700 dark:text-sky-300 border-sky-200 dark:border-gray-700'
            : 'text-violet-700 dark:text-violet-300 border-violet-200 dark:border-gray-700'

    const bg =
        color === 'sky'
            ? 'border-sky-300/40 bg-sky-50/40 dark:border-gray-700 dark:bg-gray-900/30'
            : 'border-violet-300/40 bg-violet-50/40 dark:border-gray-700 dark:bg-gray-900/30'

    const {
        availableNodes,
        hasConnection,
        createConnection,
        removeConnection,
    } = useNodeConnections(nodeId)

    const handleId = `option-${index}`

    useEffect(() => {
        const connectedId = conditions?.[option.postbackText]
        if (!connectedId) return
        const stillExists = availableNodes.some((n) => n.id === connectedId)
        const stillConnected = hasConnection(connectedId, handleId)
        if (!stillExists || !stillConnected) {
            onChange(`object.conditions.${option.postbackText}`, '')
        }
    }, [
        availableNodes,
        conditions,
        option.postbackText,
        hasConnection,
        handleId,
        onChange,
    ])

    return (
        <Accordion
            type="single"
            collapsible
            value={expanded ? 'open' : undefined}
            onValueChange={() => onExpand?.(expanded ? null : index)}
            className={clsx(
                'rounded-md border shadow-sm transition-all',
                accent,
                bg
            )}
        >
            <AccordionItem value="open">
                <AccordionTrigger
                    className={clsx(
                        'flex justify-between px-3 py-2 text-xs font-semibold',
                        accent
                    )}
                >
                    Opción {index + 1} — {option.title || 'Sin título'}
                    <span className="font-mono text-[11px] opacity-70">
                        {conditions?.[option.postbackText]
                            ? `→ ${conditions[option.postbackText]}`
                            : '—'}
                    </span>
                </AccordionTrigger>

                <AccordionContent className="space-y-2 px-3 py-3">
                    {/* 🏷️ Título visible */}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs font-medium">
                            Título visible
                        </Label>
                        <Input
                            value={option.title}
                            onChange={(e) =>
                                onUpdate(index, 'title', e.target.value)
                            }
                            placeholder="Texto visible"
                            className="text-sm dark:bg-gray-900/50"
                        />
                    </div>

                    {/* 🔢 Código (0–9) */}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs font-medium">
                            Código (0–9)
                        </Label>
                        <Select
                            value={option.postbackText}
                            onValueChange={(val) =>
                                onUpdate(index, 'postbackText', val)
                            }
                        >
                            <SelectTrigger className="text-sm dark:bg-gray-900/50">
                                <SelectValue placeholder="Selecciona número" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, n) => {
                                    const val = String(n)
                                    const disabled = usedNumbers.includes(val)
                                    return (
                                        <SelectItem
                                            key={val}
                                            value={val}
                                            disabled={
                                                disabled &&
                                                val !== option.postbackText
                                            }
                                        >
                                            {val}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🧠 Variable asociada */}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs font-medium">
                            Variable asociada
                        </Label>
                        <Input
                            value={setvariables?.[option.postbackText] || ''}
                            onChange={(e) =>
                                onChange(
                                    `object.setvariables.${option.postbackText}`,
                                    e.target.value
                                )
                            }
                            placeholder="Ej. 'Baños portátiles'"
                            className="text-sm dark:bg-gray-900/50"
                        />
                    </div>

                    {/* 🔗 Nodo siguiente */}
                    <NodeSelectAccordion
                        title="Nodo siguiente (condition)"
                        availableNodes={availableNodes}
                        selectedId={conditions?.[option.postbackText] || ''}
                        handleId={handleId}
                        onSelect={(targetId) => {
                            onChange(
                                `object.conditions.${option.postbackText}`,
                                targetId
                            )
                            if (targetId) createConnection(targetId, handleId)
                            else
                                removeConnection(
                                    conditions?.[option.postbackText] ?? '',
                                    handleId
                                )
                        }}
                        onUnselect={() => {
                            onChange(
                                `object.conditions.${option.postbackText}`,
                                ''
                            )
                        }}
                        createConnection={createConnection}
                        removeConnection={removeConnection}
                        accentColor={accent}
                    />

                    {/* 🗑️ Eliminar opción */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="mr-1 h-3 w-3" /> Eliminar opción
                    </Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
