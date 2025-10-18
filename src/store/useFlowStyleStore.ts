// src\store\useFlowStyleStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BackgroundType = 'dots' | 'lines'
type EdgeType = 'default' | 'straight' | 'step' | 'smoothstep'

interface FlowStyleState {
    backgroundType: BackgroundType
    edgeType: EdgeType
    setBackgroundType: (type: BackgroundType) => void
    setEdgeType: (type: EdgeType) => void
}

/**
 * 🎨 Store global de personalización del canvas de flujo
 * - Persistente con localStorage
 */
export const useFlowStyleStore = create<FlowStyleState>()(
    persist(
        (set) => ({
            backgroundType: 'dots',
            edgeType: 'default',
            setBackgroundType: (type) => set({ backgroundType: type }),
            setEdgeType: (type) => set({ edgeType: type }),
        }),
        { name: 'flow-style-store' }
    )
)
