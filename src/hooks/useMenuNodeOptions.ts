// src\hooks\useMenuNodeOptions.ts

'use client'

import type { MenuNodeOption } from './useMenuNodeForm'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * ⚙️ useMenuNodeOptions
 * --------------------------------------------------
 * Maneja agregar, eliminar y actualizar opciones dinámicas del nodo
 */
export function useMenuNodeOptions(id: string, options: MenuNodeOption[]) {
    const { updateNodeData } = useNodeConfigStore()

    const handleAddOption = () => {
        const newOption: MenuNodeOption = {
            postbackText: String(options.length + 1),
            title: '',
            next: '',
        }
        const newOptions = [...options, newOption]
        updateNodeData(id, { options: newOptions })
    }

    const handleRemoveOption = (index: number) => {
        if (options.length <= 1) return
        const newOptions = options.filter((_, i) => i !== index)
        updateNodeData(id, { options: newOptions })
    }

    const handleUpdateOption = (
        index: number,
        field: keyof MenuNodeOption,
        value: string
    ) => {
        const newOptions = options.map((opt, i) =>
            i === index ? { ...opt, [field]: value } : opt
        )
        updateNodeData(id, { options: newOptions })
    }

    return {
        handleAddOption,
        handleRemoveOption,
        handleUpdateOption,
    }
}
