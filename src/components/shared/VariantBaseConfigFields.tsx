// src\components\shared\VariantBaseConfigFields.tsx
'use client'

import React from 'react'
import { Input, Label, Checkbox } from '@/components/ui'
import { getNestedValue } from '@/utils/getNestedValue'
import { baseVariantFields } from '@/config/baseVariantFields'

/**
 * 🧩 VariantBaseConfigFields
 * -------------------------------------------------------
 * - Muestra los campos base (variable, alias, timeout, etc.)
 * - Admite personalización por tipo de variante (list, quick_reply, etc.)
 * - Incluye GroodText y saveHidden por defecto
 */
interface VariantBaseConfigFieldsProps {
    data: any
    onChange: (path: string, value: unknown) => void
    variantType?: 'list' | 'quick_reply'
    colorClass?: string
}

export function VariantBaseConfigFields({
    data,
    onChange,
    variantType = 'quick_reply',
    colorClass = 'text-violet-700 dark:text-violet-300',
}: VariantBaseConfigFieldsProps) {
    // Obtener configuración según el tipo de variante
    const fields = baseVariantFields[variantType] || []

    return (
        <div className="grid grid-cols-2 gap-4 border-t pt-3">
            {/* 🔹 Campos dinámicos definidos en la configuración */}
            {fields.map(({ label, path, placeholder }) => (
                <div key={path} className="flex flex-col gap-1">
                    <Label className={`text-sm font-medium ${colorClass}`}>
                        {label}
                    </Label>
                    <Input
                        value={getNestedValue(data, path)}
                        onChange={(e) => onChange(path, e.target.value)}
                        placeholder={placeholder}
                        className="text-sm dark:bg-gray-900/50"
                    />
                </div>
            ))}

            {/* 🔸 GroodText */}
            <div className="col-span-2 flex flex-col gap-1">
                <Label className={`text-sm font-medium ${colorClass}`}>
                    GroodText
                </Label>
                <Input
                    value={data.object?.groodText || ''}
                    onChange={(e) =>
                        onChange('object.groodText', e.target.value)
                    }
                    placeholder="Texto de validación (opcional)"
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 🔸 saveHidden */}
            <div className="col-span-2 flex items-center gap-2">
                <Checkbox
                    checked={!!data.object?.saveHidden}
                    onCheckedChange={(val) =>
                        onChange('object.saveHidden', !!val)
                    }
                />
                <Label className={`text-sm font-medium ${colorClass}`}>
                    Guardar variable en segundo plano (saveHidden)
                </Label>
            </div>
        </div>
    )
}
