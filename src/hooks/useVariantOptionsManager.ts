// src\hooks\useVariantOptionsManager.ts

import { useState, useEffect } from 'react'

interface Option {
    postbackText: string
    title: string
    type?: string
}

/**
 * 🧩 useVariantOptionsManager
 * --------------------------------------------------------
 * Maneja la lógica de agregar, eliminar y actualizar opciones
 * para variantes (QuickReply, List, etc.), incluyendo los
 * números disponibles (0–9) y sincronización con el padre.
 */
export function useVariantOptionsManager(
    initialOptions: Option[] = [],
    onChange: (updated: Option[]) => void,
    autoInit = true
) {
    const [options, setOptions] = useState<Option[]>(initialOptions)

    useEffect(() => {
        if (autoInit && options.length === 0) {
            const defaultOpt = {
                postbackText: '1',
                title: 'Opción 1',
                type: 'text',
            }
            setOptions([defaultOpt])
            onChange([defaultOpt])
        }
    }, [autoInit, options, onChange])

    // 🔢 Números usados y disponibles
    const usedNumbers = options.map((o) => o.postbackText)
    const availableNumbers = Array.from({ length: 10 }, (_, i) =>
        String(i)
    ).filter((n) => !usedNumbers.includes(n))

    const addOption = () => {
        const next = availableNumbers[0]
        if (!next) return
        const newOpt = {
            postbackText: next,
            title: `Opción ${next}`,
            type: 'text',
        }
        const updated = [...options, newOpt]
        setOptions(updated)
        onChange(updated)
    }

    const removeOption = (index: number) => {
        if (options.length === 1) return
        const updated = options.filter((_, i) => i !== index)
        setOptions(updated)
        onChange(updated)
    }

    const updateOption = (
        index: number,
        field: keyof Option,
        value: string
    ) => {
        const updated = [...options]
        updated[index] = { ...updated[index], [field]: value }
        setOptions(updated)
        onChange(updated)
    }

    // ✅ Ahora incluye usedNumbers en el return
    return {
        options,
        addOption,
        removeOption,
        updateOption,
        availableNumbers,
        usedNumbers,
    }
}
