// src\components\forms\Variants\Menu\VariantQuickReplyForm.tsx

'use client'

import React, { useState, useRef } from 'react'
import { Label, Textarea, Button, Input } from '@/components/ui'
import { Plus } from 'lucide-react'
import { useVariantOptionsManager } from '@/hooks/useVariantOptionsManager'
import { VariantBaseConfigFields } from '@/components/shared/VariantBaseConfigFields'
import { VariantOptionAccordion } from '@/components/shared/VariantOptionAccordion'

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
    condition?: string
}

interface VariantQuickReplyFormProps {
    id: string
    data: { object?: QuickReplyObject }
    onChange: (path: string, value: unknown) => void
}

/**
 * 💬 VariantQuickReplyForm (modo diferido)
 * ------------------------------------------------------------
 * 🔹 No escribe en Zustand en tiempo real
 * 🔹 Los cambios se reflejan solo al guardar (saveCallback)
 * 🔹 Sin bucles infinitos ni re-renderes innecesarios
 */
export function VariantQuickReplyForm({
    id,
    data,
    onChange,
}: VariantQuickReplyFormProps) {
    const userEditedCondition = useRef(false)

    // 🧩 Estructura segura
    const interactive: Interactive = data?.object?.interactive ?? {
        type: 'quick_reply',
        msgid: '',
        content: { text: '', type: 'text' },
        options: [],
    }

    const conditions = data?.object?.conditions ?? {}
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    /* ------------------------------------------------------------
     🧩 Hook de opciones (manejo local)
  ------------------------------------------------------------ */
    const { options, addOption, removeOption, updateOption, availableNumbers } =
        useVariantOptionsManager(interactive.options, (updated) => {
            if (data?.object?.interactive) {
                // Solo modifica data local
                onChange('object.interactive.options', updated)
            }
        })

    /* ------------------------------------------------------------
     🔢 Recalcular condition (solo visual, no global)
  ------------------------------------------------------------ */
    const recalculateCondition = (newCount?: number) => {
        if (userEditedCondition.current) return
        if (!data?.object?.interactive) return
        const count = typeof newCount === 'number' ? newCount : options.length
        const regex = `[1-${count > 0 ? count : 1}]`
        onChange('object.condition', regex)
    }

    /* ------------------------------------------------------------
     🧠 Detección de edición manual del condition
  ------------------------------------------------------------ */
    const handleConditionManual = (path: string, value: unknown) => {
        if (path === 'object.condition') userEditedCondition.current = true
        onChange(path, value)
    }

    /* ------------------------------------------------------------
     ➕ / ➖ Opciones
  ------------------------------------------------------------ */
    const handleAddOption = () => {
        const updated = addOption() as QuickReplyOption[] | undefined
        const count =
            Array.isArray(updated) && updated.length > 0
                ? updated.length
                : options.length + 1
        recalculateCondition(count)
    }

    const handleRemoveOption = (index: number) => {
        const updated = removeOption(index) as QuickReplyOption[] | undefined
        const count =
            Array.isArray(updated) && updated.length >= 0
                ? updated.length
                : Math.max(1, options.length - 1)
        recalculateCondition(count)
    }

    /* ------------------------------------------------------------
     🧱 Render
  ------------------------------------------------------------ */
    return (
        <div className="flex flex-col gap-4 border-t pt-3">
            {/* Título */}
            <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                💬 Quick Reply — Configuración
            </Label>

            {/* msgid */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">
                    ID del mensaje (msgid)
                </Label>
                <Input
                    value={interactive.msgid}
                    onChange={(e) =>
                        onChange('object.interactive.msgid', e.target.value)
                    }
                    placeholder="Ej. qr1"
                    className="text-sm dark:bg-gray-900/40"
                />
            </div>

            {/* Texto principal */}
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

            {/* Opciones */}
            <div className="flex flex-col gap-3 rounded-md border border-violet-300/40 bg-violet-50/40 p-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        size="sm"
                        onClick={handleAddOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <VariantOptionAccordion
                        key={`qr-${id}-${opt.postbackText}-${i}`}
                        index={i}
                        nodeId={id}
                        option={opt}
                        color="violet"
                        conditions={conditions}
                        onUpdate={updateOption}
                        onRemove={handleRemoveOption}
                        onChange={onChange}
                        handlePrefix="qr"
                        expanded={expandedIndex === i}
                        onExpand={setExpandedIndex}
                    />
                ))}
            </div>

            {/* Campos base */}
            <VariantBaseConfigFields
                data={data}
                onChange={handleConditionManual}
                variantType="quick_reply"
                colorClass="text-violet-700 dark:text-violet-300"
            />
        </div>
    )
}
