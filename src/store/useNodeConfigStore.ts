// src\store\useNodeConfigStore.ts

import { create } from "zustand";

interface NodeConfig {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface NodeConfigState {
  selectedNode: NodeConfig | null;
  setSelectedNode: (node: NodeConfig | null) => void;
  updateNodeData: (id: string, newData: Record<string, any>) => void;
}

export const useNodeConfigStore = create<NodeConfigState>((set, get) => ({
  selectedNode: null,

  setSelectedNode: (node) => set({ selectedNode: node }),

  updateNodeData: (id, newData) => {
    const current = get().selectedNode;
    if (current && current.id === id) {
      set({
        selectedNode: {
          ...current,
          data: { ...current.data, ...newData },
        },
      });
    }
  },
}));
