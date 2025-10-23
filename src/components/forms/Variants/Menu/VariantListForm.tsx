// src\components\forms\Variants\Menu\VariantListForm.tsx

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

/* ------------------------------------------------------------
   🔹 Tipos base
------------------------------------------------------------ */
interface ListOption {
    postbackText: string
    type: 'text'
    title: string
    description?: string
}

interface ListItem {
    title?: string
    options: ListOption[]
}

interface ListInteractive {
    globalButtons?: { type: string; title: string }[]
    type: 'list'
    body?: string
    items: ListItem[]
}

interface ListObject {
    setvariables?: Record<string, string>
    conditions?: Record<string, string>
    interactive?: ListInteractive
    variable?: string
    alias?: string
    iterations?: string
    timeOut?: string
    condition?: string
    groodText?: string
    setvar?: string
    saveHidden?: boolean
}

interface VariantListFormProps {
    data: { object?: ListObject }
    onChange: (path: string, value: unknown) => void
    availableNodes?: { id: string; label: string }[]
    onSelectCondition?: (index: number, targetId: string) => void
}

/* ------------------------------------------------------------
   📋 Formulario List — Reutilizable
------------------------------------------------------------ */
export function VariantListForm({
    data,
    onChange,
    availableNodes = [],
    onSelectCondition,
}: VariantListFormProps) {
    const interactive: ListInteractive = data?.object?.interactive ?? {
        type: 'list',
        items: [{ options: [] }],
    }

    const setvariables = data?.object?.setvariables ?? {}
    const conditions = data?.object?.conditions ?? {}
    const [options, setOptions] = useState<ListOption[]>(
        interactive.items?.[0]?.options || []
    )
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    // 🔍 Helper seguro para valores anidados
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

    // ⚙️ Inicializa con una opción por defecto si no hay
    useEffect(() => {
        if (!interactive.items?.[0]?.options?.length) {
            const defaultOption: ListOption = {
                postbackText: '1',
                type: 'text',
                title: 'Opción 1',
            }
            setOptions([defaultOption])
            onChange('object.interactive.items.0.options', [defaultOption])
        } else {
            setOptions(interactive.items[0].options)
        }
    }, [interactive.items, onChange])

    // 🔢 Controla números no repetidos (0–9)
    const usedNumbers = options.map((o) => o.postbackText)
    const availableNumbers = Array.from({ length: 10 }, (_, i) =>
        String(i)
    ).filter((n) => !usedNumbers.includes(n))

    // ➕ Agregar opción
    const handleAddOption = (): void => {
        const next = availableNumbers[0]
        if (!next) return
        const newOpt: ListOption = {
            postbackText: next,
            type: 'text',
            title: `Opción ${next}`,
        }
        const updated = [...options, newOpt]
        setOptions(updated)
        onChange('object.interactive.items.0.options', updated)
    }

    // 🗑️ Eliminar opción
    const handleRemoveOption = (index: number): void => {
        if (options.length === 1) return
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        onChange('object.interactive.items.0.options', updated)
    }

    // ✏️ Actualizar campo
    const handleUpdateOption = (
        index: number,
        field: keyof ListOption,
        value: string
    ): void => {
        const updated = [...options]
        updated[index] = { ...updated[index], [field]: value }
        setOptions(updated)
        onChange('object.interactive.items.0.options', updated)
    }

    // 📄 Campos base comunes (de la config global)
    const baseConfigFields = [
        {
            label: 'Variable',
            path: 'object.variable',
            placeholder: 'Ej. SegundaOpcion',
        },
        { label: 'Alias', path: 'object.alias', placeholder: 'Alias interno' },
        { label: 'Iteraciones', path: 'object.iterations', placeholder: '1' },
        { label: 'Timeout (ms)', path: 'object.timeOut', placeholder: '90000' },
        {
            label: 'SetVar',
            path: 'object.setvar',
            placeholder: 'Ej. SEGUNDO_NIVEL',
        },
        {
            label: 'Condition (regex)',
            path: 'object.condition',
            placeholder: 'Ej. [0-5]',
        },
    ]

    const variantColor = 'sky'

    return (
        <div className="flex flex-col gap-4 border-t pt-3">
            <Label className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                📋 List — Configuración
            </Label>

            {/* 📨 Texto del cuerpo */}
            <Textarea
                value={decodeURIComponent(interactive.body || '')}
                onChange={(e) =>
                    onChange(
                        'object.interactive.body',
                        encodeURIComponent(e.target.value)
                    )
                }
                placeholder="Texto del cuerpo del listado"
                className="text-sm dark:bg-gray-900/40"
            />

            {/* 🧩 Opciones dinámicas */}
            <div className="flex flex-col gap-3 rounded-md border border-sky-300/40 bg-sky-50/40 p-3 dark:border-gray-700 dark:bg-gray-900/30">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <Accordion
                        key={i}
                        type="single"
                        collapsible
                        value={expandedIndex === i ? 'open' : undefined}
                        onValueChange={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                        }
                        className="rounded-md border border-sky-200 bg-white/70 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/30"
                    >
                        <AccordionItem value="open">
                            <AccordionTrigger
                                className={clsx(
                                    'flex justify-between px-3 py-2 text-xs font-semibold',
                                    'text-sky-700 dark:text-sky-300'
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
                                {/* 🏷️ Título */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium">
                                        Título visible
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

                                {/* 🔢 Código */}
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-medium">
                                        Código (0–9)
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
                                        placeholder="Ej. 'Baños portátiles'"
                                        className="text-sm dark:bg-gray-900/50"
                                    />
                                </div>

                                {/* 🔗 Nodo siguiente */}
                                <NodeSelectAccordion
                                    title="Nodo siguiente (condition)"
                                    availableNodes={availableNodes}
                                    selectedId={
                                        conditions?.[opt.postbackText] || ''
                                    }
                                    handleId={`condition-${i}`}
                                    onSelect={(val: string) =>
                                        onSelectCondition?.(i, val) ??
                                        onChange(
                                            `object.conditions.${opt.postbackText}`,
                                            val
                                        )
                                    }
                                    accentColor="text-sky-700 dark:text-sky-300"
                                />

                                {/* 🗑️ Eliminar */}
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

            {/* ⚙️ Campos adicionales */}
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
