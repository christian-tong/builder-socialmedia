// src\components\flow\FlowCanvasInner.tsx
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
import { FlowStylePanel } from './FlowStylePanel'
import { useFlowStore } from '@/store/useFlowStore'
import { useShallow } from 'zustand/react/shallow'
import { convertWiContactToFlow } from '@/lib/jsonImporterWiContact'

/**
 * 🧩 FlowCanvasInner (v6.1 Final — Importa JSON dinámico y crea en 2 fases)
 * -------------------------------------------------------------------------
 * - El usuario sube un archivo JSON (WiContact)
 * - Se crean los nodos primero
 * - Luego de 600 ms se crean los edges (cuando ya existen los handles)
 * - Evita el error: "Couldn't create edge for source handle id"
 * - Mantiene compatibilidad total con todos tus nodos
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

    const nodes = useFlowStore(useShallow((s) => s.nodes))
    const edges = useFlowStore(useShallow((s) => s.edges))
    const { setNodes, setEdges } = useFlowStore()

    const [phase, setPhase] = useState<'idle' | 'nodes' | 'edges'>('idle')
    const [uploadedJson, setUploadedJson] = useState<any | null>(null)

    /**
     * 🗂️ Simula el archivo subido:
     * En producción, este JSON llega desde tu uploader (ej. file input, drag & drop, API, etc.)
     * Aquí puedes reemplazar por tu propio hook o prop.
     */
    useEffect(() => {
        async function loadUploadedJson() {
            const input = (window as any).__wicontactJson // ejemplo: variable global
            if (input) setUploadedJson(input)
        }
        loadUploadedJson()
    }, [])

    /**
     * 🧱 1️⃣ Fase: creación de nodos
     * 🔗 2️⃣ Fase: creación de edges diferida
     */
    useEffect(() => {
        if (!uploadedJson) return
        const { nodes: builtNodes, edges: builtEdges } =
            convertWiContactToFlow(uploadedJson)

        // --- FASE 1: crear solo nodos ---
        setNodes(builtNodes)
        setEdges([]) // limpia edges antiguos
        setPhase('nodes')

        // --- FASE 2: crear edges después de que los nodos ya existen ---
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
    }, [uploadedJson])

    // 🎨 Fondo del lienzo
    const bgVariant =
        backgroundType === 'dots'
            ? BackgroundVariant.Dots
            : backgroundType === 'lines'
              ? BackgroundVariant.Lines
              : BackgroundVariant.Cross

    // 🔳 Tipo de trazo (línea normal, discontinua o punteada)
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

    // 🎨 Aplica estilos globales a los edges
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
            {/* 🎨 Panel de estilo */}
            <FlowStylePanel />

            {/* 🌊 Canvas principal */}
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

            {/* 🧭 Estado del builder */}
            <div className="absolute right-4 bottom-2 text-xs opacity-70">
                {uploadedJson
                    ? `Fase actual: ${phase}`
                    : 'Sube un archivo WiContact.json para comenzar'}
            </div>
        </>
    )
}
