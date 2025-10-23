// src\hooks\useMenuNodeForm.ts

// src/hooks/useMenuNodeForm.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useMenuNodeSync } from '@/hooks/useMenuNodeSync'
import { useMenuNodeOptions } from '@/hooks/useMenuNodeOptions'
import { useFlowStore } from '@/store/useFlowStore'

export interface MenuNodeOption {
    postbackText: string
    title: string
    next: string
}

export interface MenuNodeData {
    variable?: string
    message?: string
    onTrue?: string
    onFalse?: string
    onError?: string
    options?: MenuNodeOption[]
    [key: string]: any
}

/**
 * 🧠 useMenuNodeForm — con sincronización total de conexiones
 */
export function useMenuNodeForm(id: string, data: MenuNodeData) {
    const {
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection,
    } = useNodeConnections(id)

    const { edges, setEdges } = useFlowStore()
    const [expandedOptionIndex, setExpandedOptionIndex] = useState<
        number | null
    >(null)
    const [connections, setConnections] = useState<Record<number, string>>({})
    const [flowRefs, setFlowRefs] = useState<Record<string, string>>({
        onTrue: '—',
        onFalse: '—',
        onError: '—',
    })

    const messageRef = useRef<HTMLTextAreaElement | null>(null)
    const options: MenuNodeOption[] = Array.isArray(data.options)
        ? data.options
        : []

    // 🧩 Sincroniza edges <-> data
    useMenuNodeSync(id, data, options, setConnections, setFlowRefs)

    // ⚙️ Controla textarea
    useEffect(() => {
        const el = messageRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 400)}px`
    }, [data.message])

    // 🧲 Crear conexión dinámica por índice de opción
    const connectOption = (optionIndex: number, targetId: string) => {
        const handleId = `option-${optionIndex}`
        const already = edges.some(
            (e) =>
                e.source === id &&
                e.sourceHandle === handleId &&
                e.target === targetId
        )
        if (!already) {
            setEdges((prev) => [
                ...prev,
                {
                    id: `edge-${id}-${targetId}-${handleId}`,
                    source: id,
                    target: targetId,
                    sourceHandle: handleId,
                    animated: true,
                    style: { strokeWidth: 2 },
                },
            ])
        }
    }

    // 🧹 Eliminar conexión dinámica de una opción
    const disconnectOption = (optionIndex: number) => {
        const handleId = `option-${optionIndex}`
        setEdges((prev) =>
            prev.filter(
                (e) => !(e.source === id && e.sourceHandle === handleId)
            )
        )
    }

    const { handleAddOption, handleRemoveOption, handleUpdateOption } =
        useMenuNodeOptions(id, options)

    return {
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection,

        connections,
        flowRefs,
        options,
        messageRef,
        expandedOptionIndex,
        setExpandedOptionIndex,

        handleAddOption,
        handleRemoveOption,
        handleUpdateOption,

        connectOption,
        disconnectOption,
    }
}
