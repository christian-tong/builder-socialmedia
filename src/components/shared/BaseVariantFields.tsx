// src\components\shared\BaseVariantFields.tsx

'use client'
import { Input, Label, Checkbox } from '@/components/ui'

interface BaseFieldConfig {
    label: string
    path: string
    placeholder: string
}

interface BaseVariantFieldsProps {
    data: any
    onChange: (path: string, value: unknown) => void
    colorClass: string
    baseFields: BaseFieldConfig[]
}

export function BaseVariantFields({
    data,
    onChange,
    baseFields,
    colorClass,
}: BaseVariantFieldsProps) {
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

    return (
        <div className="grid grid-cols-2 gap-4 border-t pt-3">
            {baseFields.map(({ label, path, placeholder }) => (
                <div key={path} className="flex flex-col gap-1">
                    <Label className="text-sm font-medium">{label}</Label>
                    <Input
                        value={getNestedValue(data, path)}
                        onChange={(e) => onChange(path, e.target.value)}
                        placeholder={placeholder}
                        className={`text-sm dark:bg-gray-900/50 ${colorClass}`}
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
                    className={`text-sm dark:bg-gray-900/50 ${colorClass}`}
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
