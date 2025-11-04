// src\components\layout\Header.tsx

'use client'

import { FileJson, Menu, Settings2, UploadCloud } from 'lucide-react'
import React, { useState } from 'react'
import { GenerateJsonModal } from '@/components/shared/GenerateJsonModal'
import { ImportJsonModal } from '@/components/shared/ImportJsonModal'
import { SettingsModal } from '@/components/shared/SettingsModal'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import { validateBeforeExport } from '@/lib/flowValidations' // ✅ validación previa
import LogoWimprove from '../shared/LogoWimprove'

export function Header() {
    const { isDark } = useTheme()
    const { toggleSidebar } = useSidebarStore()
    const { exportFlow } = useFlowStore()

    const [showJsonModal, setShowJsonModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    // ⚡ Handler validado para abrir modal JSON
    const handleOpenGenerateJson = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { nodes } = useFlowStore.getState()
        const isValid = validateBeforeExport(nodes)

        if (!isValid) {
            // 🔴 feedback visual breve
            const btn = e.currentTarget
            btn.classList.add('animate-pulse', 'bg-red-600')
            setTimeout(() => {
                btn.classList.remove('animate-pulse', 'bg-red-600')
            }, 600)
            return
        }

        // ✅ solo si es válido
        setShowJsonModal(true)
    }

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
                {/* 🔹 Lado izquierdo */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={cn(
                            'transition-all duration-300',
                            isDark
                                ? 'text-gray-400 hover:bg-gray-800'
                                : 'text-gray-600 hover:bg-gray-100'
                        )}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div
                        className="cursor-pointer"
                        onClick={() => window.location.reload()}
                    >
                        <LogoWimprove height={24} />
                    </div>
                    <h1
                        className={cn(
                            'text-lg font-semibold tracking-tight',
                            isDark ? 'text-gray-200' : 'text-gray-800'
                        )}
                    >
                        Builder SocialMedia
                    </h1>
                </div>

                {/* 🔹 Lado derecho */}
                <div className="flex items-center gap-2">
                    {/* 📤 Exportar */}
                    <Button
                        onClick={exportFlow}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                        )}
                    >
                        <FileJson className="h-4 w-4" />
                        Exportar
                    </Button>

                    {/* 📥 Importar */}
                    <Button
                        onClick={() => setShowImportModal(true)}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-500 hover:bg-blue-600'
                        )}
                    >
                        <UploadCloud className="h-4 w-4" />
                        Importar
                    </Button>

                    {/* 🧠 Generar JSON (validado) */}
                    <Button
                        onClick={handleOpenGenerateJson}
                        className={cn(
                            'flex items-center gap-1 text-white transition-colors',
                            isDark
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-green-500 hover:bg-green-600'
                        )}
                    >
                        <FileJson className="h-4 w-4" />
                        Generar JSON
                    </Button>

                    {/* ⚙️ Configuración */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettingsModal(true)}
                        title="Configuraciones"
                        className={cn(
                            'transition-colors duration-300',
                            isDark
                                ? 'text-indigo-400 hover:bg-gray-800'
                                : 'text-indigo-600 hover:bg-gray-100'
                        )}
                    >
                        <Settings2 className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* 🪟 Modales */}
            <GenerateJsonModal
                open={showJsonModal}
                onOpenChange={setShowJsonModal}
            />
            <ImportJsonModal
                open={showImportModal}
                onOpenChange={setShowImportModal}
            />
            <SettingsModal
                open={showSettingsModal}
                onOpenChange={setShowSettingsModal}
            />
        </>
    )
}

export default Header
