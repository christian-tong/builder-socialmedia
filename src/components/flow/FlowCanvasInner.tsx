// src\components\flow\FlowCanvasInner.tsx

'use client'

import React from 'react'
import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from '@/config/nodesConfig'
import { useFlowHandlers } from '@/hooks/useFlowHandlers'
import { useFlowStyleStore } from '@/store/useFlowStyleStore'
import { useThemeStore } from '@/store/useThemeStore'
import { FlowStylePanel } from './FlowStylePanel'
import { useVariantFlowSync } from '@/store/useVariantFlowSync'

/**
 * 🧩 FlowCanvasInner
 * --------------------------------------------------
 * - Renderiza el canvas principal de React Flow
 * - Aplica fondo, controles y estilos dinámicos
 * - Sincroniza edges de variantes con Zustand en tiempo real
 */
export default function FlowCanvasInner() {
    const { theme } = useThemeStore()
    const { backgroundType } = useFlowStyleStore()
    const { nodes, edges, handlers } = useFlowHandlers()

    // 🧠 Sincroniza Zustand → ReactFlow automáticamente
    useVariantFlowSync()

    const bgVariant =
        backgroundType === 'dots'
            ? BackgroundVariant.Dots
            : backgroundType === 'lines'
              ? BackgroundVariant.Lines
              : BackgroundVariant.Cross

    return (
        <>
            {/* 🎨 Panel lateral de estilo */}
            <FlowStylePanel />

            {/* 🧩 Lienzo principal de flujo */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={handlers.onNodesChange}
                onEdgesChange={handlers.onEdgesChange}
                onConnect={handlers.onConnect}
                onDrop={handlers.onDrop}
                onDragOver={handlers.onDragOver}
                fitView
                className="h-full w-full"
            >
                {/* 🌌 Fondo dinámico */}
                <Background
                    variant={bgVariant}
                    gap={12}
                    size={1}
                    color={theme === 'dark' ? '#333' : '#bbb'}
                />

                {/* 🗺️ MiniMapa */}
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

                {/* 🕹️ Controles */}
                <Controls />
            </ReactFlow>
        </>
    )
}
