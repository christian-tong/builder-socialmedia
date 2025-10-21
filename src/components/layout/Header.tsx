// src\components\layout\Header.tsx

'use client'

import { FileJson, Menu, Moon, Sun, UploadCloud } from 'lucide-react'
import React, { useState } from 'react'
import { GenerateJsonModal } from '@/components/shared/GenerateJsonModal'
import { ImportJsonModal } from '@/components/shared/ImportJsonModal'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import LogoWimprove from '../shared/LogoWimprove'

/**
 * 🔹 Header — Cabecera principal reutilizable
 * -----------------------------------------------------------
 * - Controla el tema oscuro/claro
 * - Permite exportar o importar flujos (WiContact o ReactFlow)
 * - Controla la visibilidad del sidebar
 */
export function Header() {
    const { isDark, toggleTheme } = useTheme()
    const { isOpen, toggleSidebar } = useSidebarStore()
    const { exportFlow } = useFlowStore()

    // Estados de modales
    const [showJsonModal, setShowJsonModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)

    return (
        <>
            <header
                className={cn(
                    'flex items-center justify-between border-b px-6 py-3 transition-colors duration-500',
                    isDark
                        ? 'border-gray-800 bg-[#141416]'
                        : 'border-gray-200 bg-white'
                )}
            >
                {/* 🔹 Lado Izquierdo */}
                <div className="flex items-center gap-3">
                    {/* Botón Sidebar */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={cn(
                            'transition-all duration-300',
                            isDark
                                ? isOpen
                                    ? 'text-indigo-400 hover:bg-gray-800'
                                    : 'text-gray-500 hover:bg-gray-800'
                                : isOpen
                                  ? 'text-indigo-600 hover:bg-gray-200'
                                  : 'text-gray-500 hover:bg-gray-100'
                        )}
                        title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <LogoWimprove height={24} />
                    <h1
                        className={cn(
                            'text-lg font-semibold tracking-tight',
                            isDark ? 'text-gray-200' : 'text-gray-800'
                        )}
                    >
                        Builder SocialMedia
                    </h1>
                </div>

                {/* 🔸 Lado Derecho */}
                <div className="flex items-center gap-2">
                    {/* 📤 Exportar flujo */}
                    <Button
                        onClick={exportFlow}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                        )}
                        title="Exportar flujo a JSON"
                    >
                        <FileJson className="h-4 w-4" />
                        Exportar
                    </Button>

                    {/* 📥 Importar flujo */}
                    <Button
                        onClick={() => setShowImportModal(true)}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-500 hover:bg-blue-600'
                        )}
                        title="Importar flujo desde JSON"
                    >
                        <UploadCloud className="h-4 w-4" />
                        Importar
                    </Button>

                    {/* 🧩 Generar JSON de ejemplo */}
                    <Button
                        onClick={() => setShowJsonModal(true)}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-green-500 hover:bg-green-600'
                        )}
                        title="Generar JSON demo"
                    >
                        <FileJson className="h-4 w-4" />
                        Generar JSON
                    </Button>

                    {/* 🌗 Tema oscuro/claro */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className={cn(
                            'transition-colors duration-300',
                            isDark
                                ? 'text-yellow-300 hover:bg-gray-800'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                        title={isDark ? 'Modo claro' : 'Modo oscuro'}
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </header>

            {/* 🧱 Modales */}
            <GenerateJsonModal
                open={showJsonModal}
                onOpenChange={setShowJsonModal}
            />
            <ImportJsonModal
                open={showImportModal}
                onOpenChange={setShowImportModal}
            />
        </>
    )
}

export default Header
