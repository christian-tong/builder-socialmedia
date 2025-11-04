// src\store\useSettngsStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
    darkMode: boolean
    setDarkMode: (value: boolean) => void
    toggleDarkMode: () => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            darkMode: false,
            setDarkMode: (value) => set({ darkMode: value }),
            toggleDarkMode: () => set({ darkMode: !get().darkMode }),
        }),
        {
            name: 'settings-storage', // clave en localStorage
        }
    )
)
