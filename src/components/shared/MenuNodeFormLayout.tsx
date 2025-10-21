// src\components\shared\MenuNodeFormLayout.tsx
'use client'

import clsx from 'clsx'
import { Plus, Settings2, Trash2 } from 'lucide-react'
import React from 'react'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { useMenuNodeForm } from '@/hooks/useMenuNodeForm'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

interface MenuNodeFormLayoutProps {
    id: string
    data: Record<string, any>
    color: 'violet' | 'sky'
    variablePlaceholder: string
    variableLabel: string
    hook: ReturnType<typeof useMenuNodeForm>
}

/**
 * 🎨 MenuNodeFormLayout
 * --------------------------------------------------
 * Layout visual compartido entre Menú Principal / Secundario
 * Usa el hook `useMenuNodeForm` para toda la lógica.
 */
export function MenuNodeFormLayout({
    id,
    data,
    color,
    variablePlaceholder,
    variableLabel,
    hook,
}: MenuNodeFormLayoutProps) {
    const {
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection,
        expandedOptionIndex,
        setExpandedOptionIndex,
        connections,
        options,
        messageRef,
        handleAddOption,
        handleRemoveOption,
        handleUpdateOption,
    } = hook

    const { updateNodeData } = useNodeConfigStore()

    const colorText = color === 'violet' ? 'text-violet-600' : 'text-sky-600'
    const colorAccent = color === 'violet' ? 'violet' : 'sky'

    return (
        <div className="flex flex-col gap-5">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className={clsx('text-sm font-semibold', colorText)}>
                    Configuración del Menú{' '}
                    {color === 'violet' ? 'Principal' : 'Secundario'}
                </Label>
                <Badge
                    variant="outline"
                    className={clsx(
                        'px-2 py-0.5 text-[10px]',
                        `border-${colorAccent}-300 bg-${colorAccent}-50 text-${colorAccent}-800`,
                        `dark:border-${colorAccent}-700 dark:bg-${colorAccent}-900/40 dark:text-${colorAccent}-200`
                    )}
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodos conectados */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor={`text-${colorAccent}-700 dark:text-${colorAccent}-300`}
            />
            <NodeConnectionsAccordion
                title="Nodo siguiente"
                nodesList={nextNodes}
                accentColor={`text-${colorAccent}-700 dark:text-${colorAccent}-300`}
            />

            {/* 🔹 Variable */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">{variableLabel}</Label>
                <Input
                    value={data.variable || ''}
                    placeholder={variablePlaceholder}
                    onChange={(e) =>
                        updateNodeData(id, { variable: e.target.value })
                    }
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 📨 Mensaje inicial */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Mensaje inicial</Label>
                <Textarea
                    ref={messageRef}
                    value={data.message || ''}
                    placeholder="Texto que verá el usuario..."
                    onChange={(e) =>
                        updateNodeData(id, { message: e.target.value })
                    }
                    className="min-h-[80px] text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* ⚙️ Control de flujo */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="config">
                    <AccordionTrigger className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                        <Settings2 className="h-4 w-4" />
                        Control de flujo (onTrue / onFalse / onError)
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-3 bg-gray-50 p-3 dark:bg-gray-900/40">
                        {(['onTrue', 'onFalse', 'onError'] as const).map(
                            (key) => (
                                <NodeSelectAccordion
                                    key={key}
                                    title={
                                        key === 'onTrue'
                                            ? '🟢 onTrue (válido)'
                                            : key === 'onFalse'
                                              ? '🟡 onFalse (inválido)'
                                              : '🔴 onError (timeout / error)'
                                    }
                                    availableNodes={availableNodes}
                                    selectedId={data[key]}
                                    handleId={key}
                                    onSelect={(val) =>
                                        updateNodeData(id, { [key]: val })
                                    }
                                    createConnection={(targetId) =>
                                        createConnection(targetId, key)
                                    }
                                    removeConnection={(targetId) =>
                                        removeConnection(targetId, key)
                                    }
                                    accentColor={`text-${colorAccent}-700 dark:text-${colorAccent}-300`}
                                />
                            )
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* 🧩 Opciones dinámicas */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label
                        className={`text-sm font-medium text-${colorAccent}-700 dark:text-${colorAccent}-300`}
                    >
                        Opciones ({options.length})
                    </Label>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOption}
                        className={`bg-${colorAccent}-500 text-white hover:bg-${colorAccent}-600`}
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt, index) => (
                    <Accordion
                        key={index}
                        type="single"
                        collapsible
                        className={`rounded-md border border-${colorAccent}-200 bg-${colorAccent}-50/40 dark:border-gray-700 dark:bg-gray-900/30`}
                        value={
                            expandedOptionIndex === index ? 'open' : undefined
                        }
                        onValueChange={() =>
                            setExpandedOptionIndex(
                                expandedOptionIndex === index ? null : index
                            )
                        }
                    >
                        <AccordionItem value="open">
                            <AccordionTrigger
                                className={`flex justify-between px-3 py-2 text-xs font-semibold text-${colorAccent}-600 dark:text-${colorAccent}-300`}
                            >
                                Opción {index + 1} — {opt.title || 'Sin título'}
                                <span className="font-mono text-[11px] opacity-70">
                                    {connections[index]
                                        ? `→ ${connections[index]}`
                                        : opt.next
                                          ? `→ ${opt.next}`
                                          : '—'}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 px-3 py-3">
                                <Input
                                    value={opt.title}
                                    onChange={(e) =>
                                        handleUpdateOption(
                                            index,
                                            'title',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Título visible"
                                    className="text-sm dark:bg-gray-900/50"
                                />

                                <NodeSelectAccordion
                                    title="Nodo siguiente"
                                    availableNodes={availableNodes}
                                    selectedId={opt.next}
                                    handleId={`option-${index}`}
                                    onSelect={(val) =>
                                        handleUpdateOption(index, 'next', val)
                                    }
                                    createConnection={(targetId) =>
                                        createConnection(
                                            targetId,
                                            `option-${index}`
                                        )
                                    }
                                    removeConnection={(targetId) =>
                                        removeConnection(
                                            targetId,
                                            `option-${index}`
                                        )
                                    }
                                    accentColor={`text-${colorAccent}-700 dark:text-${colorAccent}-300`}
                                />

                                {options.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleRemoveOption(index)
                                        }
                                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />{' '}
                                        Eliminar opción
                                    </Button>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>
        </div>
    )
}
