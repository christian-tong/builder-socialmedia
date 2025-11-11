// src\components\shared\ImportJsonModal.tsx

'use client'

import {
    CheckCircle2,
    FileJson,
    UploadCloud,
    XCircle,
    Bot,
    RefreshCcw,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useBotsService } from '@/hooks/service/useBotsService'
import type { BotListItem } from '@/services/getListBotsService'

/**
 * 🧩 ImportJsonModal — versión limpia y tipada
 * --------------------------------------------
 * - Usa useBotsService() para manejar data, loading y error
 * - Limpia la vista de lógica redundante
 * - Compatible con TypeScript estricto
 */
export function ImportJsonModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { isDark } = useTheme()
    const { importFlow } = useFlowStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        data: botsList,
        loading: loadingBots,
        error: botsError,
        fetchBots,
    } = useBotsService()

    const [selectedBotId, setSelectedBotId] = useState<string>('')
    const [selectedBot, setSelectedBot] = useState<BotListItem | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState<
        'idle' | 'valid' | 'invalid' | 'checking'
    >('idle')
    const [fileType, setFileType] = useState<'ReactFlow' | 'WiContact' | null>(
        null
    )
    const [activeTab, setActiveTab] = useState<'bots' | 'import'>('bots')

    /** 🚀 Cargar bots al abrir modal */
    useEffect(() => {
        if (open) fetchBots()
    }, [open, fetchBots])

    /** 🧠 Reset modal state */
    const resetAll = (): void => {
        setSelectedFile(null)
        setStatus('idle')
        setFileType(null)
        setSelectedBotId('')
        setSelectedBot(null)
    }

    /** 🧩 Validación segura de JSON */
    const safeParseJSON = (text: string): any | null => {
        try {
            return JSON.parse(text)
        } catch {
            return null
        }
    }

    /** 📦 Cargar archivo JSON manual */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.json')) {
            setStatus('invalid')
            toast.error('El archivo debe tener extensión .json')
            e.target.value = ''
            return
        }

        setStatus('checking')
        try {
            const text = await file.text()
            const data = safeParseJSON(text)

            if (!data) {
                setStatus('invalid')
                toast.error('Archivo JSON corrupto o ilegible ❌')
                return
            }

            if (data?.nodes && Array.isArray(data.nodes)) {
                setFileType('ReactFlow')
                setStatus('valid')
                setSelectedFile(file)
                toast.success('Archivo JSON válido (React Flow)')
            } else if (
                data?.process?.steps &&
                Array.isArray(data.process.steps)
            ) {
                setFileType('WiContact')
                setStatus('valid')
                setSelectedFile(file)
                toast.success('Archivo JSON válido (WiContact)')
            } else {
                setStatus('invalid')
                toast.error('Formato JSON no compatible 🚫')
            }
        } catch {
            setStatus('invalid')
            toast.error('No se pudo leer el archivo correctamente.')
        } finally {
            e.target.value = ''
        }
    }

    /** ⚙️ Ejecutar acción principal (Importar o cargar bot) */
    const handlePrimaryAction = async () => {
        try {
            if (activeTab === 'import') {
                if (!selectedFile || status !== 'valid') {
                    toast.warning('Selecciona un archivo JSON válido.')
                    return
                }

                toast.promise(importFlow(selectedFile), {
                    loading: 'Importando flujo...',
                    success: 'Flujo importado y aplicado correctamente ✅',
                    error: 'Error al importar el flujo 😢',
                })
            } else if (activeTab === 'bots') {
                if (!selectedBot) {
                    toast.warning('Selecciona un bot antes de continuar.')
                    return
                }

                const parsedConfig = safeParseJSON(selectedBot.workflow)
                if (!parsedConfig) {
                    toast.error(
                        `El bot "${selectedBot.description}" tiene configuración inválida.`
                    )
                    return
                }

                const jsonFile = new File(
                    [JSON.stringify(parsedConfig, null, 2)],
                    `${selectedBot.description}.json`,
                    { type: 'application/json' }
                )

                toast.promise(importFlow(jsonFile), {
                    loading: `Cargando configuración del bot "${selectedBot.description}"...`,
                    success: `Flujo de "${selectedBot.description}" cargado ✅`,
                    error: `Error al importar configuración del bot "${selectedBot.description}" 😢`,
                })
            }

            onOpenChange(false)
            resetAll()
        } catch (error: any) {
            console.error('❌ Error en handlePrimaryAction:', error)
            toast.error('Ocurrió un error inesperado al procesar la acción.')
        }
    }

    /** 🔹 Seleccionar bot */
    const handleSelectBot = (id: string): void => {
        setSelectedBotId(id)
        const bot = botsList.find((b) => String(b.idBot) === id)
        setSelectedBot(bot ?? null)
    }

    const isDisabled =
        activeTab === 'import'
            ? status !== 'valid' || !selectedFile
            : !selectedBot

    const buttonLabel =
        activeTab === 'import' ? 'Importar y aplicar' : 'Cargar Bot'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'overflow-hidden transition-colors duration-300 sm:max-w-[560px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <motion.div
                    layout
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                            <UploadCloud className="h-5 w-5 text-blue-500" />
                            Importar Flujo o Seleccionar Bot
                        </DialogTitle>
                    </DialogHeader>

                    {/* --- 🔹 Tabs principales --- */}
                    <Tabs
                        defaultValue="bots"
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as 'bots' | 'import')
                        }
                        className="mt-2 w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-blue-300">
                            <TabsTrigger value="bots">
                                Lista de Bots
                            </TabsTrigger>
                            <TabsTrigger value="import">
                                Importar JSON
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative mt-4 min-h-[220px]">
                            <AnimatePresence mode="wait">
                                {/* --- 🧩 TAB BOTS --- */}
                                {activeTab === 'bots' && (
                                    <motion.div
                                        key="bots"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Bot className="h-5 w-5 text-blue-500" />
                                                <p className="text-sm opacity-80">
                                                    Selecciona un bot existente
                                                    para cargar su flujo.
                                                </p>
                                            </div>

                                            {botsError ? (
                                                <div className="rounded-md border border-red-400 bg-red-100/40 p-3 text-sm text-red-700">
                                                    <p>{botsError}</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2 flex items-center gap-2"
                                                        onClick={() =>
                                                            fetchBots()
                                                        }
                                                    >
                                                        <RefreshCcw className="h-4 w-4" />{' '}
                                                        Reintentar
                                                    </Button>
                                                </div>
                                            ) : loadingBots ? (
                                                <p className="text-muted-foreground animate-pulse text-sm">
                                                    Cargando bots...
                                                </p>
                                            ) : (
                                                <Select
                                                    value={selectedBotId}
                                                    onValueChange={
                                                        handleSelectBot
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccionar bot..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {botsList.map((bot) => (
                                                            <SelectItem
                                                                key={bot.idBot}
                                                                value={String(
                                                                    bot.idBot
                                                                )}
                                                            >
                                                                🤖 {bot.idBot} —{' '}
                                                                {
                                                                    bot.description
                                                                }
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}

                                            {selectedBot && (
                                                <div className="mt-3 rounded-md border p-3 text-sm">
                                                    <p>
                                                        <b>ID:</b>{' '}
                                                        {selectedBot.idBot}
                                                    </p>
                                                    <p>
                                                        <b>Descripción:</b>{' '}
                                                        {
                                                            selectedBot.description
                                                        }
                                                    </p>
                                                    <p>
                                                        <b>Tipo:</b>{' '}
                                                        {selectedBot.botType}
                                                    </p>
                                                    <p>
                                                        <b>AACC:</b>{' '}
                                                        {selectedBot.aacc}
                                                    </p>
                                                    <p>
                                                        <b>Extensión:</b>{' '}
                                                        {
                                                            selectedBot.extensionAssign
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* --- 🧩 TAB IMPORT JSON --- */}
                                {activeTab === 'import' && (
                                    <motion.div
                                        key="import"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div
                                            className={cn(
                                                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors duration-300',
                                                isDark
                                                    ? 'border-gray-700 hover:border-indigo-600'
                                                    : 'border-gray-300 hover:border-indigo-500'
                                            )}
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <input
                                                placeholder="fileRef"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="application/json"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            <FileJson
                                                className={cn(
                                                    'mb-3 h-10 w-10 transition-all duration-200',
                                                    status === 'valid'
                                                        ? 'scale-110 text-green-500'
                                                        : status === 'invalid'
                                                          ? 'text-red-500'
                                                          : status ===
                                                              'checking'
                                                            ? 'animate-pulse text-yellow-500'
                                                            : 'text-gray-400'
                                                )}
                                            />

                                            <p className="text-center text-sm">
                                                {status === 'idle' &&
                                                    'Haz clic o arrastra un archivo .json válido'}
                                                {status === 'checking' &&
                                                    'Verificando archivo...'}
                                                {status === 'valid' && (
                                                    <span className="flex items-center justify-center gap-1 text-green-500">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Archivo válido (
                                                        {fileType})
                                                    </span>
                                                )}
                                                {status === 'invalid' && (
                                                    <span className="flex items-center justify-center gap-1 text-red-500">
                                                        <XCircle className="h-4 w-4" />
                                                        Archivo inválido o
                                                        incompatible
                                                    </span>
                                                )}
                                            </p>

                                            {selectedFile && (
                                                <p className="mt-2 text-xs opacity-70">
                                                    {selectedFile.name}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Tabs>

                    {/* --- 🔹 Footer --- */}
                    <DialogFooter className="mt-6 flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                onOpenChange(false)
                                resetAll()
                            }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            disabled={isDisabled}
                            onClick={handlePrimaryAction}
                            className={cn(
                                'text-white transition-all duration-300',
                                isDark
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            )}
                        >
                            {buttonLabel}
                        </Button>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}

export default ImportJsonModal
