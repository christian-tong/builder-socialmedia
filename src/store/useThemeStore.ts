// src\store\useThemeStore.ts

/**
 * 🌓 useThemeStore — Store global para el manejo del modo oscuro / claro
 * ================================================================
 * Este store centraliza el estado del tema visual de la aplicación.
 *
 * 🔹 Características:
 * - Controla el modo "light" / "dark" a nivel global.
 * - Persiste la elección del usuario en localStorage.
 * - Sincroniza la clase <html class="dark"> para compatibilidad con Tailwind.
 * - Reacciona instantáneamente en todos los componentes que lo usen.
 *
 * 🧠 Cómo usarlo en tus componentes:
 * ----------------------------------------------------------------
 * 1️⃣ Importar el store
 *    import { useThemeStore } from "@/src/store/useThemeStore";
 *
 * 2️⃣ Leer el tema actual
 *    const { theme } = useThemeStore();
 *    // theme = "dark" o "light"
 *
 * 3️⃣ Alternar entre claro / oscuro
 *    const { toggleTheme } = useThemeStore();
 *    <Button onClick={toggleTheme}>Cambiar tema</Button>
 *
 * 4️⃣ Establecer un tema específico
 *    const { setTheme } = useThemeStore();
 *    setTheme("light"); // fuerza modo claro
 *
 * 💡 Ejemplo:
 * ----------------------------------------------------------------
 * import { useThemeStore } from "@/src/store/useThemeStore";
 *
 * export default function Header() {
 *   const { theme, toggleTheme } = useThemeStore();
 *
 *   return (
 *     <header className={theme === "dark" ? "bg-[#111]" : "bg-white"}>
 *       <button onClick={toggleTheme}>
 *         {theme === "dark" ? "🌞 Claro" : "🌙 Oscuro"}
 *       </button>
 *     </header>
 *   );
 * }
 */

import { create } from 'zustand'

// Tipos permitidos
type Theme = 'light' | 'dark'

// Estructura del estado global
interface ThemeState {
    /** Tema actual de la aplicación ("light" o "dark") */
    theme: Theme

    /** Alterna entre "light" y "dark" */
    toggleTheme: () => void

    /** Fuerza el tema a un valor específico */
    setTheme: (theme: Theme) => void
}

/**
 * ✅ Store global del tema con persistencia automática
 */
export const useThemeStore = create<ThemeState>((set) => ({
    // Estado inicial: lee de localStorage si existe
    theme:
        (typeof window !== 'undefined' &&
            (localStorage.getItem('theme') as Theme)) ||
        'dark',

    /**
     * Alterna el tema actual (dark <-> light)
     */
    toggleTheme: () =>
        set((state) => {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark'

            // Aplica la clase global para que Tailwind cambie estilos
            document.documentElement.classList.toggle(
                'dark',
                newTheme === 'dark'
            )

            // Guarda la preferencia
            localStorage.setItem('theme', newTheme)

            // Actualiza el estado global
            return { theme: newTheme }
        }),

    /**
     * Fuerza un tema específico ("dark" o "light")
     */
    setTheme: (theme: Theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('theme', theme)
        set({ theme })
    },
}))
