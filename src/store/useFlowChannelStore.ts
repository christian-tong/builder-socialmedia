// src\store\useFlowChannelStore.ts

'use client'

import { create } from 'zustand'
import { FlowChannelEnum } from '@/config/flowChannelsConfig'

export type FlowChannelType = FlowChannelEnum | null

interface FlowChannelState {
    channel: FlowChannelType
    setChannel: (type: FlowChannelType) => void
    resetChannel: () => void
}

export const useFlowChannelStore = create<FlowChannelState>((set) => ({
    channel: null,
    setChannel: (type) => set({ channel: type }),
    resetChannel: () => set({ channel: null }),
}))
