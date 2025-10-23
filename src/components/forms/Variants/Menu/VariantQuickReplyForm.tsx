// src\components\forms\Variants\Menu\VariantQuickReplyForm.tsx

'use client'

import React, { useState } from 'react'
import { Label, Textarea, Input, Button } from '@/components/ui'
import { Plus } from 'lucide-react'
import { useVariantOptionsManager } from '@/hooks/useVariantOptionsManager'
import { VariantBaseConfigFields } from '@/components/shared/VariantBaseConfigFields'
import { VariantOptionAccordion } from '@/components/shared/VariantOptionAccordion'

/* ------------------------------------------------------------
   🔹 Tipos base
------------------------------------------------------------ */
interface QuickReplyOption {
    postbackText: string
    type: 'text'
    title: string
}

interface Interactive {
    msgid?: string
    type: 'quick_reply'
    content?: { text: string; type: 'text' }
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
}

/* ------------------------------------------------------------
   💬 Quick Reply Form — modularizado
------------------------------------------------------------ */
export function VariantQuickReplyForm({
    id,
    data,
    onChange,
}: VariantQuickReplyFormProps) {
    const interactive = data?.object?.interactive ?? {
        type: 'quick_reply',
        options: [],
    }

    const setvariables = data?.object?.setvariables ?? {}
    const conditions = data?.object?.conditions ?? {}

    // 🧩 Hook que maneja opciones (agregar, actualizar, eliminar)
    const {
        options,
        addOption,
        removeOption,
        updateOption,
        availableNumbers,
        usedNumbers,
    } = useVariantOptionsManager(interactive.options, (updated) =>
        onChange('object.interactive.options', updated)
    )

    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    return (
        <div className="flex flex-col gap-4 border-t pt-3">
            <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                💬 Quick Reply — Configuración
            </Label>

            {/* 📨 Texto principal */}
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
                        onClick={addOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <VariantOptionAccordion
                        key={i}
                        index={i}
                        nodeId={id} // ✅ Necesario para useNodeConnections
                        option={opt}
                        color="violet"
                        conditions={conditions}
                        setvariables={setvariables}
                        usedNumbers={usedNumbers}
                        expanded={expandedIndex === i}
                        onExpand={setExpandedIndex}
                        onUpdate={updateOption} // ✅ Corregido
                        onRemove={removeOption} // ✅ Corregido
                        onChange={onChange}
                    />
                ))}
            </div>

            {/* ⚙️ Campos base comunes */}
            <VariantBaseConfigFields data={data} onChange={onChange} />
        </div>
    )
}
