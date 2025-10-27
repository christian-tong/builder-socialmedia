// src\store\useFlowStyleStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BackgroundType = 'dots' | 'lines'
type EdgeType = 'default' | 'straight' | 'step' | 'smoothstep'
type EdgeAspect = 'solid' | 'dashed' | 'dotted'

interface FlowStyleState {
    backgroundType: BackgroundType

    // Forma geométrica del edge (React Flow types)
    edgeType: EdgeType

    // Apariencia visual extra
    edgeAspect: EdgeAspect
    edgeAnimated: boolean
    edgeColor: string
    edgeWidth: number

    setBackgroundType: (type: BackgroundType) => void
    setEdgeType: (type: EdgeType) => void
    setEdgeAspect: (a: EdgeAspect) => void
    setEdgeAnimated: (v: boolean) => void
    setEdgeColor: (hex: string) => void
    setEdgeWidth: (w: number) => void
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
            edgeAspect: 'solid',
            edgeAnimated: false,
            edgeColor: '#0f0f0f',
            edgeWidth: 2,

            setBackgroundType: (type) => set({ backgroundType: type }),
            setEdgeType: (type) => set({ edgeType: type }),
            setEdgeAspect: (a) => set({ edgeAspect: a }),
            setEdgeAnimated: (v) => set({ edgeAnimated: v }),
            setEdgeColor: (hex) => set({ edgeColor: hex }),
            setEdgeWidth: (w) =>
                set({ edgeWidth: Math.max(1, Math.min(8, w)) }),
        }),
        { name: 'flow-style-store' }
    )
)
