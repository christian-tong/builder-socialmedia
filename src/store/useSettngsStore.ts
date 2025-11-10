// src\store\useSettngsStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
    darkMode: boolean
    simplifiedView: boolean
    setDarkMode: (value: boolean) => void
    toggleDarkMode: () => void
    setSimplifiedView: (value: boolean) => void
    toggleSimplifiedView: () => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            darkMode: false,
            simplifiedView: false,

            setDarkMode: (value) => set({ darkMode: value }),
            toggleDarkMode: () => set({ darkMode: !get().darkMode }),

            setSimplifiedView: (value) => set({ simplifiedView: value }),
            toggleSimplifiedView: () =>
                set({ simplifiedView: !get().simplifiedView }),
        }),
        {
            name: 'settings-storage', // clave en localStorage
        }
    )
)
