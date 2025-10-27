// src\components\forms\Variants\Menu\VariantList

'use client'

import React, { useState, useEffect } from 'react'
import { Label, Textarea, Button } from '@/components/ui'
import { Plus } from 'lucide-react'
import { useVariantOptionsManager } from '@/hooks/useVariantOptionsManager'
import { VariantBaseConfigFields } from '@/components/shared/VariantBaseConfigFields'
import { VariantOptionAccordion } from '@/components/shared/VariantOptionAccordion'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

/**
 * 📋 VariantListForm (versión sincronizada)
 * ------------------------------------------------------
 * - Sincroniza opciones y condiciones con Zustand.
 * - Evita pérdida de edges o condiciones huérfanas.
 * - Usa un debounce para no saturar el store.
 */
export function VariantListForm({
    id,
    data,
    onChange,
}: {
    id: string
    data: any
    onChange: (path: string, value: unknown) => void
}) {
    const { setVariantOptions, setVariantConditions, setVariantType } =
        useVariantTypeStore()

    const interactive = data?.object?.interactive ?? {
        type: 'list',
        items: [{ options: [] }],
    }

    const conditions = data?.object?.conditions ?? {}

    const { options, addOption, removeOption, updateOption, availableNumbers } =
        useVariantOptionsManager(
            interactive.items?.[0]?.options ?? [],
            (updated) => onChange('object.interactive.items.0.options', updated)
        )

    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    /**
     * 🧩 Sincronización controlada con Zustand (debounce 120ms)
     * - Asegura que el estado se actualice sin causar loops.
     * - Mantiene conditions y options sincronizadas con useVariantFlowSync.
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            setVariantType(id, 'list')
            setVariantOptions(id, options)
            setVariantConditions(id, conditions)
        }, 120)
        return () => clearTimeout(timeout)
    }, [
        id,
        options,
        conditions,
        setVariantOptions,
        setVariantConditions,
        setVariantType,
    ])

    return (
        <div className="flex flex-col gap-4 border-t pt-3">
            <Label className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                📋 List — Configuración
            </Label>

            {/* 📝 Texto del cuerpo */}
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

            {/* 🔹 Opciones dinámicas */}
            <div className="flex flex-col gap-3 rounded-md border border-sky-300/40 bg-sky-50/40 p-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        size="sm"
                        onClick={addOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <VariantOptionAccordion
                        key={`list-${id}-${opt.postbackText}`}
                        index={i}
                        nodeId={id}
                        option={opt}
                        color="sky"
                        conditions={conditions}
                        onUpdate={updateOption}
                        onRemove={removeOption}
                        onChange={onChange}
                        handlePrefix="list"
                        expanded={expandedIndex === i}
                        onExpand={setExpandedIndex}
                        canRemove={true}
                    />
                ))}
            </div>

            <VariantBaseConfigFields
                data={data}
                onChange={onChange}
                variantType="list"
                colorClass="text-sky-700 dark:text-sky-300"
            />
        </div>
    )
}
