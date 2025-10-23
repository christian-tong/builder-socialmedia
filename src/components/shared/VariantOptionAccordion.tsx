// src\components\shared\VariantOptionAccordion.tsx

'use client'

import React, { useEffect, useRef } from 'react'
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
    handlePrefix?: string
    canRemove?: boolean // 👈 nueva prop opcional
}

/**
 * 🧩 VariantOptionAccordion
 * - Reutilizable para QuickReply/List.
 * - ✅ Ya no borra la condición si aún no existe el edge (solo limpia si el nodo destino desaparece).
 * - 🔁 Reintentos para crear la conexión hasta que el handle esté montado.
 */
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
    handlePrefix = 'opt',
    canRemove = true, // 👈 por defecto se permite eliminar (para QuickReply)
}: VariantOptionAccordionProps) {
    const accent =
        color === 'sky'
            ? 'text-sky-700 dark:text-sky-300 border-sky-200 dark:border-gray-700'
            : 'text-violet-700 dark:text-violet-300 border-violet-200 dark:border-gray-700'

    const bg =
        color === 'sky'
            ? 'border-sky-300/40 bg-sky-50/40 dark:border-gray-700 dark:bg-gray-900/30'
            : 'border-violet-300/40 bg-violet-50/40 dark:border-gray-700 dark:bg-gray-900/30'

    const { availableNodes, createConnection, removeConnection } =
        useNodeConnections(nodeId)

    const handleId = `${handlePrefix}-option-${index}-${option.postbackText}`
    const lastConnectionRef = useRef<number | null>(null)

    // 🧠 Log por render
    useEffect(() => {
        console.groupCollapsed(`%c[VOA] Render index=${index}`, 'color:#7c3aed')
        console.log('nodeId:', nodeId)
        console.log('option:', option)
        console.log('handleId:', handleId)
        console.log('conditions:', conditions)
        console.log(
            'selected condition:',
            conditions?.[option.postbackText] || ''
        )
        console.log('availableNodes:', availableNodes)
        console.groupEnd()
    })

    /* ------------------------------------------------------------
       🔍 Validación diferida SÓLO por existencia del nodo
    ------------------------------------------------------------ */
    useEffect(() => {
        const connectedId = conditions?.[option.postbackText]
        if (!connectedId) return

        const timer = setTimeout(() => {
            const stillExists = availableNodes.some((n) => n.id === connectedId)

            console.groupCollapsed(
                `%c[VOA] validate (existence only) index=${index}`,
                'color:#2563eb'
            )
            console.log('connectedId:', connectedId)
            console.log('stillExists:', stillExists)
            console.groupEnd()

            if (!stillExists) {
                console.warn(
                    '[VOA] Cleaning condition because target node no longer exists:',
                    option.postbackText
                )
                onChange(`object.conditions.${option.postbackText}`, '')
            }
        }, 600)

        return () => clearTimeout(timer)
    }, [availableNodes, conditions, option.postbackText, onChange, index])

    /* ------------------------------------------------------------
       🔗 Conexión con reintentos hasta que el handle esté en el DOM
    ------------------------------------------------------------ */
    const handleCreateConnection = (targetId: string) => {
        if (!targetId) return
        lastConnectionRef.current = Date.now()

        let attempts = 0
        const maxAttempts = 10
        const intervalMs = 120

        const tryConnect = () => {
            attempts += 1
            const handleEl = document.querySelector(
                `[data-id="${nodeId}"] [data-handleid="${handleId}"]`
            )

            if (handleEl) {
                console.log('[VOA] ✅ handle montado, creando conexión:', {
                    targetId,
                    handleId,
                })
                createConnection(targetId, handleId)
                return
            }

            if (attempts < maxAttempts) {
                setTimeout(tryConnect, intervalMs)
            } else {
                console.warn(
                    `[VOA] ⚠️ No se encontró el handle ${handleId} tras ${maxAttempts} intentos`
                )
            }
        }

        setTimeout(tryConnect, 0)
    }

    /* ------------------------------------------------------------
       🎨 Render
    ------------------------------------------------------------ */
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
                            onChange={(e) => {
                                const path = `object.setvariables.${option.postbackText}`
                                onChange(path, e.target.value)
                            }}
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
                            const path = `object.conditions.${option.postbackText}`
                            onChange(path, targetId || '')

                            if (targetId) handleCreateConnection(targetId)
                            else if (conditions?.[option.postbackText])
                                removeConnection?.(
                                    conditions[option.postbackText],
                                    handleId
                                )
                        }}
                        onUnselect={() => {
                            const path = `object.conditions.${option.postbackText}`
                            const prev = conditions?.[option.postbackText]
                            onChange(path, '')
                            if (prev) removeConnection?.(prev, handleId)
                        }}
                        createConnection={createConnection}
                        removeConnection={removeConnection}
                        accentColor={accent}
                    />

                    {/* 🗑️ Eliminar opción */}
                    {canRemove && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="mt-1 text-xs text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="mr-1 h-3 w-3" /> Eliminar opción
                        </Button>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
