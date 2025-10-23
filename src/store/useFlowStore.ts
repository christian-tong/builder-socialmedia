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

    // 🔁 Actualiza las opciones de un nodo en tiempo real
    updateNodeOptions: (id, options) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, options } }
                    : node
            ),
        })
    },

    // 🎨 Cambia el color visual del nodo
    updateNodeColor: (id, color) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, colorVariant: color } }
                    : node
            ),
        })
    },

    // 🔗 Crea un nuevo edge programáticamente
    createEdge: (sourceId, targetId, handleId = undefined) => {
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
        if (!nodes || nodes.length === 0) {
            toast.warning('⚠️ No hay nodos en el flujo para exportar.')
            return
        }
        exportToJsonFile({ nodes, edges }, 'builderSocialMedia')
        toast.success('✅ Flujo exportado correctamente')
    },

    importFlow: async (file: File) => {
        try {
            const parsed = await importFromJsonFile<any>(file)
            if (!parsed) return null

            // 🧩 Caso 1: Formato ReactFlow
            if (parsed.nodes && Array.isArray(parsed.nodes)) {
                try {
                    const laidOutNodes = applyAutoLayout(
                        parsed.nodes,
                        parsed.edges || [],
                        'vertical'
                    )
                    set({ nodes: laidOutNodes, edges: parsed.edges || [] })
                    toast.success('✅ Flujo importado (React Flow)')
                    return { nodes: laidOutNodes, edges: parsed.edges || [] }
                } catch {
                    set({ nodes: parsed.nodes, edges: parsed.edges || [] })
                    toast.success('✅ Flujo importado (React Flow)')
                    return { nodes: parsed.nodes, edges: parsed.edges || [] }
                }
            }

            // 🧩 Caso 2: Formato WiContact
            if (parsed.process?.steps) {
                const { nodes, edges } = convertWiContactToFlow(parsed)
                try {
                    const laidOut = applyAutoLayout(nodes, edges, 'vertical')
                    set({ nodes: laidOut, edges })
                    toast.success('✅ Flujo importado (WiContact)')
                    return { nodes: laidOut, edges }
                } catch {
                    set({ nodes, edges })
                    toast.success('✅ Flujo importado (WiContact)')
                    return { nodes, edges }
                }
            }

            toast.error('❌ El archivo no contiene un formato compatible.')
            return null
        } catch (err) {
            console.error('❌ Error al importar flujo:', err)
            toast.error('❌ No se pudo leer el archivo JSON o está corrupto.')
            return null
        }
    },

    getConnectedNodes: (id: string) => {
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
