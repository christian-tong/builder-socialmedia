// src\components\forms\Variants\Menu\VariantQuickReplyForm.tsx

// src/components/forms/Variants/Menu/VariantQuickReplyForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Label, Textarea, Input, Button } from '@/components/ui'
import { Plus } from 'lucide-react'
import { useVariantOptionsManager } from '@/hooks/useVariantOptionsManager'
import { VariantBaseConfigFields } from '@/components/shared/VariantBaseConfigFields'
import { VariantOptionAccordion } from '@/components/shared/VariantOptionAccordion'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

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
}

interface VariantQuickReplyFormProps {
    id: string
    data: { object?: QuickReplyObject }
    onChange: (path: string, value: unknown) => void
}

export function VariantQuickReplyForm({
    id,
    data,
    onChange,
}: VariantQuickReplyFormProps) {
    const { setVariantOptions, setVariantConditions, setVariantType } =
        useVariantTypeStore()

    const interactive = data?.object?.interactive ?? {
        type: 'quick_reply',
        options: [],
    }

    const conditions = data?.object?.conditions ?? {}

    const { options, addOption, removeOption, updateOption, availableNumbers } =
        useVariantOptionsManager(interactive.options, (updated) =>
            onChange('object.interactive.options', updated)
        )

    const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

    // 🧩 Sincroniza con store Zustand
    useEffect(() => {
        setVariantType(id, 'quick_reply')
        setVariantOptions(id, options)
        setVariantConditions(id, conditions)
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
            <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                💬 Quick Reply — Configuración
            </Label>

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
                        onClick={addOption}
                        disabled={availableNumbers.length === 0}
                        className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, i) => (
                    <VariantOptionAccordion
                        key={`qr-${id}-${opt.postbackText}`}
                        index={i}
                        nodeId={id}
                        option={opt}
                        color="violet"
                        conditions={conditions}
                        onUpdate={updateOption}
                        onRemove={removeOption}
                        onChange={onChange}
                        handlePrefix="qr"
                    />
                ))}
            </div>

            <VariantBaseConfigFields data={data} onChange={onChange} />
        </div>
    )
}
