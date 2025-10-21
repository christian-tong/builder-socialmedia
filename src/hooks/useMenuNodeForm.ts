// src\hooks\useMenuNodeForm.ts

'use client'

import { useEffect, useRef, useState } from 'react'
import type { Edge, Node } from 'reactflow'
import { toast } from 'sonner'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🧠 useMenuNodeForm
 * --------------------------------------------------
 * Hook reutilizable para Menú Principal y Secundario.
 * - Sincroniza edges con data.onTrue/onFalse/onError/options.next
 * - Limpia valores al eliminar conexiones
 * - Actualiza inmediatamente la UI al crear o eliminar edges
 */

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

export function useMenuNodeForm(id: string, data: MenuNodeData) {
    const { updateNodeData } = useNodeConfigStore()
    const { edges, nodes } = useFlowStore()

    const {
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection,
    } = useNodeConnections(id)

    // Estado local del formulario
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

    // Asegura que siempre haya un array válido
    const options: MenuNodeOption[] = Array.isArray(data.options)
        ? data.options
        : []

    // 🪶 Autoajuste del textarea
    useEffect(() => {
        const el = messageRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 400) + 'px'
    }, [data.message])

    /**
     * 🔁 Auto-sync bidireccional con edges
     * --------------------------------------------------
     * - Sin early return (se ejecuta incluso sin edges)
     * - Reacciona a cualquier cambio de estructura de edges
     * - Limpia los campos onTrue/onFalse/onError y options.next
     *   cuando se elimina una conexión
     */
    useEffect(() => {
        const conns: Record<number, string> = {}
        const refs: Record<string, string> = {
            onTrue: '—',
            onFalse: '—',
            onError: '—',
        }

        // Copia defensiva del data actual
        const updatedData: MenuNodeData = {
            ...data,
            options: [...options],
        }

        let changed = false
        const activeEdges = edges.filter((e: Edge) => e.source === id)

        // 1️⃣ Limpiar conexiones eliminadas
        ;(['onTrue', 'onFalse', 'onError'] as const).forEach((key) => {
            const exists = activeEdges.some((e) => e.sourceHandle === key)
            if (!exists && updatedData[key]) {
                updatedData[key] = ''
                changed = true
            }
        })

        updatedData.options?.forEach((opt, i) => {
            const handleId = `option-${i}`
            const exists = activeEdges.some((e) => e.sourceHandle === handleId)
            if (!exists && opt.next) {
                opt.next = ''
                changed = true
            }
        })

        // 2️⃣ Volver a llenar las conexiones activas
        activeEdges.forEach((edge: Edge) => {
            const handle = edge.sourceHandle ?? ''
            const targetNode: Node | undefined = nodes.find(
                (n: Node) => n.id === edge.target
            )
            const label = targetNode?.data?.label || edge.target || '—'

            // Opciones dinámicas
            if (handle.startsWith('option-')) {
                const index = parseInt(handle.split('-')[1] ?? '-1', 10)
                if (index >= 0) {
                    conns[index] = label
                    if (updatedData.options?.[index]?.next !== edge.target) {
                        updatedData.options![index].next = edge.target
                        changed = true
                    }
                }
            }

            // onTrue / onFalse / onError
            if (['onTrue', 'onFalse', 'onError'].includes(handle)) {
                refs[handle] = label
                if (updatedData[handle] !== edge.target) {
                    updatedData[handle] = edge.target
                    changed = true
                }
            }
        })

        // 3️⃣ Aplicar cambios solo si hubo modificaciones reales
        if (changed) {
            updateNodeData(id, updatedData)

            // 🧠 Info visual opcional (solo si se eliminó todo)
            if (activeEdges.length === 0) {
                toast.info(
                    `🔄 Todas las conexiones del nodo ${id} fueron eliminadas`
                )
            }
        }

        // 4️⃣ Actualizar el estado local para reflejarlo en tiempo real
        setConnections(conns)
        setFlowRefs(refs)
    }, [
        id,
        nodes,
        options.length,
        JSON.stringify(edges), // 🔥 Detecta cualquier cambio real de contenido
    ])

    /**
     * 🧩 Helpers de opciones dinámicas
     */
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
        // 🔗 Conexiones del flujo
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection,

        // 🧩 Estado local
        expandedOptionIndex,
        setExpandedOptionIndex,
        connections,
        flowRefs,
        options,
        messageRef,

        // ⚙️ Handlers
        handleAddOption,
        handleRemoveOption,
        handleUpdateOption,
    }
}
