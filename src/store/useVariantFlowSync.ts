// src\store\useVariantFlowSync.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import {
    useVariantTypeStore,
    getVariantHandleId,
} from '@/store/useVariantTypeStore'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * ⚙️ useVariantFlowSync (versión ultra optimizada)
 * ------------------------------------------------------
 * - Sincroniza edges de nodos interactivos (menús / variantes).
 * - Pausa durante arrastre para evitar bloqueos visuales.
 * - Debounce y comparación profunda para fluidez y estabilidad.
 */
export function useVariantFlowSync() {
    const { edges, setEdges, nodes } = useFlowStore()
    const { nodes: variantNodes, setVariantConditions } = useVariantTypeStore()
    const [isDragging, setIsDragging] = useState(false)

    const lastEdgesRef = useRef<string>('')

    // 🖱️ Detecta arrastre global
    useEffect(() => {
        let dragTimer: NodeJS.Timeout | null = null

        const onMouseMove = () => {
            if (dragTimer) clearTimeout(dragTimer)
            setIsDragging(true)
            dragTimer = setTimeout(() => setIsDragging(false), 200)
        }

        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [])

    useEffect(() => {
        if (!variantNodes || Object.keys(variantNodes).length === 0) return
        if (!nodes || nodes.length === 0) return
        if (isDragging) return // ⏸️ evita recalcular durante arrastre

        let timeout: NodeJS.Timeout | null = null

        const syncEdges = () => {
            const validNodeIds = new Set(nodes.map((n) => n.id))
            const validEdges: any[] = []

            Object.entries(variantNodes).forEach(([nodeId, variantData]) => {
                if (!variantData?.conditions) return
                const cleanConditions: Record<string, string> = {}
                const variantType = variantData.type || 'quick_reply'

                Object.entries(variantData.conditions).forEach(
                    ([key, targetId]) => {
                        if (!targetId || !validNodeIds.has(targetId)) return

                        const handleId = getVariantHandleId(
                            nodeId,
                            variantType,
                            key
                        )
                        const edgeId = `edge-${nodeId}-${targetId}-${handleId}`

                        validEdges.push({
                            id: edgeId,
                            source: nodeId,
                            target: targetId,
                            sourceHandle: handleId,
                            animated: true,
                            style: { strokeWidth: 2 },
                            type: 'smoothstep',
                        })

                        cleanConditions[key] = targetId
                    }
                )

                const prevCond = variantData.conditions || {}
                const sameCount =
                    Object.keys(cleanConditions).length ===
                    Object.keys(prevCond).length
                const sameKeys = Object.keys(cleanConditions).every((k) =>
                    Object.prototype.hasOwnProperty.call(prevCond, k)
                )

                if (!sameCount || !sameKeys) {
                    setVariantConditions(nodeId, cleanConditions)
                }
            })

            const nonInteractiveEdges = edges.filter(
                (e) => !e.sourceHandle?.includes('option-')
            )

            const updatedEdges = [...nonInteractiveEdges, ...validEdges]

            const serialized = JSON.stringify(
                updatedEdges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                }))
            )

            if (serialized !== lastEdgesRef.current) {
                lastEdgesRef.current = serialized
                setEdges(updatedEdges)
            }
        }

        // ⏱️ Debounce 200 ms (más fluido)
        timeout = setTimeout(syncEdges, 200)
        return () => timeout && clearTimeout(timeout)
    }, [variantNodes, nodes, isDragging]) // 👈 sin edges para evitar loops
}
