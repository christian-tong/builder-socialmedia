// src\components\forms\Variants\Menu\VariantQuickReplyForm.tsx

'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Input, Label, Textarea, Button, Checkbox } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { getDataVariantsConfig } from '@/config/getDataVariantsConfig'
import { useFlowStore } from '@/store/useFlowStore'

/* ------------------------------------------------------------
   🔹 Tipos base
------------------------------------------------------------ */
interface QuickReplyOption {
    postbackText: string
    type: 'text'
    title: string
}

interface InteractiveContent {
    text: string
    type: 'text'
}

interface Interactive {
    msgid?: string
    type: 'quick_reply'
    content?: InteractiveContent
    options: QuickReplyOption[]
}

interface QuickReplyObject {
    setvariables?: Record<string, string>
    conditions?: Record<string, string>
    interactive?: Interactive
    variable?: string
    alias?: string
    iterations?: string
    timeOut?: string
    condition?: string
    groodText?: string
    setvar?: string
    saveHidden?: boolean
}

interface VariantQuickReplyFormProps {
    id: string
    data: { object?: QuickReplyObject }
    onChange: (path: string, value: unknown) => void
    availableNodes?: { id: string; label: string }[]
    onSelectCondition?: (index: number, targetId: string) => void
}

/* ------------------------------------------------------------
   💬 Formulario principal
------------------------------------------------------------ */
export function VariantQuickReplyForm({
    id,
    data,
    onChange,
    availableNodes = [],
    onSelectCondition,
}: VariantQuickReplyFormProps) {
    const { edges, setEdges } = useFlowStore()

    const interactive: Interactive = data?.object?.interactive ?? {
        type: 'quick_reply',
        options: [],
    }

    const setvariables = data?.object?.setvariables ?? {}
    const conditions = data?.object?.conditions ?? {}
    const [options, setOptions] = useState<QuickReplyOption[]>(
        interactive.options || []
    )
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    // 🧩 Helper seguro para acceder a rutas anidadas
    const getNestedValue = (obj: any, path: string): string => {
        try {
            const val = path.split('.').reduce((acc, key) => acc?.[key], obj)
            return typeof val === 'string' || typeof val === 'number'
                ? String(val)
                : ''
        } catch {
            return ''
        }
    }

    // 🔗 Crear conexión visual en el Flow
    const connectOption = (optionIndex: number, targetId: string) => {
        const handleId = `option-${optionIndex}`
        const edgeId = `edge-${id}-${targetId}-${handleId}`

        const exists = edges.some(
            (e) =>
                e.id === edgeId ||
                (e.source === id &&
                    e.sourceHandle === handleId &&
                    e.target === targetId)
        )

        if (!exists) {
            setEdges((prev) => [
                ...prev,
                {
                    id: edgeId,
                    source: id,
                    target: targetId,
                    sourceHandle: handleId,
                    animated: true,
                    style: { strokeWidth: 2 },
                },
            ])
        }
    }

    // ❌ Eliminar conexión visual en el Flow
    const disconnectOption = (optionIndex: number) => {
        const handleId = `option-${optionIndex}`
        setEdges((prev) =>
            prev.filter(
                (e) => !(e.source === id && e.sourceHandle === handleId)
            )
        )
    }

    // 🧩 Mantiene sincronizado el estado local
    useEffect(() => {
        if (!interactive.options || interactive.options.length === 0) {
            const defaultOption: QuickReplyOption = {
                postbackText: '1',
                type: 'text',
                title: 'Opción 1',
            }
            setOptions([defaultOption])
            onChange('object.interactive.options', [defaultOption])
        } else {
            setOptions(interactive.options)
        }
    }, [interactive.options, onChange])

    // 🔢 Lista de números disponibles (0–9 sin repetir)
    const usedNumbers = options.map((opt) => opt.postbackText)
    const availableNumbers = Array.from({ length: 10 }, (_, i) =>
        String(i)
    ).filter((n) => !usedNumbers.includes(n))

    // ➕ Agregar nueva opción
    const handleAddOption = (): void => {
        const next = availableNumbers[0]
        if (!next) return
        const newOption: QuickReplyOption = {
            postbackText: next,
            type: 'text',
            title: `Opción ${next}`,
        }
        const updated = [...options, newOption]
        setOptions(updated)
        onChange('object.interactive.options', updated)
    }

    // 🗑️ Eliminar opción
    const handleRemoveOption = (index: number): void => {
        if (options.length === 1) return
        disconnectOption(index)
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        onChange('object.interactive.options', updated)
    }

    // ✏️ Actualizar campo individual
    const handleUpdateOption = (
        index: number,
        field: keyof QuickReplyOption,
        value: string
    ): void => {
        const updated = [...options]
        updated[index] = { ...updated[index], [field]: value }
        setOptions(updated)
        onChange('object.interactive.options', updated)
    }

    // ⚙️ Campos configurables desde la definición global
    const baseConfigFields = [
        {
            label: 'Variable',
            path: 'object.variable',
            placeholder: 'Ej. PrimeraOpcion',
        },
        { label: 'Alias', path: 'object.alias', placeholder: 'Alias interno' },
        { label: 'Iteraciones', path: 'object.iterations', placeholder: '1' },
        { label: 'Timeout (ms)', path: 'object.timeOut', placeholder: '90000' },
        {
            label: 'SetVar',
            path: 'object.setvar',
            placeholder: 'Ej. PRIMER_NIVEL',
        },
        {
            label: 'Condition (regex)',
            path: 'object.condition',
            placeholder: 'Ej. [1-3]',
        },
    ]

    const defaultVariant = getDataVariantsConfig.quick_reply

    return (
        <div className="flex flex-col gap-4 border-t pt-3">
            <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                💬 Quick Reply — Configuración
            </Label>

            {/* 📨 Mensaje principal */}
            <Textarea
                value={decodeURIComponent(interactive.content?.text || '')}
                onChange={(e) =>
                    onChange(
                        'object.interactive.content.text',
                        encodeURIComponent(e.target.value)
                    )
                }
                placeholder="Texto principal del mensaje"
                className="text-sm dark:bg-gray-900/40"
            />

            {/* 🔢 ID del mensaje */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">
                    ID del mensaje (msgid)
                </Label>
                <Input
                    value={interactive.msgid || ''}
                    onChange={(e) =>
                        onChange('object.interactive.msgid', e.target.value)
                    }
                    placeholder="Ej. qr1"
                    className="text-sm dark:bg-gray-900/40"
                />
            </div>

            {/* 🧩 Opciones dinámicas */}
            <div className="flex flex-col gap-3 rounded-md border border-violet-300/40 bg-violet-50/40 p-3 dark:border-gray-700 dark:bg-gray-900/30">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <Accordion
                        key={i}
                        type="single"
                        collapsible
                        className="rounded-md border border-violet-200 bg-white/70 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/30"
                        value={expandedIndex === i ? 'open' : undefined}
                        onValueChange={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                        }
                    >
                        <AccordionItem value="open">
                            <AccordionTrigger
                                className={clsx(
                                    'flex justify-between px-3 py-2 text-xs font-semibold',
                                    'text-violet-700 dark:text-violet-300'
                                )}
                            >
                                Opción {i + 1} — {opt.title || 'Sin título'}
                                <span className="font-mono text-[11px] opacity-70">
                                    {conditions?.[opt.postbackText]
                                        ? `→ ${conditions[opt.postbackText]}`
                                        : '—'}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 px-3 py-3">
                                {/* 🏷️ Título visible */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium">
                                        Texto del botón
                                    </Label>
                                    <Input
                                        value={opt.title}
                                        onChange={(e) =>
                                            handleUpdateOption(
                                                i,
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Texto visible"
                                        className="text-sm dark:bg-gray-900/50"
                                    />
                                </div>

                                {/* 🔢 Selector numérico */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium">
                                        Código numérico (0–9)
                                    </Label>
                                    <Select
                                        value={opt.postbackText}
                                        onValueChange={(val) =>
                                            handleUpdateOption(
                                                i,
                                                'postbackText',
                                                val
                                            )
                                        }
                                    >
                                        <SelectTrigger className="text-sm dark:bg-gray-900/50">
                                            <SelectValue placeholder="Selecciona número" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(10)].map((_, n) => {
                                                const val = String(n)
                                                const disabled =
                                                    usedNumbers.includes(val)
                                                return (
                                                    <SelectItem
                                                        key={val}
                                                        value={val}
                                                        disabled={
                                                            disabled &&
                                                            val !==
                                                                opt.postbackText
                                                        }
                                                    >
                                                        {val}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 🧠 setvariable */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium">
                                        Variable asociada
                                    </Label>
                                    <Input
                                        value={
                                            setvariables?.[opt.postbackText] ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                `object.setvariables.${opt.postbackText}`,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Texto de variable"
                                        className="text-sm dark:bg-gray-900/50"
                                    />
                                </div>

                                {/* 🔗 Nodo siguiente sincronizado */}
                                <NodeSelectAccordion
                                    title="Nodo siguiente (condition)"
                                    availableNodes={availableNodes}
                                    selectedId={
                                        conditions?.[opt.postbackText] || ''
                                    }
                                    handleId={`option-${i}`}
                                    onSelect={(val: string) => {
                                        onSelectCondition?.(i, val)
                                        onChange(
                                            `object.conditions.${opt.postbackText}`,
                                            val
                                        )
                                        connectOption(i, val)
                                    }}
                                    onUnselect={() => disconnectOption(i)}
                                    accentColor="text-violet-700 dark:text-violet-300"
                                />

                                {/* 🗑️ Eliminar opción */}
                                {options.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(i)}
                                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />{' '}
                                        Eliminar opción
                                    </Button>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>

            {/* 🧩 Campos adicionales */}
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
                {baseConfigFields.map(({ label, path, placeholder }) => (
                    <div key={path} className="flex flex-col gap-1">
                        <Label className="text-sm font-medium">{label}</Label>
                        <Input
                            value={getNestedValue(data, path)}
                            onChange={(e) => onChange(path, e.target.value)}
                            placeholder={placeholder}
                            className="text-sm dark:bg-gray-900/50"
                        />
                    </div>
                ))}

                <div className="col-span-2 flex flex-col gap-1">
                    <Label className="text-sm font-medium">GroodText</Label>
                    <Input
                        value={data.object?.groodText || ''}
                        onChange={(e) =>
                            onChange('object.groodText', e.target.value)
                        }
                        placeholder="Texto de validación (opcional)"
                        className="text-sm dark:bg-gray-900/50"
                    />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                    <Checkbox
                        checked={!!data.object?.saveHidden}
                        onCheckedChange={(val) =>
                            onChange('object.saveHidden', !!val)
                        }
                    />
                    <Label className="text-sm font-medium">
                        Guardar variable en segundo plano (saveHidden)
                    </Label>
                </div>
            </div>
        </div>
    )
}
