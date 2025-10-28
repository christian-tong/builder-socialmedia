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
 * 🧠 useNodeConnections (versión híbrida v4)
 * ----------------------------------------------------
 * Hook unificado y seguro para gestionar conexiones.
 * Compatible con:
 * - Nodos simples (ChatBotIARequest, SwitchCondition, etc.)
 * - Nodos interactivos (GetDataComplete, MenuNode, etc.)
 *
 * 🟢 Handles simples: onTrue / onFalse / onError / in
 * 🔵 Handles complejos: nodeId::variantType::optionKey
 */
export function useNodeConnections(nodeId: string) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const { getVariantType } = useVariantTypeStore()

    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Nodos disponibles (excluye el mismo y el startNode)
    const availableNodes = useMemo(
        () => nodes.filter((n) => n.id !== nodeId && n.type !== 'startNode'),
        [nodes, nodeId]
    )

    // 🔁 Sincronizar nodos conectados (previos / siguientes)
    useEffect(() => {
        const { prev, next } = getConnectedNodes(nodeId)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, nodeId, getConnectedNodes])

    /**
     * 🧩 Verifica si ya existe una conexión
     */
    const hasConnection = (targetId: string, handleId?: string) =>
        edges.some(
            (e) =>
                e.source === nodeId &&
                e.target === targetId &&
                (handleId ? e.sourceHandle === handleId : true)
        )

    /**
     * ⚙️ Crea una conexión con detección automática del tipo de handle
     */
    const createConnection = (targetId: string, handleId?: string) => {
        const sourceNode = nodes.find((n) => n.id === nodeId)
        const targetNode = nodes.find((n) => n.id === targetId)
        if (!sourceNode || !targetNode) return

        // 🧩 Determinar si el handle es simple o variante
        const simpleHandles = ['onTrue', 'onFalse', 'onError', 'in', 'out']
        const isSimple = simpleHandles.includes(handleId ?? '')

        const variantType = getVariantType(nodeId)
        const globalHandleId = isSimple
            ? handleId // 🟢 simple
            : handleId
              ? getVariantHandleId(nodeId, variantType, handleId)
              : null

        // 🚫 Validar conexión
        const connection: Connection = {
            source: nodeId,
            target: targetId,
            sourceHandle: globalHandleId ?? null,
            targetHandle: null,
        }
        const isValid = validateConnection(connection, nodes)
        if (!isValid) return

        // ⚠️ Evitar duplicados
        if (hasConnection(targetId, globalHandleId ?? undefined)) return

        // 🎨 Color dinámico según tipo de conexión
        let color = '#94a3b8' // gris por defecto
        if (handleId === 'onTrue') color = '#22c55e'
        else if (handleId === 'onFalse') color = '#ef4444'
        else if (handleId === 'onError') color = '#facc15'
        else if (variantType === 'list') color = '#0ea5e9'
        else if (variantType === 'quick_reply') color = '#8b5cf6'

        // 🧩 ID único global
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
     * ❌ Elimina una conexión existente
     */
    const removeConnection = (targetId: string, handleId?: string) => {
        const variantType = getVariantType(nodeId)
        const simpleHandles = ['onTrue', 'onFalse', 'onError', 'in', 'out']
        const isSimple = simpleHandles.includes(handleId ?? '')
        const globalHandleId = isSimple
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
     * 🔀 Alternar conexión (para switches o checkboxes)
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
