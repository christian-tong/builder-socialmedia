// src\components\shared\SettingsModal.tsx
'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import { Settings2 } from 'lucide-react'
import { useSettingsStore } from '@/store/useSettngsStore'

export function SettingsModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { isDark, setTheme } = useTheme()
    const { darkMode, setDarkMode } = useSettingsStore()

    const handleSave = () => {
        setTheme(darkMode ? 'dark' : 'light')
        toast.success('✅ Configuración guardada', {
            description: `Modo ${darkMode ? 'oscuro' : 'claro'} activado`,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'transition-colors sm:max-w-[420px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Settings2 className="h-5 w-5 text-indigo-500" />
                        Configuración General
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {/* Modo oscuro */}
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="dark-mode"
                            className={cn(
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            )}
                        >
                            Activar modo oscuro
                        </Label>
                        <Switch
                            id="dark-mode"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                        />
                    </div>

                    {/* Aquí se pueden agregar más opciones en el futuro */}
                </div>

                <DialogFooter className="mt-2 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        className={cn(
                            'text-white',
                            isDark
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                        )}
                    >
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsModal
