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
        const { edges } = get()
        const countBetween = edges.filter(
            (e) => e.source === sourceId && e.target === targetId
        ).length

        const offset = countBetween * 8 // píxeles de separación entre edges

        const newEdge: Edge = {
            id: `edge-${sourceId}-${targetId}-${handleId || 'default'}`,
            source: sourceId,
            target: targetId,
            sourceHandle: handleId,
            animated: true,
            type: 'smoothstep',
            style: {
                strokeWidth: 1.8,
                stroke: '#6b7280',
                offset,
            },
        }

        set({ edges: [...edges, newEdge] })
    },
    exportFlow: () => {
        const { nodes, edges } = get()

        // 🧩 Exportar nodos y edges con forma y posición preservadas
        const formattedNodes = nodes.map((n) => ({
            ...n,
            positionAbsolute: n.positionAbsolute ?? n.position,
            dragging: false,
            selected: false,
        }))

        const formattedEdges = edges.map((e, index) => ({
            ...e,
            zIndex: index, // controla orden de renderizado
            animated: e.animated ?? true,
            style: {
                ...e.style,
                strokeWidth: e.style?.strokeWidth ?? 1.8,
            },
        }))

        exportToJsonFile(
            { nodes: formattedNodes, edges: formattedEdges },
            'builderSocialMedia'
        )

        toast.success('✅ Flujo exportado correctamente (con geometría)')
    },
    importFlow: async (file: File) => {
        try {
            const parsed = await importFromJsonFile<any>(file)
            if (!parsed) return null

            // 🧩 Caso 1: ReactFlow
            if (Array.isArray(parsed.nodes)) {
                // 🧩 Preservar layout original si existe
                const nodesWithLayout = parsed.nodes.map((n: any) => ({
                    ...n,
                    position: n.positionAbsolute ?? n.position,
                }))

                // 🧩 Restaurar edges tal cual (manteniendo curvatura, estilo, zIndex)
                const edgesWithLayout =
                    parsed.edges?.map((e: any) => ({
                        ...e,
                        animated: e.animated ?? true,
                        type: e.type ?? 'smoothstep',
                        style: e.style ?? { strokeWidth: 1.8 },
                    })) ?? []

                set({ nodes: nodesWithLayout, edges: edgesWithLayout })
                toast.success('✅ Flujo importado (React Flow con layout)')
                return { nodes: nodesWithLayout, edges: edgesWithLayout }
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
