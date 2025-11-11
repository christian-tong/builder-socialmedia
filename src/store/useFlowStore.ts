// src\store\useFlowStore.ts

// src/store/useFlowStore.ts
import type { Edge, Node } from 'reactflow'
import { toast } from 'sonner'
import { create } from 'zustand'
import { applyAutoLayout } from '@/lib/autoLayout'
import { exportToJsonFile, importFromJsonFile } from '@/lib/jsonExportImport'
import { convertWiContactToFlow } from '@/lib/jsonImporterWiContact'
import { syncNodeCountersFromExisting } from '@/utils/generateNodeId' // 🧮 Import agregado

interface FlowState {
    nodes: Node[]
    edges: Edge[]
    setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
    updateNodeOptions: (id: string, options: any[]) => void
    updateNodeColor: (id: string, color: string) => void
    createEdge: (sourceId: string, targetId: string, handleId?: string) => void
    exportFlow: (isPublicar?: boolean) => string | null
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
    exportFlow: (isPublicar = false): string | null => {
        const { nodes, edges } = get()

        if (
            !Array.isArray(nodes) ||
            !Array.isArray(edges) ||
            nodes.length === 0
        ) {
            toast.error('⚠️ No hay nodos para exportar.')
            return null
        }

        const serializedNodes = nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
            width: n.width,
            height: n.height,
            selected: false,
            dragging: false,
        }))

        const serializedEdges = edges.map((e, index) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: e.type,
            animated: e.animated ?? false,
            label: e.label ?? '',
            style: e.style ?? {},
            zIndex: index,
            data: e.data ?? {},
        }))

        const data = { nodes: serializedNodes, edges: serializedEdges }
        const json = JSON.stringify(data, null, 2)

        if (isPublicar) {
            // 👉 modo "publicar": no descarga archivo
            return json
        }

        exportToJsonFile(data, 'builderSocialMedia')
        toast.success('✅ Flujo exportado exactamente como se ve en pantalla')
        return null
    },

    /** 📥 Importador universal (React Flow + WiContact) */
    importFlow: async (file: File) => {
        try {
            const parsed = await importFromJsonFile<any>(file)
            if (!parsed) return null

            // 🧩 Caso 1: ReactFlow (fiel al layout)
            if (Array.isArray(parsed.nodes)) {
                const nodesWithExactPosition = parsed.nodes.map((n: any) => ({
                    ...n,
                    position: n.position, // ✅ posición exacta del JSON
                    width: n.width ?? 180,
                    height: n.height ?? 60,
                }))

                const edgesWithExactStyle =
                    parsed.edges?.map((e: any) => ({
                        ...e,
                        type: e.type ?? 'smoothstep',
                        animated: e.animated ?? false,
                        style: e.style ?? { strokeWidth: 1.8 },
                    })) ?? []

                // 🧮 sincroniza contadores
                if (nodesWithExactPosition.length > 0)
                    syncNodeCountersFromExisting(nodesWithExactPosition)

                set({
                    nodes: nodesWithExactPosition,
                    edges: edgesWithExactStyle,
                })

                toast.success('✅ Flujo importado (layout exacto preservado)')
                toast.message('🔢 Contadores sincronizados (ReactFlow)')

                return {
                    nodes: nodesWithExactPosition,
                    edges: edgesWithExactStyle,
                }
            }

            // 🧩 Caso 2: WiContact
            if (parsed.process?.steps) {
                const result = await convertWiContactToFlow(parsed)
                const nodes = Array.isArray(result.nodes) ? result.nodes : []
                const edges = Array.isArray(result.edges) ? result.edges : []

                const laidOut = applyAutoLayout(nodes, edges, 'vertical')

                // 🧮 Sincroniza contadores
                if (laidOut.length > 0) syncNodeCountersFromExisting(laidOut)

                set({ nodes: laidOut, edges })
                toast.success('✅ Flujo importado (WiContact)')
                toast.message('🔢 Contadores sincronizados (WiContact)')
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
