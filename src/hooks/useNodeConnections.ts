// src\hooks\useNodeConnections.ts

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Connection, Edge } from 'reactflow'
import { toast } from 'sonner'
import { validateConnection } from '@/lib/flowValidations'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🧠 useNodeConnections
 * ----------------------------------------------------
 * Hook reutilizable para gestionar conexiones de nodos en ReactFlow.
 * - Compatible con `handleId` (onTrue, onFalse, onError, option-x)
 * - Mantiene compatibilidad con conexiones simples
 * - Obtiene nodos previos/siguientes, crea y elimina edges
 * - 🚫 Evita conectar hacia startNode o desde endNode
 */
export function useNodeConnections(nodeId: string) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Calcular nodos disponibles (sin incluir el actual, ni start/end)
    const availableNodes = useMemo(
        () => nodes.filter((n) => n.id !== nodeId && n.type !== 'startNode'),
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
        const sourceNode = nodes.find((n) => n.id === nodeId)
        const targetNode = nodes.find((n) => n.id === targetId)
        if (!sourceNode || !targetNode) return

        // 🚫 Validación global (usa flowValidations)
        const connection: Connection = {
            source: nodeId ?? null,
            target: targetId ?? null,
            sourceHandle: handleId ?? null,
            targetHandle: null,
        }
        const isValid = validateConnection(connection, nodes)
        if (!isValid) return

        if (hasConnection(targetId, handleId)) {
            toast.info(
                `🔗 Ya existe una conexión con ${targetNode.data?.label || targetId}`
            )
            return
        }

        const newEdge: Edge = {
            id: `edge-${nodeId}-${targetId}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,
            source: nodeId,
            target: targetId,
            type: 'smoothstep',
            sourceHandle: handleId ?? null,
        }

        setEdges((prev) => [...prev, newEdge])
        toast.success(
            `✅ Conectado con ${targetNode.data?.label || targetId}${
                handleId ? ` (${handleId})` : ''
            }`
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
