// src\store\useVariablesStore.ts

'use client'

import { create } from 'zustand'

export interface VariableEntry {
    key: string
    value: string
}

interface VariablesState {
    variables: Record<string, VariableEntry[]>

    /** 🧩 Obtiene todas las variables globales unificadas */
    getAllVariables: () => Record<string, string>

    /** 💾 Guarda variables de un nodo específico */
    setNodeVariables: (nodeId: string, vars: VariableEntry[]) => void

    /** 📦 Obtiene variables de un nodo */
    getNodeVariables: (nodeId: string) => VariableEntry[]

    /** ➕ Agrega una nueva variable con key autogenerado */
    addVariableToNode: (nodeId: string) => VariableEntry[]

    /** 🧹 Limpia un nodo */
    resetNode: (nodeId: string) => void

    /** 🔄 Limpia todo */
    resetAll: () => void
}

/**
 * 🧩 useVariablesStore
 * --------------------------------------------------------
 * - Genera claves automáticas del tipo `campo_YYYY_MM_DD_HH_MM_SS`
 * - Convierte los valores en MAYÚSCULAS antes de guardarlos
 * - Permite sincronización directa con el formulario VariablesNode
 * - Color base de módulo: #006C67 (verde esmeralda)
 */
export const useVariablesStore = create<VariablesState>((set, get) => ({
    variables: {},

    /** 🔍 Retorna todas las variables fusionadas en un solo objeto */
    getAllVariables: () => {
        const all = get().variables
        const merged: Record<string, string> = {}
        Object.values(all).forEach((list) => {
            list.forEach(({ key, value }) => {
                merged[key] = value.toUpperCase()
            })
        })
        return merged
    },

    /** 💾 Guarda lista completa de variables del nodo */
    setNodeVariables: (nodeId, vars) =>
        set((state) => {
            // 🟢 Forzar valores en mayúsculas antes de guardar
            const normalized = vars.map((v) => ({
                key: v.key,
                value: v.value.toUpperCase(),
            }))
            return {
                variables: { ...state.variables, [nodeId]: normalized },
            }
        }),

    /** 📦 Obtiene las variables de un nodo */
    getNodeVariables: (nodeId) => get().variables[nodeId] ?? [],

    /** ➕ Agrega una nueva variable con key autogenerado */
    addVariableToNode: (nodeId) => {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T.Z]/g, '_')
            .slice(0, 19)
        const newVar: VariableEntry = {
            key: `campo_${timestamp}`,
            value: '',
        }
        const prev = get().variables[nodeId] ?? []
        const updated = [...prev, newVar]
        set((state) => ({
            variables: { ...state.variables, [nodeId]: updated },
        }))
        return updated
    },

    /** 🧹 Elimina las variables de un nodo */
    resetNode: (nodeId) =>
        set((state) => {
            const updated = { ...state.variables }
            delete updated[nodeId]
            return { variables: updated }
        }),

    /** 🔄 Limpieza total */
    resetAll: () => set({ variables: {} }),
}))
