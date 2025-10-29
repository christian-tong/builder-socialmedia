// src\lib\edgeUtils.ts

'use client'

import type { Connection, Edge, Node } from 'reactflow'
import { useFlowStore } from '@/store/useFlowStore'
import { validateConnection } from '@/lib/flowValidations'

/**
 * Crea un edge si no existe (sin usar hooks).
 * Seguro para llamar desde callbacks de Zustand o cualquier lugar.
 */
export function createConnectionIfMissing(
    sourceId: string,
    targetId: string,
    handleId?: string
) {
    if (!sourceId || !targetId) return

    const { edges, nodes, setEdges } = useFlowStore.getState()

    const exists = edges.some(
        (e) =>
            e.source === sourceId &&
            e.target === targetId &&
            (handleId ? e.sourceHandle === handleId : true)
    )
    if (exists) return

    const connection: Connection = {
        source: sourceId,
        target: targetId,
        sourceHandle: handleId ?? null,
        targetHandle: null,
    }

    const isValid = validateConnection(connection, nodes as Node[])
    if (!isValid) return

    // Color sugerido según handle
    let color = '#94a3b8'
    if (handleId === 'onTrue') color = '#22c55e'
    else if (handleId === 'onFalse') color = '#ef4444'
    else if (handleId === 'onError') color = '#facc15'

    const edgeId = `edge-${sourceId}-${targetId}-${handleId ?? 'default'}`

    const newEdge: Edge = {
        id: edgeId,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        sourceHandle: handleId ?? undefined,
        animated: true,
        style: { strokeWidth: 2, stroke: color },
    }

    setEdges((prev) => [...prev, newEdge])
}
