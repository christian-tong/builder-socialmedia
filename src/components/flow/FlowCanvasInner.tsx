// src\components\flow\FlowCanvasInner.tsx
'use client'

import React, { useMemo } from 'react'
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
import { FlowStylePanel } from './FlowStylePanel'
import { useVariantFlowSync } from '@/store/useVariantFlowSync'
import { useFlowStore } from '@/store/useFlowStore'
import { useShallow } from 'zustand/react/shallow'

/**
 * 🧩 FlowCanvasInner — versión optimizada para fluidez
 * ------------------------------------------------------
 * - Minimiza renders al arrastrar nodos (60 FPS).
 * - Usa shallow selector para evitar renders globales.
 * - Estilos y handlers memoizados para máxima estabilidad.
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
    const { handlers } = useFlowHandlers()

    // ✅ lee nodos/edges del store sin provocar rerenders
    const nodes = useFlowStore(useShallow((state) => state.nodes))
    const edges = useFlowStore(useShallow((state) => state.edges))

    // 🧠 sincronización controlada (pausada durante drag)
    useVariantFlowSync()

    const bgVariant =
        backgroundType === 'dots'
            ? BackgroundVariant.Dots
            : backgroundType === 'lines'
              ? BackgroundVariant.Lines
              : BackgroundVariant.Cross

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

    const styledEdges: Edge[] = useMemo(
        () =>
            edges.map((e) => ({
                ...e,
                type: edgeType,
                animated: edgeAnimated,
                markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
                style: {
                    ...(e.style ?? {}),
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                    strokeDasharray: dash,
                },
            })),
        [edges, edgeType, edgeAnimated, edgeColor, edgeWidth, dash]
    )

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
