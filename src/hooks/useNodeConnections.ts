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
 * 🧠 useNodeConnections (versión híbrida v3)
 * ----------------------------------------------------
 * Hook unificado para gestionar conexiones entre nodos.
 * - Soporta handles simples (onTrue, onFalse, etc.)
 * - Soporta handles complejos (nodeId::variantType::option)
 * - Aplica color automático a edges
 */
export function useNodeConnections(nodeId: string) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const { getVariantType } = useVariantTypeStore()
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Nodos disponibles (sin incluir el actual ni startNode)
    const availableNodes = useMemo(
        () => nodes.filter((n) => n.id !== nodeId && n.type !== 'startNode'),
        [nodes, nodeId]
    )

    // 🔁 Actualizar nodos conectados
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
     * ⚙️ Crear una conexión en tiempo real con IDs correctos
     */
    const createConnection = (targetId: string, handleId?: string) => {
        const sourceNode = nodes.find((n) => n.id === nodeId)
        const targetNode = nodes.find((n) => n.id === targetId)
        if (!sourceNode || !targetNode) return

        // ⚙️ Detectar tipo de handle (simple o variante)
        const variantType = getVariantType(nodeId)
        const isSimpleHandle = ['onTrue', 'onFalse', 'onError', 'in'].includes(
            handleId ?? ''
        )
        const globalHandleId = isSimpleHandle
            ? handleId
            : handleId
              ? getVariantHandleId(nodeId, variantType, handleId)
              : null

        // 🚫 Validación de conexión
        const connection: Connection = {
            source: nodeId,
            target: targetId,
            sourceHandle: globalHandleId ?? null,
            targetHandle: null,
        }

        const isValid = validateConnection(connection, nodes)
        if (!isValid) return

        // ⚠️ Evitar duplicados exactos
        if (hasConnection(targetId, globalHandleId ?? undefined)) return

        // 🎨 Color automático según handle
        const color =
            handleId === 'onTrue'
                ? '#22c55e' // Verde
                : handleId === 'onFalse'
                  ? '#ef4444' // Rojo
                  : '#94a3b8' // Gris por defecto

        // 🧩 Edge ID global estable
        const edgeId = `edge-${nodeId}-${targetId}-${globalHandleId ?? 'default'}`

        const newEdge: Edge = {
            id: edgeId,
            source: nodeId,
            target: targetId,
            type: 'smoothstep',
            sourceHandle: globalHandleId ?? undefined,
            animated: true,
            style: { strokeWidth: 2, stroke: color },
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
        const isSimpleHandle = ['onTrue', 'onFalse', 'onError', 'in'].includes(
            handleId ?? ''
        )
        const globalHandleId = isSimpleHandle
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
     * 🔀 Alternar conexión (checkbox o switch)
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
