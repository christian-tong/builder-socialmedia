// src\components\shared\VariantBaseConfigFields.tsx

'use client'
import React from 'react'
import { Input, Label, Checkbox } from '@/components/ui'
import { baseVariantFields } from '@/config/baseVariantFields'
import { getNestedValue } from '@/utils/getNestedValue'

export function VariantBaseConfigFields({ data, onChange }: any) {
    return (
        <div className="grid grid-cols-2 gap-4 border-t pt-3">
            {baseVariantFields.map(({ label, path, placeholder }) => (
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
    )
}
