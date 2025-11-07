// src\components\layout\Header.tsx
'use client'

import {
    FileJson,
    Menu,
    Settings2,
    UploadCloud,
    Smartphone,
    MessageSquare,
} from 'lucide-react'
import React, { useState } from 'react'
import { GenerateJsonModal } from '@/components/shared/GenerateJsonModal'
import { ImportJsonModal } from '@/components/shared/ImportJsonModal'
import { SettingsModal } from '@/components/shared/SettingsModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import { validateBeforeExport } from '@/lib/flowValidations'
import LogoWimprove from '../shared/LogoWimprove'

import { useFlowChannelStore } from '@/store/useFlowChannelStore'
import { FlowChannelEnum } from '@/config/flowChannelsConfig'

export function Header() {
    const { isDark } = useTheme()
    const { toggleSidebar } = useSidebarStore()
    const { exportFlow } = useFlowStore()
    const { channel } = useFlowChannelStore()

    const [showJsonModal, setShowJsonModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    // ⚡ Handler validado para abrir modal JSON
    const handleOpenGenerateJson = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { nodes } = useFlowStore.getState()
        const isValid = validateBeforeExport(nodes)

        if (!isValid) {
            const btn = e.currentTarget
            btn.classList.add('animate-pulse', 'bg-red-600')
            setTimeout(() => {
                btn.classList.remove('animate-pulse', 'bg-red-600')
            }, 600)
            return
        }

        setShowJsonModal(true)
    }

    // 🧠 Definir visualización del canal actual
    const renderChannelBadge = () => {
        if (!channel) {
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        'px-2 py-1 text-xs font-medium',
                        isDark
                            ? 'border-gray-700 text-gray-400'
                            : 'border-gray-300 text-gray-600'
                    )}
                >
                    🌐 Sin canal
                </Badge>
            )
        }

        if (channel === FlowChannelEnum.WHATSAPP) {
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        'flex items-center gap-1 border-green-400 bg-green-50 px-2 py-1 text-xs font-medium text-green-600 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
                    )}
                >
                    <Smartphone className="h-3.5 w-3.5" />
                    WhatsApp
                </Badge>
            )
        }

        if (channel === FlowChannelEnum.CHATWEB) {
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        'flex items-center gap-1 border-sky-400 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-600 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-300'
                    )}
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat Web
                </Badge>
            )
        }

        return null
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
                <div className="flex items-center gap-3">
                    {/* 🪄 Canal actual */}
                    {renderChannelBadge()}

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

                    {/* 🧠 Generar JSON */}
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
