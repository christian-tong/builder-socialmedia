// src\hooks\useVariantOptions.ts

'use client'
import { useState, useEffect } from 'react'

interface BaseOption {
    postbackText: string
    title: string
    type: string
}

interface UseVariantOptionsProps<T extends BaseOption> {
    initialOptions: T[] | undefined
    onChange: (options: T[]) => void
    defaultLabelPrefix: string
}

export function useVariantOptions<T extends BaseOption>({
    initialOptions,
    onChange,
    defaultLabelPrefix,
}: UseVariantOptionsProps<T>) {
    const [options, setOptions] = useState<T[]>(initialOptions || [])

    useEffect(() => {
        if (!initialOptions || initialOptions.length === 0) {
            const defaultOption: T = {
                postbackText: '1',
                type: 'text',
                title: `${defaultLabelPrefix} 1`,
            } as T
            setOptions([defaultOption])
            onChange([defaultOption])
        } else {
            setOptions(initialOptions)
        }
    }, [initialOptions, onChange, defaultLabelPrefix])

    const usedNumbers = options.map((o) => o.postbackText)
    const availableNumbers = Array.from({ length: 10 }, (_, i) =>
        String(i)
    ).filter((n) => !usedNumbers.includes(n))

    const handleAddOption = () => {
        const next = availableNumbers[0]
        if (!next) return
        const newOption: T = {
            postbackText: next,
            type: 'text',
            title: `${defaultLabelPrefix} ${next}`,
        } as T
        const updated = [...options, newOption]
        setOptions(updated)
        onChange(updated)
    }

    const handleRemoveOption = (index: number) => {
        if (options.length === 1) return
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        onChange(updated)
    }

    const handleUpdateOption = (
        index: number,
        field: keyof T,
        value: string
    ) => {
        const updated = [...options]
        updated[index] = { ...updated[index], [field]: value } as T
        setOptions(updated)
        onChange(updated)
    }

    return {
        options,
        setOptions,
        handleAddOption,
        handleRemoveOption,
        handleUpdateOption,
        availableNumbers,
    }
}
