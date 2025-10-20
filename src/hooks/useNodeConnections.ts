// src\hooks\useNodeConnections.ts

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edge } from 'reactflow'
import { toast } from 'sonner'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🧠 useNodeConnections
 * ----------------------------------------------------
 * Hook reutilizable para gestionar conexiones de nodos en ReactFlow.
 * - Compatible con `handleId` (onTrue, onFalse, onError, option-x)
 * - Mantiene compatibilidad con conexiones simples
 * - Obtiene nodos previos/siguientes, crea y elimina edges
 */
export function useNodeConnections(nodeId: string) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Calcular nodos disponibles (sin incluir el actual)
    const availableNodes = useMemo(
        () => nodes.filter((n) => n.id !== nodeId),
        [nodes, nodeId]
    )

    // 🔁 Actualizar nodos conectados (previos y siguientes)
    useEffect(() => {
        const { prev, next } = getConnectedNodes(nodeId)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, nodeId, getConnectedNodes])

    /**
     * 🧩 Verificar si existe una conexión
     * - Si se pasa handleId, se filtra también por sourceHandle
     */
    const hasConnection = (targetId: string, handleId?: string) =>
        edges.some(
            (e) =>
                e.source === nodeId &&
                e.target === targetId &&
                (handleId ? e.sourceHandle === handleId : true)
        )

    /**
     * ⚙️ Crear una conexión (con soporte opcional de handleId)
     */
    const createConnection = (targetId: string, handleId?: string) => {
        if (hasConnection(targetId, handleId)) {
            toast.info(`🔗 Ya existe una conexión con ${targetId}`)
            return
        }

        const newEdge: Edge = {
            id: `edge-${nodeId}-${targetId}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,
            source: nodeId,
            target: targetId,
            type: 'smoothstep',
            ...(handleId ? { sourceHandle: handleId } : {}),
        }

        setEdges((prev) => [...prev, newEdge])
        toast.success(
            `✅ Conectado con ${targetId}${handleId ? ` (${handleId})` : ''}`
        )
    }

    /**
     * ❌ Eliminar una conexión existente
     * - Si se pasa handleId, elimina solo la de ese handle
     */
    const removeConnection = (targetId: string, handleId?: string) => {
        const exists = hasConnection(targetId, handleId)
        if (!exists) return

        setEdges((prev) =>
            prev.filter(
                (e) =>
                    !(
                        e.source === nodeId &&
                        e.target === targetId &&
                        (handleId ? e.sourceHandle === handleId : true)
                    )
            )
        )

        toast.info(
            `❌ Desconectado de ${targetId}${handleId ? ` (${handleId})` : ''}`
        )
    }

    /**
     * 🔀 Alternar conexión
     * - checked → crea la conexión
     * - unchecked → elimina la conexión
     */
    const toggleConnection = (
        targetId: string,
        checked: boolean,
        handleId?: string
    ) => {
        if (checked) createConnection(targetId, handleId)
        else removeConnection(targetId, handleId)
    }

    return {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        createConnection,
        removeConnection,
        toggleConnection,
    }
}
