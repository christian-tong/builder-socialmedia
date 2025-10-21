// src\store\useNodeConfigStore.ts

import { toast } from 'sonner'
import { create } from 'zustand'
import { exportToJsonFile, importFromJsonFile } from '@/lib/jsonExportImport'
import { useFlowStore } from './useFlowStore'

interface NodeConfig {
    id: string
    type: string
    data: Record<string, any>
}

interface NodeConfigState {
    selectedNode: NodeConfig | null
    setSelectedNode: (node: NodeConfig | null) => void
    updateNodeData: (id: string, newData: Record<string, any>) => void
    saveNodeDataToFlow: () => void
    exportConfig: () => void
    importConfig: (file: File) => Promise<void>
}

export const useNodeConfigStore = create<NodeConfigState>((set, get) => ({
    selectedNode: null,

    setSelectedNode: (node) => set({ selectedNode: node }),

    updateNodeData: (id, newData) => {
        const current = get().selectedNode
        if (current && current.id === id) {
            set({
                selectedNode: {
                    ...current,
                    data: { ...current.data, ...newData },
                },
            })
        }
    },

    // 💾 Guardar datos del nodo en el flujo global
    saveNodeDataToFlow: () => {
        const { selectedNode } = get()
        if (!selectedNode) return

        const { id, data } = selectedNode
        const { nodes, setNodes } = useFlowStore.getState()

        const updated = nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )

        setNodes(updated)
        toast.success('💾 Cambios guardados en el flujo')
    },

    // 📤 Exportar configuración
    exportConfig: () => {
        const state = get().selectedNode
        if (!state) {
            toast.warning('⚠️ No hay nodo seleccionado para exportar.')
            return
        }
        exportToJsonFile(state, 'builderSocialMedia')
        toast.success('✅ Configuración exportada correctamente')
    },

    // 📥 Importar configuración
    importConfig: async (file: File) => {
        const data = await importFromJsonFile<NodeConfig>(file)
        if (data && data.id && data.data) {
            set({ selectedNode: data })
            console.log('✅ Configuración importada:', data)
            toast.success('✅ Configuración importada correctamente')
        } else {
            toast.error('❌ Archivo JSON inválido o formato no compatible.')
        }
    },
}))
