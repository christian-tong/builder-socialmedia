// src\store\useFlowStyleStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BackgroundType = 'dots' | 'lines'
type EdgeType = 'default' | 'straight' | 'step' | 'smoothstep' | 'smart'
type EdgeAspect = 'solid' | 'dashed' | 'dotted'

interface FlowStyleState {
    backgroundType: BackgroundType
    edgeType: EdgeType
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
 * ------------------------------------------------------
 * - Persistente con localStorage
 * - Compatible con el tipo de edge "smart"
 */
export const useFlowStyleStore = create<FlowStyleState>()(
    persist(
        (set) => ({
            backgroundType: 'dots',
            edgeType: 'step', // 🔹 valor por defecto
            edgeAspect: 'solid',
            edgeAnimated: false,
            edgeColor: '#7A7D7D',
            edgeWidth: 1,

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
