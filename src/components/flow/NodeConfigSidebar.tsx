// src\components\flow\NodeConfigSidebar.tsx

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { SidebarRight } from '@/components/layout/SidebarRight'
import { nodeFormRegistry } from '@/config/nodesForms'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

/**
 * ⚙️ NodeConfigSidebar
 * -------------------------------------------------------
 * - Mantiene animaciones igual que el Sidebar izquierdo.
 * - NO se desmonta al cerrar (permite transiciones reales).
 * - Cierra con tecla Escape.
 */
export function NodeConfigSidebar() {
    const { isDark } = useTheme()
    const { selectedNode, setSelectedNode } = useNodeConfigStore()
    const isOpen = !!selectedNode

    // 🎹 Cerrar con tecla Escape
    useKeyboardShortcut('Escape', () => {
        if (isOpen) setSelectedNode(null)
    })

    // ⛑️ Determinar nodo activo
    const { id, type, data } = selectedNode ?? {}
    const FormComponent = type ? nodeFormRegistry[type] : null

    return (
        <SidebarRight isOpen={isOpen}>
            {/* 🧱 Wrapper con transición fluida */}
            <div
                className={cn(
                    'flex h-full transform flex-col transition-all duration-500 ease-in-out',
                    isOpen
                        ? 'translate-x-0 opacity-100 delay-150'
                        : 'pointer-events-none translate-x-3 opacity-0 delay-0'
                )}
            >
                {/* 🧱 Header animado */}
                <div
                    className={cn(
                        'mb-4 flex origin-right transform items-center justify-between transition-all duration-500 ease-in-out',
                        isOpen
                            ? 'translate-x-0 scale-100 opacity-100 delay-200'
                            : 'translate-x-2 scale-95 opacity-0 delay-0'
                    )}
                >
                    <h3
                        className={cn(
                            'text-sm font-semibold tracking-wider uppercase',
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        )}
                    >
                        ⚙️ Configurar Nodo
                    </h3>

                    <button
                        onClick={() => setSelectedNode(null)}
                        className={cn(
                            'rounded-md px-2 py-1 text-xs transition-colors',
                            isDark
                                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                        )}
                    >
                        ✕
                    </button>
                </div>

                {/* 🔤 Tipo de nodo */}
                {type && (
                    <p
                        className={cn(
                            'mb-4 transform text-xs transition-all duration-500 ease-in-out',
                            isOpen
                                ? 'translate-x-0 opacity-100 delay-300'
                                : 'translate-x-2 opacity-0 delay-0',
                            isDark ? 'text-gray-500' : 'text-gray-400'
                        )}
                    >
                        Tipo: <span className="font-mono">{type}</span>
                    </p>
                )}

                <div
                    className={cn(
                        'flex-1 transform transition-all duration-500 ease-in-out',
                        isOpen
                            ? 'translate-x-0 opacity-100 delay-400'
                            : 'translate-x-2 opacity-0 delay-0'
                    )}
                >
                    {FormComponent ? (
                        <FormComponent id={id} data={data} />
                    ) : (
                        <p className="mt-10 text-center text-sm text-gray-400">
                            Selecciona un nodo para configurarlo
                        </p>
                    )}
                </div>

                {/* 💾 Botón animado */}
                <div
                    className={cn(
                        'transform transition-all duration-500 ease-in-out',
                        isOpen
                            ? 'translate-y-0 opacity-100 delay-500'
                            : 'translate-y-2 opacity-0 delay-0'
                    )}
                >
                    <Button
                        disabled={!isOpen}
                        className={cn(
                            'mt-6 w-full transition-all',
                            isDark
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        )}
                        onClick={() => {
                            const { saveNodeDataToFlow } =
                                useNodeConfigStore.getState()
                            saveNodeDataToFlow()

                            // ✅ Cerrar sidebar
                            setSelectedNode(null)
                        }}
                    >
                        Guardar cambios
                    </Button>
                </div>
            </div>
        </SidebarRight>
    )
}
