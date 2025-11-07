// src\store\useFlowStore.ts

import type { Edge, Node } from 'reactflow'
import { toast } from 'sonner'
import { create } from 'zustand'
import { applyAutoLayout } from '@/lib/autoLayout'
import { exportToJsonFile, importFromJsonFile } from '@/lib/jsonExportImport'
import { convertWiContactToFlow } from '@/lib/jsonImporterWiContact'

interface FlowState {
    nodes: Node[]
    edges: Edge[]
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
    updateNodeOptions: (id: string, options: any[]) => void
    updateNodeColor: (id: string, color: string) => void
    createEdge: (sourceId: string, targetId: string, handleId?: string) => void
    exportFlow: () => void
    importFlow: (file: File) => Promise<{ nodes: Node[]; edges: Edge[] } | null>
    getConnectedNodes: (id: string) => { prev: Node[]; next: Node[] }
}

export const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],

    setNodes: (updater) =>
        set((state) => ({
            nodes:
                typeof updater === 'function' ? updater(state.nodes) : updater,
        })),

    setEdges: (updater) =>
        set((state) => ({
            edges:
                typeof updater === 'function' ? updater(state.edges) : updater,
        })),

    updateNodeOptions: (id, options) =>
        set({
            nodes: get().nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, options } } : n
            ),
        }),

    updateNodeColor: (id, color) =>
        set({
            nodes: get().nodes.map((n) =>
                n.id === id
                    ? { ...n, data: { ...n.data, colorVariant: color } }
                    : n
            ),
        }),

    createEdge: (sourceId, targetId, handleId) => {
        if (!targetId || !sourceId) return
        const { edges } = get()
        const exists = edges.some(
            (e) =>
                e.source === sourceId &&
                e.target === targetId &&
                e.sourceHandle === handleId
        )
        if (exists) return

        const newEdge: Edge = {
            id: `edge-${sourceId}-${targetId}-${handleId || 'default'}`,
            source: sourceId,
            target: targetId,
            sourceHandle: handleId,
            animated: true,
            style: { strokeWidth: 2 },
        }

        set({ edges: [...edges, newEdge] })
        toast.success(`🔗 Conectado ${sourceId} → ${targetId}`)
    },

    exportFlow: () => {
        const { nodes, edges } = get()
        exportToJsonFile(
            {
                nodes: Array.isArray(nodes) ? nodes : [],
                edges: Array.isArray(edges) ? edges : [],
            },
            'builderSocialMedia'
        )
        toast.success('✅ Flujo exportado correctamente')
    },

    importFlow: async (file: File) => {
        try {
            const parsed = await importFromJsonFile<any>(file)
            if (!parsed) return null

            // 🧩 Caso 1: ReactFlow
            if (Array.isArray(parsed.nodes)) {
                const laidOut = applyAutoLayout(
                    parsed.nodes,
                    parsed.edges || [],
                    'vertical'
                )
                set({ nodes: laidOut, edges: parsed.edges || [] })
                toast.success('✅ Flujo importado (React Flow)')
                return { nodes: laidOut, edges: parsed.edges || [] }
            }

            // 🧩 Caso 2: WiContact (async)
            if (parsed.process?.steps) {
                const result = await convertWiContactToFlow(parsed)
                const nodes = Array.isArray(result.nodes) ? result.nodes : []
                const edges = Array.isArray(result.edges) ? result.edges : []

                const laidOut = applyAutoLayout(nodes, edges, 'vertical')
                set({ nodes: laidOut, edges })
                toast.success('✅ Flujo importado (WiContact)')
                return { nodes: laidOut, edges }
            }

            toast.error('❌ Formato de flujo no compatible.')
            return null
        } catch (err) {
            console.error('❌ Error al importar flujo:', err)
            toast.error('❌ No se pudo leer el archivo JSON o está corrupto.')
            return null
        }
    },

    getConnectedNodes: (id) => {
        const { nodes, edges } = get()
        const prevIds = edges
            .filter((e) => e.target === id)
            .map((e) => e.source)
        const nextIds = edges
            .filter((e) => e.source === id)
            .map((e) => e.target)
        return {
            prev: nodes.filter((n) => prevIds.includes(n.id)),
            next: nodes.filter((n) => nextIds.includes(n.id)),
        }
    },
}))
