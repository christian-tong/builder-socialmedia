// src\store\useVariantFlowSync.ts

'use client'

import { useEffect, useRef } from 'react'
import {
    useVariantTypeStore,
    getVariantHandleId,
} from '@/store/useVariantTypeStore'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * ⚙️ useVariantFlowSync (versión mejorada y segura)
 * ------------------------------------------------------
 * - Sincroniza dinámicamente las conexiones (edges) de cada nodo tipo menú.
 * - Crea handles únicos por nodo y variante: nodeId::variantType::option-key.
 * - Evita duplicados y mantiene integridad del flujo al importar/exportar JSON.
 * - Usa debounce y comparación profunda para mejorar el rendimiento.
 */
export function useVariantFlowSync() {
    const { edges, setEdges, nodes } = useFlowStore()
    const { nodes: variantNodes, setVariantConditions } = useVariantTypeStore()

    // 🧠 Snapshot previo de edges para evitar renders innecesarios
    const lastEdgesRef = useRef<string>('')

    useEffect(() => {
        if (!variantNodes || Object.keys(variantNodes).length === 0) return
        if (!nodes || nodes.length === 0) return

        let timeout: NodeJS.Timeout | null = null

        const syncEdges = () => {
            const validNodeIds = new Set(nodes.map((n) => n.id))
            const validEdges: any[] = []

            // 🔹 Recorre cada nodo con variantes
            Object.entries(variantNodes).forEach(([nodeId, variantData]) => {
                if (!variantData || !variantData.conditions) return

                const cleanConditions: Record<string, string> = {}
                const variantType = variantData.type || 'quick_reply'

                // 🔸 Generar edges únicos por nodo y condición
                Object.entries(variantData.conditions).forEach(
                    ([key, targetId]) => {
                        if (!targetId || !validNodeIds.has(targetId)) return

                        // ✅ ID de handle globalmente único
                        const handleId = getVariantHandleId(
                            nodeId,
                            variantType,
                            key
                        )

                        // ✅ Edge ID único para prevenir duplicados
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

                // 🧹 Solo actualiza condiciones si hay diferencias reales
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

            // 🪄 Fusionar edges no interactivos (otros tipos de conexión)
            const nonInteractiveEdges = edges.filter(
                (e) => !e.sourceHandle?.includes('option-')
            )

            const updatedEdges = [...nonInteractiveEdges, ...validEdges]

            // 🔍 Serializar para comparar sin hacer renders infinitos
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

        // ⏱️ Debounce de 200 ms para suavidad durante movimientos
        timeout = setTimeout(syncEdges, 200)

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [variantNodes, nodes]) // ⚠️ NO incluir edges para evitar loops
}
