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

/**
 * 🧩 FlowCanvasInner (v6.6 – Tipado Estricto + Curvatura Dinámica)
 * -------------------------------------------------------------------------
 * - Genera nodos/edges desde JSON (2 fases seguras)
 * - Evita solapamiento de edges con curvatura adaptativa
 * - Recalcula curvas según orientación (vertical/horizontal)
 * - Tipado 100% seguro para baseOffsets y handleLabels
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

    /** 📥 Carga simulada de JSON externo */
    useEffect(() => {
        const input = (window as any).__wicontactJson
        if (input) setUploadedJson(input)
    }, [])

    /** 🧱 Fase 1: Nodos | Fase 2: Edges diferidos */
    useEffect(() => {
        if (!uploadedJson) return
        const { nodes: builtNodes, edges: builtEdges } =
            convertWiContactToFlow(uploadedJson)

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
                `✅ Nodos: ${builtNodes.length} | Edges: ${safeEdges.length}`
            )
        }, 600)

        return () => clearTimeout(timer)
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

    /** 🌈 Etiquetas visuales por handle */
    type HandleKey =
        | 'onTrue'
        | 'onFalse'
        | 'onError'
        | 'onTimeOut'
        | 'onTimeOutError'

    const handleLabels: Record<HandleKey, string> = {
        onTrue: '✅ onTrue',
        onFalse: '❌ onFalse',
        onError: '⚠️ onError',
        onTimeOut: '⏳ onTimeOut',
        onTimeOutError: '💥 onTimeOutError',
    }

    /** 🪄 Offsets curvos para separar edges según orientación */
    const baseOffsets: Record<HandleKey, number> =
        orientation === 'horizontal'
            ? {
                  onTrue: 0.25,
                  onFalse: -0.25,
                  onError: 0.4,
                  onTimeOut: 0.15,
                  onTimeOutError: -0.15,
              }
            : {
                  onTrue: 0.35,
                  onFalse: -0.35,
                  onError: 0.6,
                  onTimeOut: 0.2,
                  onTimeOutError: -0.2,
              }

    /** ✨ Edge Styling Dinámico */
    const styledEdges: Edge[] = useMemo(() => {
        return edges.map((e, i) => {
            const handle = e.sourceHandle as HandleKey | undefined
            const offset = handle
                ? (baseOffsets[handle] ?? 0)
                : i % 2
                  ? 0.25
                  : -0.25
            const curvature =
                orientation === 'horizontal' ? 0.35 + offset : 0.45 + offset
            const label = handle ? handleLabels[handle] : ''

            return {
                ...e,
                type: edgeType,
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
                curvature,
                style: {
                    ...(e.style ?? {}),
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                    strokeDasharray: dash,
                },
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
        handleLabels,
        baseOffsets,
        orientation,
    ])

    return (
        <>
            <FlowStylePanel />
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                nodeTypes={nodeTypes}
                onNodesChange={handlers.onNodesChange}
                onEdgesChange={handlers.onEdgesChange}
                onConnect={handlers.onConnect}
                onDrop={handlers.onDrop}
                onDragOver={handlers.onDragOver}
                fitView
                className="h-full w-full"
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
