// src\hooks\useMenuNodeSync.ts
// src/hooks/useMenuNodeSync.ts
'use client'

import { useEffect } from 'react'
import type { Edge, Node } from 'reactflow'
import { toast } from 'sonner'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import type { MenuNodeData, MenuNodeOption } from './useMenuNodeForm'

export function useMenuNodeSync(
    id: string,
    data: MenuNodeData,
    options: MenuNodeOption[],
    setConnections: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >,
    setFlowRefs: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
    const { edges, nodes, setEdges } = useFlowStore()
    const { updateNodeData } = useNodeConfigStore()

    useEffect(() => {
        const conns: Record<number, string> = {}
        const refs: Record<string, string> = {
            onTrue: '—',
            onFalse: '—',
            onError: '—',
        }

        const safeOptions = Array.isArray(options) ? [...options] : []
        const updatedData: MenuNodeData = { ...data, options: safeOptions }

        let changed = false
        let removedEdges: string[] = []
        const activeEdges = edges.filter((e) => e.source === id)

        // 🧹 1️⃣ Limpieza de campos desconectados
        ;(['onTrue', 'onFalse', 'onError'] as const).forEach((key) => {
            const exists = activeEdges.some((e) => e.sourceHandle === key)
            if (!exists && updatedData[key]) {
                updatedData[key] = ''
                changed = true
            }
        })

        // 🧩 2️⃣ Limpieza de opciones sin conexión
        safeOptions.forEach((opt, i) => {
            const handleId = `option-${i}`
            const exists = activeEdges.some((e) => e.sourceHandle === handleId)
            if (!exists && opt.next) {
                opt.next = ''
                changed = true
            }
        })

        // 🔄 3️⃣ Reconstrucción de conexiones activas
        activeEdges.forEach((edge: Edge) => {
            const handle = edge.sourceHandle ?? ''
            const targetNode = nodes.find((n: Node) => n.id === edge.target)
            const label = targetNode?.data?.label || edge.target || '—'

            if (handle.startsWith('option-')) {
                const index = parseInt(handle.split('-')[1] ?? '-1', 10)

                // ⚠️ Edge inválido (referencia a opción inexistente)
                if (index < 0 || index >= safeOptions.length) {
                    removedEdges.push(edge.id)
                    return
                }

                // ✅ Edge válido
                conns[index] = label
                const option = safeOptions[index]
                if (option.next !== edge.target) {
                    option.next = edge.target
                    changed = true
                }
            }

            // 🎯 onTrue/onFalse/onError
            if (['onTrue', 'onFalse', 'onError'].includes(handle)) {
                refs[handle] = label
                if (updatedData[handle] !== edge.target) {
                    updatedData[handle] = edge.target
                    changed = true
                }
            }
        })

        // 🧹 4️⃣ Eliminar edges inválidos del flujo global
        if (removedEdges.length > 0) {
            setEdges((prev) => prev.filter((e) => !removedEdges.includes(e.id)))
            toast.info('🧹 Edges huérfanos eliminados', {
                description: `${removedEdges.length} conexiones inválidas fueron removidas automáticamente.`,
            })
        }

        // 💾 5️⃣ Guardar cambios en el nodo
        if (changed) {
            try {
                updateNodeData(id, updatedData)
            } catch (err: any) {
                toast.error('❌ Error al actualizar nodo', {
                    description: err?.message ?? 'Error desconocido',
                })
            }
        }

        // 6️⃣ Actualizar referencias locales
        setConnections(conns)
        setFlowRefs(refs)
    }, [id, nodes, options.length, JSON.stringify(edges)])
}
