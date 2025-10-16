// src\store\useFlowStore.ts

import { create } from "zustand";
import { Node, Edge } from "reactflow";
import { exportToJsonFile, importFromJsonFile } from "@/lib/jsonExportImport";
import { toast } from "sonner";

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  exportFlow: () => void;
  importFlow: (file: File) => Promise<{ nodes: Node[]; edges: Edge[] } | null>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (updater) =>
    set((state) => ({
      nodes: typeof updater === "function" ? updater(state.nodes) : updater,
    })),
  setEdges: (updater) =>
    set((state) => ({
      edges: typeof updater === "function" ? updater(state.edges) : updater,
    })),

  // 📤 Exportar flujo completo
  exportFlow: () => {
    const { nodes, edges } = get();
    if (!nodes || nodes.length === 0) {
      toast.warning("⚠️ No hay nodos en el flujo para exportar.");
      return;
    }
    exportToJsonFile({ nodes, edges }, "builderSocialMedia");
    toast.success("✅ Flujo exportado correctamente");
  },

  // 📥 Importar flujo completo
  importFlow: async (file: File) => {
    const data = await importFromJsonFile<{ nodes: Node[]; edges: Edge[] }>(
      file
    );

    if (!data?.nodes || !Array.isArray(data.nodes)) {
      toast.error("❌ Archivo JSON inválido o sin nodos válidos.");
      return null;
    }

    set({ nodes: data.nodes, edges: data.edges || [] });
    console.log("✅ Flujo importado correctamente:", data);
    toast.success("✅ Flujo importado correctamente");
    return data;
  },
}));
