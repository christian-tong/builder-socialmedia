// src\store\useNodeConfigStore.ts

'use client'

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
    /** 🧩 Nodo actualmente seleccionado */
    selectedNode: NodeConfig | null

    /** ⚙️ Seleccionar o limpiar el nodo activo */
    setSelectedNode: (node: NodeConfig | null) => void

    /** 🔄 Actualiza parcialmente los datos del nodo activo */
    updateNodeData: (id: string, newData: Record<string, any>) => void

    /** 🔗 Sincroniza opciones de un formulario con el nodo */
    syncNodeOptions: (id: string, options: any[]) => void

    /** 💾 Guarda los cambios del nodo al flujo global */
    saveNodeDataToFlow: () => void

    /** 📤 Exporta configuración actual del nodo */
    exportConfig: () => void

    /** 📥 Importa configuración desde un archivo */
    importConfig: (file: File) => Promise<void>

    /** 🧠 Callbacks personalizados de guardado por nodo */
    saveCallbacks: Record<string, () => void>

    /** 📝 Registrar una función de guardado asociada a un nodo */
    registerSaveCallback: (nodeId: string, callback: () => void) => void

    /** 🧹 Eliminar un callback de guardado (al desmontar formulario) */
    unregisterSaveCallback: (nodeId: string) => void

    /** 🧼 Limpia todos los callbacks (por seguridad general) */
    clearAllSaveCallbacks: () => void
}

export const useNodeConfigStore = create<NodeConfigState>((set, get) => ({
    selectedNode: null,
    saveCallbacks: {},

    /** 🎯 Seleccionar o limpiar nodo */
    setSelectedNode: (node) => set({ selectedNode: node }),

    /** 🧩 Actualizar datos del nodo activo (versión optimizada con shallow compare) */
    updateNodeData: (id, newData) => {
        const current = get().selectedNode
        if (!current || current.id !== id) return

        const prevData = current.data ?? {}

        // 🧠 Comparación superficial: evita renders innecesarios
        const isSame =
            Object.keys(newData).every(
                (key) => prevData[key] === newData[key]
            ) &&
            Object.keys(prevData).every(
                (key) => !(key in newData) || prevData[key] === newData[key]
            )

        // 🚫 Si los datos son iguales, no actualizamos el estado
        if (isSame) return

        // ✅ Solo actualiza si hay cambios reales
        set({
            selectedNode: {
                ...current,
                data: { ...prevData, ...newData },
            },
        })
    },

    /** 🔁 Sincronizar opciones del formulario con el flujo */
    syncNodeOptions: (id, options) => {
        const flow = useFlowStore.getState()
        flow.updateNodeOptions(id, options)
    },

    /** 💾 Guardar cambios del nodo en el flujo */
    saveNodeDataToFlow: () => {
        const { selectedNode, saveCallbacks } = get()
        if (!selectedNode) return

        // 🔹 Ejecutar callback de guardado del formulario actual (si existe)
        const callback = saveCallbacks[selectedNode.id]
        if (callback) {
            try {
                callback()
            } catch (err) {
                console.error('❌ Error ejecutando callback de guardado:', err)
                toast.error('Error al guardar los cambios del nodo')
            }
        }

        const { id, data } = selectedNode
        const { nodes, setNodes } = useFlowStore.getState()

        // Actualiza solo el nodo editado
        const updated = nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )

        setNodes(updated)
        toast.success('💾 Cambios guardados en el flujo')
    },

    /** 🧠 Registrar callback de guardado */
    registerSaveCallback: (nodeId, callback) =>
        set((state) => ({
            saveCallbacks: { ...state.saveCallbacks, [nodeId]: callback },
        })),

    /** 🧹 Eliminar callback de guardado (para evitar fugas de memoria) */
    unregisterSaveCallback: (nodeId) =>
        set((state) => {
            const { [nodeId]: _, ...rest } = state.saveCallbacks
            return { saveCallbacks: rest }
        }),

    /** 🧼 Limpia todos los callbacks registrados */
    clearAllSaveCallbacks: () => set({ saveCallbacks: {} }),

    /** 📤 Exportar configuración actual del nodo */
    exportConfig: () => {
        const state = get().selectedNode
        if (!state) {
            toast.warning('⚠️ No hay nodo seleccionado para exportar.')
            return
        }
        exportToJsonFile(state, 'builderSocialMedia')
        toast.success('✅ Configuración exportada correctamente')
    },

    /** 📥 Importar configuración desde un archivo JSON */
    importConfig: async (file: File) => {
        try {
            const data = await importFromJsonFile<NodeConfig>(file)
            if (data && data.id && data.data) {
                set({ selectedNode: data })
                console.log('✅ Configuración importada:', data)
                toast.success('✅ Configuración importada correctamente')
            } else {
                toast.error('❌ Archivo JSON inválido o formato no compatible.')
            }
        } catch (err) {
            console.error('❌ Error al importar configuración:', err)
            toast.error('❌ Error al procesar el archivo JSON.')
        }
    },
}))
