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
import { useThemeStore } from '@/store/useThemeStore'
import { useFlowStyleStore } from '@/store/useFlowStyleStore'
import { FlowStylePanel } from './FlowStylePanel'
import { useFlowHandlers } from '@/hooks/useFlowHandlers'

/**
 * 🧩 FlowCanvasInner
 * --------------------------------------------------
 * - Contiene el <ReactFlow /> principal
 * - Aplica fondo, controles, eventos y estilo dinámico
 */
export default function FlowCanvasInner() {
    const { theme } = useThemeStore()
    const { backgroundType } = useFlowStyleStore()
    const { nodes, edges, handlers } = useFlowHandlers()

    const bgVariant =
        backgroundType === 'dots'
            ? BackgroundVariant.Dots
            : backgroundType === 'lines'
              ? BackgroundVariant.Lines
              : BackgroundVariant.Cross

    return (
        <>
            <FlowStylePanel />

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
