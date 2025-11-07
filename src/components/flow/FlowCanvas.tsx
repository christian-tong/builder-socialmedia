// src/components/flow/FlowCanvas.tsx

'use client'

import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useThemeStore } from '@/store/useThemeStore'
import FlowCanvasInner from './FlowCanvasInner'
import FlowSidebar from './FlowSidebar'
import { NodeConfigSidebar } from './NodeConfigSidebar'
import { SelectChannelModal } from '@/components/shared/SelectChannelModal'
import { useFlowChannelStore } from '@/store/useFlowChannelStore'

export default function FlowCanvas() {
    const { theme } = useThemeStore()
    const { channel } = useFlowChannelStore()

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Modal de selección inicial */}
            <SelectChannelModal />

            {channel && (
                <>
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
                </>
            )}
        </div>
    )
}
