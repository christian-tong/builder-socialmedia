// src\hooks\useFlowHandlers.ts
'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type EdgeChange,
    type Node,
    type NodeChange,
    useReactFlow,
} from 'reactflow'
import { getNodeTemplate } from '@/config/nodeTemplates'
import { applyAutoLayout } from '@/lib/autoLayout'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useFlowStore } from '@/store/useFlowStore'
import { useFlowStyleStore } from '@/store/useFlowStyleStore'
import { useBeforeUnloadConfirm } from './useBeforeUnloadConfirm'

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 40) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

/**
 * 🧠 useFlowHandlers (v6.2 — Layout + Edge Reflow seguro)
 * -------------------------------------------------------
 * - Reordena nodos al cambiar orientación sin solapamiento.
 * - Recalcula edges después del layout final.
 * - Suaviza conexión y evita render prematuro de edges.
 */
export function useFlowHandlers() {
    const { nodes, edges, setNodes, setEdges } = useFlowStore()
    const { edgeType } = useFlowStyleStore()
    const { orientation } = useFlowOrientationStore()
    const { project, fitView } = useReactFlow()

    useBeforeUnloadConfirm(nodes, edges)

    // 🧩 Nodo inicial si no existe
    useEffect(() => {
        if (nodes.length === 0) {
            setNodes([
                {
                    id: 'StartStep0000',
                    type: 'startNode',
                    position: { x: 250, y: 100 },
                    data: { label: 'Inicio del flujo' },
                },
            ])
        }
    }, [nodes, setNodes])

    // 🔁 Mantiene tipo de edge consistente
    useEffect(() => {
        setEdges((eds) => eds.map((e) => ({ ...e, type: edgeType })))
    }, [edgeType, setEdges])

    // 🧭 Reaplica layout y redistribuye edges sin solape
    useEffect(() => {
        if (nodes.length > 0) {
            const layouted = applyAutoLayout(nodes, edges, orientation)
            setNodes(layouted)

            // 🕓 Retrasar reflow de edges hasta que el layout termine
            setTimeout(() => {
                setEdges((prev) =>
                    prev.map((e, i) => ({
                        ...e,
                        style: {
                            ...(e.style ?? {}),
                            opacity: 1,
                            transition: 'all 0.3s ease-out',
                        },
                        curvature: 0.35 + (i % 2 ? 0.15 : -0.15),
                    }))
                )
                fitView({ padding: 0.25 })
            }, 450)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orientation])

    const debouncedSetNodes = useMemo(() => debounce(setNodes, 40), [setNodes])

    const onNodesChange = useCallback(
        (changes: NodeChange[]) =>
            debouncedSetNodes((nds) => applyNodeChanges(changes, nds)),
        [debouncedSetNodes]
    )

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    )

    // 🎯 Conexión segura: solo se une si ambos handles existen
    const onConnect = useCallback(
        (connection: Connection) => {
            const { source, target, sourceHandle } = connection
            const handleExists = document.querySelector(
                `[data-handleid="${source}-${sourceHandle}"]`
            )
            if (!handleExists) return // evita crear edge antes de tiempo

            setEdges((eds) =>
                addEdge(
                    {
                        ...connection,
                        type: edgeType,
                        animated: true,
                        style: {
                            opacity: 0,
                            transition: 'opacity 0.4s ease-in',
                        },
                    },
                    eds
                )
            )

            // Hace aparecer suavemente el edge
            setTimeout(() => {
                setEdges((prev) =>
                    prev.map((e) =>
                        e.source === source && e.target === target
                            ? {
                                  ...e,
                                  style: { ...(e.style ?? {}), opacity: 1 },
                              }
                            : e
                    )
                )
            }, 200)
        },
        [edgeType, setEdges]
    )

    // 🪄 Drag & Drop
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const type = e.dataTransfer.getData('application/reactflow')
            if (!type) return

            const bounds = (e.target as HTMLElement).getBoundingClientRect()
            const position = project({
                x: e.clientX - bounds.left,
                y: e.clientY - bounds.top,
            })

            const COLLISION_RADIUS = 100
            const OFFSET_X = 180
            const OFFSET_Y = 120
            const hasCollision = nodes.some((n) => {
                const dx = Math.abs(n.position.x - position.x)
                const dy = Math.abs(n.position.y - position.y)
                return dx < COLLISION_RADIUS && dy < COLLISION_RADIUS
            })

            const finalPosition = hasCollision
                ? { x: position.x + OFFSET_X, y: position.y + OFFSET_Y }
                : position

            const { id, data } = getNodeTemplate(type)
            const newNode: Node = { id, type, position: finalPosition, data }

            setNodes((prev) => [...prev, newNode])
        },
        [nodes, setNodes, project]
    )

    const handlers = useMemo(
        () => ({
            onNodesChange,
            onEdgesChange,
            onConnect,
            onDrop,
            onDragOver,
        }),
        [onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver]
    )

    return { nodes, edges, handlers }
}
