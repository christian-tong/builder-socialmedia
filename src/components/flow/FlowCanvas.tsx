// src/components/flow/FlowCanvas.tsx

'use client'

import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useThemeStore } from '@/store/useThemeStore'
import FlowCanvasInner from './FlowCanvasInner'
import FlowSidebar from './FlowSidebar'
import { NodeConfigSidebar } from './NodeConfigSidebar'

export default function FlowCanvas() {
    const { theme } = useThemeStore()

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <FlowSidebar />
            <div
                className={`h-full flex-1 transition-colors duration-500 ${
                    theme === 'dark' ? 'bg-[#0d0d0f]' : 'bg-[#f7f7f8]'
                }`}
            >
                <ReactFlowProvider>
                    <FlowCanvasInner />
                </ReactFlowProvider>
                <NodeConfigSidebar />
            </div>
        </div>
    )
}
