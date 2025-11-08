// src\hooks\useFlowHandlers.ts'use client'

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type Edge,
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
import { validateConnection } from '@/lib/flowValidations'
import { toast } from 'sonner'

/**
 * 🧠 useFlowHandlers (v7.3 – TypeSafe Manual Edge Sync + Smart Reflow)
 * --------------------------------------------------------------------
 * ✅ Permite creación de edges manuales (drag & connect)
 * ✅ Valida conexiones antes de agregarlas
 * ✅ Evita duplicados y respeta tipo visual (smart, step, etc.)
 * ✅ Suaviza aparición de edges (animación de opacidad)
 * ✅ 100% libre de errores de tipo en TypeScript
 */

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 40) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

export function useFlowHandlers() {
    const { nodes, edges, setNodes, setEdges } = useFlowStore()
    const { edgeType, edgeColor, edgeWidth } = useFlowStyleStore()
    const { orientation } = useFlowOrientationStore()
    const { project, fitView } = useReactFlow()

    useBeforeUnloadConfirm(nodes, edges)

    // 🧱 Nodo inicial por defecto
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
        setEdges((eds) =>
            eds.map((e) => ({
                ...e,
                type: edgeType,
                style: {
                    ...(e.style ?? {}),
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                },
            }))
        )
    }, [edgeType, edgeColor, edgeWidth, setEdges])

    // 🧭 Reaplica layout al cambiar orientación
    useEffect(() => {
        if (nodes.length > 0) {
            const layouted = applyAutoLayout(nodes, edges, orientation)
            setNodes(layouted)

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

    /**
     * 🎯 onConnect — creación manual de edges
     */
    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return

            // 🔒 Normalización segura de tipos
            const source: string = connection.source
            const target: string = connection.target
            const sourceHandle: string | null = connection.sourceHandle ?? null
            const targetHandle: string | null = connection.targetHandle ?? null

            const connectionSafe: Connection = {
                source,
                target,
                sourceHandle,
                targetHandle,
            }

            // ✅ Validar conexión
            const isValid = validateConnection(connectionSafe, nodes)
            if (!isValid) {
                toast.warning('❌ Conexión no permitida entre estos nodos')
                return
            }

            // 🚫 Evitar duplicados
            const exists = edges.some(
                (e) =>
                    e.source === source &&
                    e.target === target &&
                    e.sourceHandle === sourceHandle
            )
            if (exists) {
                toast.info('⚠️ Conexión ya existente')
                return
            }

            // 🧱 Crear edge (tipado seguro)
            const newEdge: Edge = {
                id: `edge-${source}-${target}-${sourceHandle ?? 'default'}`,
                source,
                target,
                sourceHandle,
                targetHandle,
                type: edgeType,
                animated: true,
                style: {
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                },
            }

            setEdges((eds) => addEdge(newEdge, eds))

            // ✨ Fade-in suave
            setTimeout(() => {
                setEdges((prev) =>
                    prev.map((e) =>
                        e.id === newEdge.id
                            ? {
                                  ...e,
                                  style: { ...(e.style ?? {}), opacity: 1 },
                              }
                            : e
                    )
                )
            }, 150)

            toast.success(`🔗 Conectado: ${source} → ${target}`)
            console.info(`✅ Edge creado manualmente: ${newEdge.id}`)
        },
        [edges, nodes, setEdges, edgeType, edgeColor, edgeWidth]
    )

    // 🖱️ Drag & Drop de nodos
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
            toast.success(`🧩 Nodo agregado: ${type}`)
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
