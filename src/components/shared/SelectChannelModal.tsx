// src\components\shared\SelectChannelModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import { useFlowChannelStore } from '@/store/useFlowChannelStore'
import { FLOW_CHANNELS, FlowChannelEnum } from '@/config/flowChannelsConfig'

/**
 * 💬 SelectChannelModal (v2.0 – Config-driven)
 * ----------------------------------------------------------------
 * Carga la lista de canales desde /config/flowChannelsConfig.ts
 * y guarda la selección globalmente usando Zustand.
 */
export function SelectChannelModal() {
    const { channel, setChannel } = useFlowChannelStore()
    const [open, setOpen] = useState(false)
    const [tempValue, setTempValue] = useState<FlowChannelEnum | ''>('')
    const { isDark } = useTheme()

    useEffect(() => {
        if (!channel) setOpen(true)
    }, [channel])

    const handleConfirm = () => {
        if (tempValue) {
            setChannel(tempValue)
            const selected = FLOW_CHANNELS.find((c) => c.value === tempValue)
            toast.success('✅ Canal seleccionado', {
                description: selected
                    ? `${selected.label} habilitado`
                    : 'Canal activado',
            })
            setOpen(false)
        }
    }

    return (
        <Dialog open={open}>
            <DialogContent
                className={cn(
                    'transition-colors sm:max-w-[420px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
                        Selecciona el tipo de flujo
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Select
                        value={tempValue}
                        onValueChange={(val) =>
                            setTempValue(val as FlowChannelEnum)
                        }
                    >
                        <SelectTrigger
                            className={cn(
                                'w-full',
                                isDark
                                    ? 'border-gray-700 bg-[#1b1b1e] text-gray-200'
                                    : 'border-gray-300 bg-white text-gray-800'
                            )}
                        >
                            <SelectValue placeholder="Elige un canal..." />
                        </SelectTrigger>
                        <SelectContent>
                            {FLOW_CHANNELS.map((ch) => (
                                <SelectItem key={ch.value} value={ch.value}>
                                    <div className="flex items-center gap-2">
                                        <ch.icon
                                            className={cn('h-4 w-4', ch.color)}
                                        />
                                        {ch.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="mt-2 flex justify-end gap-2">
                    <Button
                        disabled={!tempValue}
                        onClick={handleConfirm}
                        className={cn(
                            'text-white',
                            isDark
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                        )}
                    >
                        Continuar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SelectChannelModal
