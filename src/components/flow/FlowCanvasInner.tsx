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
import { syncNodeCountersFromExisting } from '@/utils/generateNodeId'
import SmartEdge from '@/components/edges/SmartEdge'

/**
 * 🧠 FlowCanvasInner (v7.7 — LabelSmartStack)
 * ------------------------------------------------------------------
 * ✅ Evita superposición de labels (onTrue, onFalse, onError, onTimeOut, onTimeOutError)
 * ✅ Posicionamiento balanceado según orientación
 * ✅ Mantiene animación, color y curvatura dinámica
 * ✅ Sincroniza importación WiContact + counters
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
                console.groupCollapsed('📦 [Import] WiContact → Flow')
                const result = await convertWiContactToFlow(uploadedJson)

                if (Array.isArray(result.nodes) && result.nodes.length > 0)
                    syncNodeCountersFromExisting(result.nodes)

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

    /** 🎨 Fondo visual */
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
        onTimeOutError: '💥 timeOutErrorStep',
    } as const

    /** 🧮 Estilizado dinámico de edges con contraste y fondo transparente (v7.8) */
    const styledEdges: Edge[] = useMemo(() => {
        if (!Array.isArray(edges)) return []

        const grouped: Record<string, Edge[]> = {}
        for (const e of edges) {
            const key = `${e.source}-${e.sourceHandle || 'default'}`
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(e)
        }

        return edges.map((e) => {
            const handle = e.sourceHandle as keyof typeof handleLabels
            const label = handle ? handleLabels[handle] : ''
            const resolvedType =
                edgeType === 'smart' ? 'smart' : (edgeType as Edge['type'])

            const baseOffset = 22
            let xOffset = 0
            let yOffset = 0

            if (orientation === 'vertical') {
                switch (handle) {
                    case 'onError':
                        yOffset = -baseOffset * 1.4
                        break
                    case 'onTimeOutError':
                        yOffset = baseOffset * 1.4
                        break
                    case 'onTrue':
                        yOffset = -baseOffset * 0.7
                        break
                    case 'onFalse':
                        yOffset = baseOffset * 0.7
                        break
                    case 'onTimeOut':
                        yOffset = baseOffset * 2.2
                        break
                    default:
                        yOffset = 0
                }
            } else {
                switch (handle) {
                    case 'onError':
                        xOffset = -baseOffset * 1.4
                        break
                    case 'onTimeOutError':
                        xOffset = baseOffset * 1.4
                        break
                    case 'onTrue':
                        xOffset = baseOffset * 1.7
                        break
                    case 'onFalse':
                        xOffset = -baseOffset * 0.7
                        break
                    case 'onTimeOut':
                        xOffset = baseOffset * 2.2
                        break
                    default:
                        xOffset = 0
                }
            }

            return {
                ...e,
                type: resolvedType,
                animated: edgeAnimated,
                label,
                // 🧾 Fondo eliminado, solo texto visible
                labelBgPadding: [0, 0],
                labelBgBorderRadius: 0,
                labelBgStyle: {
                    fill: 'transparent',
                    opacity: 0,
                    stroke: 'none',
                },
                labelStyle: {
                    color: theme === 'dark' ? '#fff' : '#111',
                    fontWeight: 500,
                    fontSize: 12,
                    background: 'transparent',
                    padding: '2px 4px',
                    transform: `translate(${xOffset}px, ${yOffset}px)`,
                    transition: 'transform 0.3s ease',
                    pointerEvents: 'none',
                    textShadow:
                        theme === 'dark'
                            ? '0 0 3px rgba(0,0,0,0.5)'
                            : '0 0 2px rgba(255,255,255,0.6)',
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
                              curvature:
                                  orientation === 'horizontal' ? 0.35 : 0.45,
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
