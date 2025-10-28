// src\store\useNodeConfigStore.ts

'use client'

import { toast } from 'sonner'
import { create } from 'zustand'
import { exportToJsonFile, importFromJsonFile } from '@/lib/jsonExportImport'
import { useFlowStore } from './useFlowStore'
import { usePendingConnectionsStore } from './usePendingConnectionsStore'

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

    /** 🧩 Actualizar datos del nodo activo (comparación superficial para evitar renders innecesarios) */
    updateNodeData: (id, newData) => {
        const current = get().selectedNode
        if (!current || current.id !== id) return

        const prevData = current.data ?? {}

        const hasChanged = Object.keys(newData).some(
            (key) => prevData[key] !== newData[key]
        )

        if (!hasChanged) return

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

    /** 💾 Guardar cambios del nodo en el flujo (aplica conexiones diferidas) */
    saveNodeDataToFlow: () => {
        const { selectedNode, saveCallbacks } = get()
        if (!selectedNode) {
            toast.warning('⚠️ No hay nodo seleccionado para guardar.')
            return
        }

        const callback = saveCallbacks[selectedNode.id]
        const { id, data } = selectedNode

        // 🧠 Ejecutar callback personalizado si existe
        if (callback) {
            try {
                callback()
            } catch (err) {
                console.error(
                    `❌ Error ejecutando callback de guardado del nodo ${id}:`,
                    err
                )
                toast.error('Error al guardar los cambios del nodo')
                return
            }
        }

        // 🧩 Actualizar nodo dentro del flujo global
        const { nodes, edges, setNodes, setEdges } = useFlowStore.getState()

        const exists = nodes.some((n) => n.id === id)
        if (!exists) {
            console.warn(
                `⚠️ Nodo con ID ${id} no encontrado al intentar guardar.`
            )
            return
        }

        const updatedNodes = nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )

        setNodes(updatedNodes)
        console.log(`✅ Nodo ${id} actualizado en el flujo`, data)

        // 🔗 APLICAR CONEXIONES DIFERIDAS (drafts)
        try {
            const { getSourceDrafts, clearSource } =
                usePendingConnectionsStore.getState()
            const drafts = getSourceDrafts(id)

            if (drafts.length > 0) {
                console.groupCollapsed(
                    `🔗 Aplicando ${drafts.length} conexiones diferidas del nodo ${id}`
                )
                console.table(drafts, ['sourceId', 'handleId', 'targetId'])

                const newEdges = [...edges]

                for (const d of drafts) {
                    if (d.targetId && d.targetId !== '') {
                        const edgeId = `${d.sourceId}-${d.handleId}-${d.targetId}`

                        // Evita duplicados
                        const alreadyExists = newEdges.some(
                            (e) => e.id === edgeId
                        )
                        if (!alreadyExists) {
                            newEdges.push({
                                id: edgeId,
                                source: d.sourceId,
                                target: d.targetId,
                                sourceHandle: d.handleId,
                                type: 'smoothstep',
                            })
                            console.log(`✅ Edge creado: ${edgeId}`)
                        }
                    }
                }

                setEdges(newEdges)
                clearSource(id)
                console.groupEnd()
                console.log(`🧹 Drafts de ${id} aplicados y limpiados`)
            }
        } catch (err) {
            console.error('⚠️ Error aplicando drafts diferidos:', err)
        }

        toast.success('💾 Cambios guardados correctamente')
    },

    /** 🧠 Registrar callback de guardado (uno por nodo) */
    registerSaveCallback: (nodeId, callback) => {
        set((state) => ({
            saveCallbacks: { ...state.saveCallbacks, [nodeId]: callback },
        }))
        console.log(`📌 Callback de guardado registrado para nodo: ${nodeId}`)
    },

    /** 🧹 Eliminar callback de guardado (al desmontar formulario) */
    unregisterSaveCallback: (nodeId) =>
        set((state) => {
            const { [nodeId]: _, ...rest } = state.saveCallbacks
            console.log(`🧽 Callback eliminado para nodo: ${nodeId}`)
            return { saveCallbacks: rest }
        }),

    /** 🧼 Limpia todos los callbacks registrados (seguridad global) */
    clearAllSaveCallbacks: () => {
        console.log('🧹 Limpiando todos los callbacks de guardado')
        set({ saveCallbacks: {} })
    },

    /** 📤 Exportar configuración actual del nodo */
    exportConfig: () => {
        const node = get().selectedNode
        if (!node) {
            toast.warning('⚠️ No hay nodo seleccionado para exportar.')
            return
        }

        exportToJsonFile(node, 'builderSocialMedia')
        toast.success(`✅ Nodo ${node.id} exportado correctamente`)
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
