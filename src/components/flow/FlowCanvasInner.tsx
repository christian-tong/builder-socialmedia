// src/components/flow/FlowCanvasInner.tsx

'use client'

import React, { useMemo, useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    MarkerType,
    type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from '@/config/nodesConfig'
import { useFlowHandlers } from '@/hooks/useFlowHandlers'
import { useFlowStyleStore } from '@/store/useFlowStyleStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { FlowStylePanel } from './FlowStylePanel'
import { useFlowStore } from '@/store/useFlowStore'
import { useShallow } from 'zustand/react/shallow'
import { convertWiContactToFlow } from '@/lib/jsonImporterWiContact'
import { syncNodeCountersFromExisting } from '@/utils/generateNodeId' // 🧮 Import clave

// 🧩 Tipo de edge personalizado
import SmartEdge from '@/components/edges/SmartEdge'

/**
 * 🧠 FlowCanvasInner (v7.2 – Import Sync + SmartEdge)
 * ------------------------------------------------------------
 * ✅ Sincroniza contadores de IDs tras importar JSON
 * ✅ Alterna entre tipos de edge (default, straight, step, smoothstep, smart)
 * ✅ Evita solapamientos visuales y mantiene compatibilidad con SmartEdge
 */
export default function FlowCanvasInner() {
    const { theme } = useThemeStore()
    const {
        backgroundType,
        edgeType,
        edgeAspect,
        edgeAnimated,
        edgeColor,
        edgeWidth,
    } = useFlowStyleStore()
    const { orientation } = useFlowOrientationStore()
    const { handlers } = useFlowHandlers()

    const nodes = useFlowStore(useShallow((s) => s.nodes))
    const edges = useFlowStore(useShallow((s) => s.edges))
    const { setNodes, setEdges } = useFlowStore()

    const [phase, setPhase] = useState<'idle' | 'nodes' | 'edges'>('idle')
    const [uploadedJson, setUploadedJson] = useState<any | null>(null)

    /** 📥 Carga simulada de JSON externo (inyectado en window) */
    useEffect(() => {
        const input = (window as any).__wicontactJson
        if (input) setUploadedJson(input)
    }, [])

    /** 🧱 Fase 1: Nodos | Fase 2: Edges diferidos */
    useEffect(() => {
        if (!uploadedJson) return

        const loadFlow = async () => {
            try {
                console.groupCollapsed(
                    '📦 [Import] Iniciando conversión WiContact → Flow'
                )
                const result = await convertWiContactToFlow(uploadedJson)

                // 🧮 Sincronizar contadores globales tras importar los nodos
                if (Array.isArray(result.nodes) && result.nodes.length > 0) {
                    syncNodeCountersFromExisting(result.nodes)
                }

                const builtNodes = Array.isArray(result.nodes)
                    ? result.nodes
                    : []
                const builtEdges = Array.isArray(result.edges)
                    ? result.edges
                    : []

                setNodes(builtNodes)
                setEdges([])
                setPhase('nodes')

                const timer = setTimeout(() => {
                    const validIds = new Set(builtNodes.map((n) => n.id))
                    const safeEdges = builtEdges.filter(
                        (e) => validIds.has(e.source) && validIds.has(e.target)
                    )
                    setEdges(safeEdges)
                    setPhase('edges')
                    console.info(
                        `✅ Importación completada | Nodos: ${builtNodes.length} | Edges: ${safeEdges.length}`
                    )
                }, 600)

                console.groupEnd()
                return () => clearTimeout(timer)
            } catch (err) {
                console.error('❌ Error al convertir JSON WiContact:', err)
                setNodes([])
                setEdges([])
            }
        }

        loadFlow()
    }, [uploadedJson, setNodes, setEdges])

    /** 🎨 Fondo */
    const bgVariant =
        backgroundType === 'dots'
            ? BackgroundVariant.Dots
            : backgroundType === 'lines'
              ? BackgroundVariant.Lines
              : BackgroundVariant.Cross

    /** 🔳 Tipo de trazo */
    const dash = useMemo(() => {
        switch (edgeAspect) {
            case 'dashed':
                return '8 6'
            case 'dotted':
                return '2 6'
            default:
                return undefined
        }
    }, [edgeAspect])

    /** 🌈 Etiquetas visuales */
    const handleLabels = {
        onTrue: '✅ trueStep',
        onFalse: '❌ falseStep',
        onError: '⚠️ errorStep',
        onTimeOut: '⏳ timeOutStep',
        onTimeOutError: '💥 timeOutError',
    } as const

    /** 🧮 Estilizado dinámico de edges */
    const styledEdges: Edge[] = useMemo(() => {
        if (!Array.isArray(edges)) return []

        // Agrupar edges por (source + handle)
        const grouped: Record<string, Edge[]> = {}
        for (const e of edges) {
            const key = `${e.source}-${e.sourceHandle || 'default'}`
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(e)
        }

        return edges.map((e) => {
            const key = `${e.source}-${e.sourceHandle || 'default'}`
            const group = grouped[key]
            const index = group.indexOf(e)
            const offsetIndex = index - (group.length - 1) / 2
            const handle = e.sourceHandle as keyof typeof handleLabels
            const label = handle ? handleLabels[handle] : ''

            // 🧩 Determina tipo dinámico de edge
            const resolvedType =
                edgeType === 'smart' ? 'smart' : (edgeType as Edge['type'])

            return {
                ...e,
                type: resolvedType,
                animated: edgeAnimated,
                label,
                labelBgPadding: [6, 3],
                labelBgBorderRadius: 4,
                labelBgStyle: {
                    fill: theme === 'dark' ? '#111' : '#fff',
                    color: theme === 'dark' ? '#eee' : '#222',
                    opacity: 0.85,
                    stroke: theme === 'dark' ? '#333' : '#ddd',
                    strokeWidth: 0.5,
                },
                markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
                style: {
                    ...(e.style ?? {}),
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                    strokeDasharray: dash,
                    transition: 'all 0.3s ease',
                },
                data:
                    edgeType === 'smart'
                        ? {
                              offsetIndex,
                              offsetStrength: 40,
                              curvature:
                                  orientation === 'horizontal'
                                      ? 0.35 + Math.abs(offsetIndex) * 0.05
                                      : 0.45 + Math.abs(offsetIndex) * 0.05,
                          }
                        : undefined,
            }
        })
    }, [
        edges,
        edgeType,
        edgeAnimated,
        edgeColor,
        edgeWidth,
        dash,
        theme,
        orientation,
    ])

    /** 🔌 Registro de tipos de edge personalizados */
    const edgeTypes = useMemo(() => ({ smart: SmartEdge }), [])

    return (
        <>
            <FlowStylePanel />
            <ReactFlow
                nodes={Array.isArray(nodes) ? nodes : []}
                edges={Array.isArray(styledEdges) ? styledEdges : []}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={handlers.onNodesChange}
                onEdgesChange={handlers.onEdgesChange}
                onConnect={handlers.onConnect}
                onDrop={handlers.onDrop}
                onDragOver={handlers.onDragOver}
                fitView={false}
                className="h-full w-full transition-all"
            >
                <Background
                    variant={bgVariant}
                    gap={12}
                    size={1}
                    color={theme === 'dark' ? '#333' : '#bbb'}
                />
                <MiniMap
                    position="bottom-left"
                    nodeColor={() => (theme === 'dark' ? '#6366f1' : '#3b82f6')}
                    maskColor={
                        theme === 'dark'
                            ? 'rgba(17,17,19,0.6)'
                            : 'rgba(240,240,240,0.6)'
                    }
                    className={
                        theme === 'dark' ? '!bg-[#111113]' : '!bg-[#f0f0f0]'
                    }
                />
                <Controls />
            </ReactFlow>
        </>
    )
}
