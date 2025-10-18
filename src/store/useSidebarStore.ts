// src\store\useSidebarStore.ts

/**
 * 🧭 useSidebarStore — Store global del sidebar
 * ============================================================
 * Controla el estado visible/oculto del Sidebar de Flow Builder.
 *
 * 🔹 Características:
 * - Permite alternar visibilidad (abrir/cerrar)
 * - Guarda el estado actual (isOpen)
 * - Sincroniza animaciones suaves sin recargar
 *
 * 🧠 Cómo usarlo:
 * ------------------------------------------------------------
 * import { useSidebarStore } from "@/store/useSidebarStore";
 *
 * const { isOpen, toggleSidebar, openSidebar, closeSidebar } = useSidebarStore();
 */

import { create } from 'zustand'

interface SidebarState {
    /** Si el sidebar está abierto o cerrado */
    isOpen: boolean
    /** Alterna el estado */
    toggleSidebar: () => void
    /** Fuerza a abrir el sidebar */
    openSidebar: () => void
    /** Fuerza a cerrar el sidebar */
    closeSidebar: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: true,

    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
}))
