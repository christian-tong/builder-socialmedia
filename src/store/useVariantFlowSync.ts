// src\store\useVariantFlowSync.ts

'use client'

import { useEffect } from 'react'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🧩 useVariantFlowSync (versión extendida y segura)
 * ------------------------------------------------------
 * Sincroniza automáticamente los edges de React Flow con
 * los datos de condiciones del store useVariantTypeStore.
 *
 * 🔹 Crea nuevos edges si no existen.
 * 🔹 Elimina edges huérfanos si desaparecen condiciones o nodos.
 * 🔹 Evita bucles infinitos (no depende directamente de edges).
 */
export function useVariantFlowSync() {
    const { edges, setEdges, nodes } = useFlowStore()
    const { nodes: variantNodes, setVariantConditions } = useVariantTypeStore()

    useEffect(() => {
        if (!variantNodes || Object.keys(variantNodes).length === 0) return

        // ✅ Recolectar todos los edges válidos según el store de variantes
        const validEdges: any[] = []
        const validNodeIds = new Set(nodes.map((n) => n.id)) // nodos actuales del flow

        Object.entries(variantNodes).forEach(([nodeId, variantData]) => {
            if (!variantData.conditions) return

            const cleanConditions: Record<string, string> = {}

            Object.entries(variantData.conditions).forEach(
                ([key, targetId]) => {
                    if (!targetId || !validNodeIds.has(targetId)) return // 💀 nodo eliminado

                    const optIndex = variantData.options.findIndex(
                        (o: any) => o.postbackText === key
                    )
                    const handleId = `option-${optIndex >= 0 ? optIndex : key}`
                    const edgeId = `edge-${nodeId}-${targetId}-${handleId}`

                    validEdges.push({
                        id: edgeId,
                        source: nodeId,
                        target: targetId,
                        sourceHandle: handleId,
                        animated: true,
                        style: { strokeWidth: 2 },
                    })

                    // 🔹 Mantener solo las condiciones válidas
                    cleanConditions[key] = targetId
                }
            )

            // 💡 Si hubo condiciones inválidas, se limpia automáticamente el store
            if (
                Object.keys(cleanConditions).length !==
                Object.keys(variantData.conditions).length
            ) {
                console.warn(
                    `🧹 [useVariantFlowSync] Limpiando condiciones inválidas del nodo ${nodeId}`
                )
                setVariantConditions(nodeId, cleanConditions)
            }
        })

        // 🔍 Detectar si hay cambios reales en edges
        const currentIds = new Set(edges.map((e) => e.id))
        const validIds = new Set(validEdges.map((e) => e.id))

        const hasAdded = validEdges.some((e) => !currentIds.has(e.id))
        const hasRemoved = edges.some(
            (e) => e.sourceHandle?.startsWith('option-') && !validIds.has(e.id)
        )

        if (hasAdded || hasRemoved) {
            const updated = [
                // Mantiene edges no interactivos (onTrue/onFalse/onError)
                ...edges.filter((e) => !e.sourceHandle?.startsWith('option-')),
                // Añade los nuevos válidos del store
                ...validEdges,
            ]

            console.log('🧩 [useVariantFlowSync] Actualizando edges:', {
                added: hasAdded,
                removed: hasRemoved,
                total: updated.length,
            })

            setEdges(updated)
        }
    }, [variantNodes, nodes]) // ⚠️ sin 'edges' en dependencias para evitar loops
}
