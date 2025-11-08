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
 * 🧠 useNodeConnections (v6.6 — TypeSafe Sync + AutoEdge Reflow)
 * ------------------------------------------------------------------------
 * ✅ Compatible con FlowAutoEdgeSync, DynamicNodeConnectionsAccordion
 * ✅ Corrige tipado (Connection.sourceHandle: string | null)
 * ✅ Previene duplicados y valida conexión
 * ✅ Crea edges con color dinámico según tipo / handle
 * ✅ Sincroniza automáticamente los stores cuando cambian edges
 */

export function useNodeConnections(nodeId?: string, debug = false) {
    const { edges, nodes, setEdges, getConnectedNodes } = useFlowStore()
    const { getVariantType } = useVariantTypeStore()

    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 📊 Nodos disponibles (excluye el mismo y el startNode)
    const availableNodes = useMemo(() => {
        return nodeId
            ? nodes.filter((n) => n.id !== nodeId && n.type !== 'startNode')
            : nodes.filter((n) => n.type !== 'startNode')
    }, [nodes, nodeId])

    // 🔁 Sincroniza nodos previos y siguientes
    useEffect(() => {
        if (!nodeId) return
        const { prev, next } = getConnectedNodes(nodeId)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, nodeId, getConnectedNodes])

    /** 🔎 Verifica si ya existe una conexión */
    const hasConnection = (targetId: string, handleId?: string) => {
        if (!nodeId) return false
        return edges.some(
            (e) =>
                e.source === nodeId &&
                e.target === targetId &&
                (handleId ? e.sourceHandle === handleId : true)
        )
    }

    /** ⚙️ Crea una conexión con detección automática del tipo de handle */
    const createConnection = (targetId: string, handleId?: string) => {
        if (!nodeId) return

        const sourceNode = nodes.find((n) => n.id === nodeId)
        const targetNode = nodes.find((n) => n.id === targetId)
        if (!sourceNode || !targetNode) return

        const simpleHandles = ['onTrue', 'onFalse', 'onError', 'in', 'out']
        const isSimple = simpleHandles.includes(handleId ?? '')
        const variantType = getVariantType(nodeId)

        const globalHandleId = isSimple
            ? handleId
            : handleId
              ? getVariantHandleId(nodeId, variantType, handleId)
              : null

        const connection: Connection = {
            source: nodeId,
            target: targetId,
            sourceHandle: globalHandleId ?? null,
            targetHandle: null,
        }

        // 🧩 Validación
        const isValid = validateConnection(connection, nodes)
        if (!isValid) {
            debug &&
                console.warn(`❌ Conexión inválida: ${nodeId} → ${targetId}`)
            return
        }

        // 🧱 Previene duplicados
        if (hasConnection(targetId, globalHandleId ?? undefined)) {
            debug &&
                console.log(
                    `⚠️ Conexión duplicada evitada: ${nodeId} → ${targetId}`
                )
            return
        }

        // 🎨 Color dinámico según tipo
        let color = '#94a3b8'
        if (handleId === 'onTrue') color = '#22c55e'
        else if (handleId === 'onFalse') color = '#ef4444'
        else if (handleId === 'onError') color = '#facc15'
        else if (variantType === 'list') color = '#0ea5e9'
        else if (variantType === 'quick_reply') color = '#8b5cf6'
        else if (variantType === 'GETDATA') color = '#f59e0b'
        else if (variantType === 'SIMPLETEXT') color = '#10b981'

        const newEdge: Edge = {
            id: `edge-${nodeId}-${targetId}-${globalHandleId ?? 'default'}`,
            source: nodeId,
            target: targetId,
            type: 'smoothstep',
            sourceHandle: globalHandleId ?? null,
            animated: true,
            style: { strokeWidth: 2, stroke: color },
        }

        setEdges((prev) => [...prev, newEdge])
        toast.success(
            `✅ Conectado ${nodeId} → ${targetNode.data?.label || targetId}${
                globalHandleId ? ` (${globalHandleId})` : ''
            }`
        )
        debug && console.log('🧩 Nueva conexión creada:', newEdge)
    }

    /** ❌ Elimina una conexión existente */
    const removeConnection = (targetId: string, handleId?: string) => {
        if (!nodeId) return
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
            `❌ Desconectado ${nodeId} → ${targetId}${
                globalHandleId ? ` (${globalHandleId})` : ''
            }`
        )
        debug && console.log(`🔌 Conexión eliminada: ${nodeId} → ${targetId}`)
    }

    /** 🔀 Alterna conexión (checkbox o select múltiple) */
    const toggleConnection = (
        targetId: string,
        checked: boolean,
        handleId?: string
    ) => {
        if (checked) createConnection(targetId, handleId)
        else removeConnection(targetId, handleId)
    }

    /** 🧩 Crea una conexión solo si no existe */
    const createConnectionIfMissing = (targetId: string, handleId?: string) => {
        if (!nodeId) return
        const exists = hasConnection(targetId, handleId)
        if (!exists) createConnection(targetId, handleId)
    }

    /* ---------------------------------------------------------------------- */
    /* 🔄 Extra opcional: sincronización automática con cambios de edges       */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        if (!nodeId) return
        const { next } = getConnectedNodes(nodeId)
        setNextNodes(next.map((n) => n.data?.label || n.id))
        if (debug)
            console.log(
                `🧭 Sync automático de conexiones → ${nodeId}: ${next.length} edges`
            )
    }, [edges, nodeId, getConnectedNodes, debug])

    return {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        createConnection,
        removeConnection,
        toggleConnection,
        createConnectionIfMissing,
    }
}

/* -------------------------------------------------------------------------- */
/* 🌐 Export global para integraciones externas (FlowAutoEdgeSync, etc.)      */
/* -------------------------------------------------------------------------- */
import { useFlowStore as globalFlowStore } from '@/store/useFlowStore'

export function createConnectionIfMissingGlobal(
    sourceId: string,
    targetId: string,
    handleId?: string
) {
    const { edges, setEdges } = globalFlowStore.getState()
    const exists = edges.some(
        (e) =>
            e.source === sourceId &&
            e.target === targetId &&
            (handleId ? e.sourceHandle === handleId : true)
    )
    if (exists) return

    const newEdge: Edge = {
        id: `edge-${sourceId}-${targetId}-${handleId ?? 'default'}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        sourceHandle: handleId ?? null,
        animated: true,
        style: { strokeWidth: 2, stroke: '#fbbf24' },
    }

    setEdges([...edges, newEdge])
    console.log(
        `⚡ [AutoEdgeSync] ${sourceId} → ${targetId} (${handleId ?? ''})`
    )
}
