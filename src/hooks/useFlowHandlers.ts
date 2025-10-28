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

// ✅ Pequeño debounce sin dependencia externa
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 40) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

/**
 * 🧠 useFlowHandlers — versión optimizada y fluida
 * -------------------------------------------------------
 * - Sincroniza nodos y edges con mínimo overhead.
 * - Reduce renderizados durante el arrastre.
 * - Mantiene la compatibilidad total con la lógica actual.
 */
export function useFlowHandlers() {
    const { nodes, edges, setNodes, setEdges } = useFlowStore()
    const { edgeType } = useFlowStyleStore()
    const { orientation } = useFlowOrientationStore()
    const { project, fitView } = useReactFlow()

    // ⚠️ Previene cierre accidental
    useBeforeUnloadConfirm(nodes, edges)

    // 🧠 Crea nodo inicial si no existe
    useEffect(() => {
        if (nodes.length === 0) {
            setNodes([
                {
                    id: 'StartNode0000',
                    type: 'startNode',
                    position: { x: 250, y: 100 },
                    data: {
                        label: 'Inicio del flujo',
                        message: 'Bienvenido al flujo',
                    },
                },
            ])
        }
    }, [nodes, setNodes])

    // 🔁 Actualiza tipo de edges al cambiar estilo
    useEffect(() => {
        setEdges((eds) => eds.map((e) => ({ ...e, type: edgeType })))
    }, [edgeType, setEdges])

    // 🧭 Reordenar automáticamente al cambiar orientación
    useEffect(() => {
        if (nodes.length > 0) {
            const layouted = applyAutoLayout(nodes, edges, orientation)
            setNodes(layouted)
            setTimeout(() => fitView({ padding: 0.2 }), 300)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orientation])

    // ⚙️ Debounced setter para nodos
    const debouncedSetNodes = useMemo(
        () => debounce(setNodes, 40), // ~25 FPS → fluidez óptima
        [setNodes]
    )

    // 🎛️ Handlers principales
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

    const onConnect = useCallback(
        (connection: Connection) =>
            setEdges((eds) => addEdge({ ...connection, type: edgeType }, eds)),
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

            // 📦 Obtener plantilla base del tipo correspondiente
            const { id, data } = getNodeTemplate(type)

            const newNode: Node = {
                id,
                type,
                position: finalPosition,
                data,
            }

            setNodes((prev) => [...prev, newNode])
        },
        [nodes, setNodes, project]
    )

    // 🔒 Memoiza handlers para evitar recreación constante
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
