// src\hooks\useNodeConnections.ts

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Connection, Edge } from 'reactflow'
import { toast } from 'sonner'
import { validateConnection } from '@/lib/flowValidations'
import { useFlowStore } from '@/store/useFlowStore'
import {
    getVariantHandleId,
    useVariantTypeStore,
} from '@/store/useVariantTypeStore'

/**
 * 🧠 useNodeConnections (versión global unificada)
 * ----------------------------------------------------
 * Hook reutilizable para gestionar conexiones entre nodos en ReactFlow.
 * - Usa IDs globales para handles: nodeId::variantType::option-key
 * - Evita duplicados entre nodos y mantiene consistencia en JSON
 * - Compatible con todos los tipos de nodo (startNode, menuNode, etc.)
 */
export function useNodeConnections(nodeId: string) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const { getVariantType } = useVariantTypeStore()
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Calcular nodos disponibles (sin incluir el actual ni startNode)
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
     * 🧩 Verificar si ya existe una conexión
     */
    const hasConnection = (targetId: string, handleId?: string) =>
        edges.some(
            (e) =>
                e.source === nodeId &&
                e.target === targetId &&
                (handleId ? e.sourceHandle === handleId : true)
        )

    /**
     * ⚙️ Crear una conexión en tiempo real con IDs globales
     */
    const createConnection = (targetId: string, handleId?: string) => {
        const sourceNode = nodes.find((n) => n.id === nodeId)
        const targetNode = nodes.find((n) => n.id === targetId)
        if (!sourceNode || !targetNode) return

        // 🧠 Determinar tipo de variante (para crear handle global)
        const variantType = getVariantType(nodeId)
        const globalHandleId =
            handleId && handleId.includes('::')
                ? handleId
                : handleId
                  ? getVariantHandleId(nodeId, variantType, handleId)
                  : null

        // 🚫 Validación global
        const connection: Connection = {
            source: nodeId ?? null,
            target: targetId ?? null,
            sourceHandle: globalHandleId ?? null,
            targetHandle: null,
        }
        const isValid = validateConnection(connection, nodes)
        if (!isValid) return

        // ⚠️ Evitar duplicados exactos
        if (hasConnection(targetId, globalHandleId ?? undefined)) return

        // 🧩 Edge ID global estable
        const edgeId = `edge-${nodeId}-${targetId}-${globalHandleId ?? 'default'}`

        const newEdge: Edge = {
            id: edgeId,
            source: nodeId,
            target: targetId,
            type: 'smoothstep',
            sourceHandle: globalHandleId ?? undefined,
            animated: true,
            style: { strokeWidth: 2 },
        }

        setEdges((prev) => [...prev, newEdge])

        toast.success(
            `✅ Conectado con ${targetNode.data?.label || targetId}${
                globalHandleId ? ` (${globalHandleId})` : ''
            }`
        )
    }

    /**
     * ❌ Eliminar una conexión existente
     */
    const removeConnection = (targetId: string, handleId?: string) => {
        const variantType = getVariantType(nodeId)
        const globalHandleId =
            handleId && handleId.includes('::')
                ? handleId
                : handleId
                  ? getVariantHandleId(nodeId, variantType, handleId)
                  : null

        if (!hasConnection(targetId, globalHandleId ?? undefined)) return

        setEdges((prev) =>
            prev.filter(
                (e) =>
                    !(
                        e.source === nodeId &&
                        e.target === targetId &&
                        (globalHandleId
                            ? e.sourceHandle === globalHandleId
                            : true)
                    )
            )
        )

        toast.info(
            `❌ Desconectado de ${targetId}${
                globalHandleId ? ` (${globalHandleId})` : ''
            }`
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
