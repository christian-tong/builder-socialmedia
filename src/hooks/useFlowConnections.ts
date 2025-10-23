// src\hooks\useFlowConnections.ts

import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🔗 Hook: Maneja conexiones visuales de opciones en React Flow
 * -------------------------------------------------------------
 * Permite conectar o desconectar opciones (QuickReply, List, etc.)
 * con otros nodos visualmente.
 */
export function useFlowConnections(nodeId: string) {
    const { edges, setEdges } = useFlowStore()

    const connectOption = (optionIndex: number, targetId: string) => {
        const handleId = `option-${optionIndex}`
        const edgeId = `edge-${nodeId}-${targetId}-${handleId}`

        const exists = edges.some(
            (e) =>
                e.id === edgeId ||
                (e.source === nodeId &&
                    e.sourceHandle === handleId &&
                    e.target === targetId)
        )

        if (!exists) {
            setEdges((prev) => [
                ...prev,
                {
                    id: edgeId,
                    source: nodeId,
                    target: targetId,
                    sourceHandle: handleId,
                    animated: true,
                    style: { strokeWidth: 2 },
                },
            ])
        }
    }

    const disconnectOption = (optionIndex: number) => {
        const handleId = `option-${optionIndex}`
        setEdges((prev) =>
            prev.filter(
                (e) => !(e.source === nodeId && e.sourceHandle === handleId)
            )
        )
    }

    return { connectOption, disconnectOption }
}
