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
  getConnectedNodes: (id: string) => { prev: Node[]; next: Node[] };
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  // 🧩 Setters flexibles
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

  // 🔗 Obtener nodos conectados (anteriores y siguientes)
  getConnectedNodes: (id: string) => {
    const { nodes, edges } = get();

    const prevIds = edges.filter((e) => e.target === id).map((e) => e.source);
    const nextIds = edges.filter((e) => e.source === id).map((e) => e.target);

    const prev = nodes.filter((n) => prevIds.includes(n.id));
    const next = nodes.filter((n) => nextIds.includes(n.id));

    return { prev, next };
  },
}));
