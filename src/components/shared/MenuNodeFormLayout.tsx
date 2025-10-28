// src\components\shared\MenuNodeFormLayout.tsx

'use client'

import clsx from 'clsx'
import { Settings2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import {
    VariantQuickReplyForm,
    VariantListForm,
} from '@/components/forms/Variants/Menu'
import { getDataVariantsConfig } from '@/config/getDataVariantsConfig'
import type { WiGetDataVariantMap } from '@/types/sj'
import type { useMenuNodeForm } from '@/hooks/useMenuNodeForm'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { Switch } from '@/components/ui/switch'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { usePendingConnectionsStore } from '@/store/usePendingConnectionsStore'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🧩 Estructura base estándar para cada nodo de tipo "getdatacomplete"
 */
const defaultBaseData = {
    onTrue: 'SimpleText0098',
    onError: 'SimpleText0099',
    onFalse: 'SimpleText0098',
    isInteractive: true,
    action: 'getdatacomplete',
    source: 'GetData',
    interactiveVersion: 4,
}

interface MenuNodeFormLayoutProps {
    id: string
    data: Record<string, any>
    color: 'violet' | 'sky'
    variablePlaceholder: string
    variableLabel: string
    hook: ReturnType<typeof useMenuNodeForm>
}

/**
 * 🎨 MenuNodeFormLayout (v2 con guardado diferido)
 * - Sincroniza tipo de variante con Zustand
 * - Registra callback de guardado para aplicar drafts
 * - Aplica edges diferidos en saveNodeDataToFlow()
 */
export function MenuNodeFormLayout({
    id,
    data,
    color,
    variablePlaceholder,
    variableLabel,
    hook,
}: MenuNodeFormLayoutProps) {
    const { prevNodes, nextNodes, availableNodes } = hook

    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()

    const { edges, setEdges } = useFlowStore()
    const { getSourceDrafts, clearSource } = usePendingConnectionsStore()

    const {
        setVariantType,
        getVariantType,
        setVariantAll,
        setVariantOptions,
        setVariantConditions,
    } = useVariantTypeStore()

    console.log('Hi')

    const variantType =
        getVariantType(id) ||
        ((data?.object?.interactive?.type ||
            'quick_reply') as WiGetDataVariantMap['variant'])

    const colorText = color === 'violet' ? 'text-violet-700' : 'text-sky-700'
    const colorAccent = color === 'violet' ? 'violet' : 'sky'

    /** 🧩 Helper para actualizar propiedades anidadas */
    const setDeepValue = (obj: any, path: string, value: any) => {
        const keys = path.split('.')
        const last = keys.pop()!
        const clone = structuredClone(obj)
        let current = clone
        for (const key of keys) {
            if (!current[key]) current[key] = {}
            current[key] = { ...current[key] }
            current = current[key]
        }
        current[last] = value
        return clone
    }

    /** 🚀 Inicialización base */
    useEffect(() => {
        if (!data || !data.object) {
            const defaultObject =
                getDataVariantsConfig[variantType]?.defaultObject ||
                getDataVariantsConfig['quick_reply']?.defaultObject

            const newData = {
                ...defaultBaseData,
                id,
                object: structuredClone(defaultObject),
            }

            updateNodeData(id, newData)
            setVariantAll(id, {
                type: variantType,
                options:
                    (newData.object?.interactive as any)?.options ??
                    (newData.object?.interactive as any)?.items?.[0]?.options ??
                    [],
                conditions: newData.object?.conditions ?? {},
            })
        }
    }, [data, id, updateNodeData, setVariantAll, variantType])

    /** 🔄 Sincroniza tipo en store cuando cambia */
    useEffect(() => {
        if (data?.object?.interactive?.type)
            setVariantType(id, data.object.interactive.type)
    }, [id, data?.object?.interactive?.type, setVariantType])

    /** 💾 Registro de guardado diferido */
    useEffect(() => {
        registerSaveCallback(id, () => {
            console.log(`💾 Guardando nodo diferido: ${id}`)

            // 🔹 Actualiza nodo en el flujo
            updateNodeData(id, data)

            // 🔹 Aplica conexiones diferidas si las hay
            const drafts = getSourceDrafts(id)
            if (drafts.length > 0) {
                console.log(
                    `🔗 Aplicando ${drafts.length} conexiones diferidas`,
                    drafts
                )
                const validEdges = edges.filter((e) => e.source !== id)
                const newEdges = drafts
                    .filter((d) => d.targetId)
                    .map((d) => ({
                        id: `${d.sourceId}-${d.handleId}-${d.targetId}`,
                        source: d.sourceId,
                        sourceHandle: d.handleId,
                        target: d.targetId,
                        type: 'smoothstep',
                    }))

                setEdges([...validEdges, ...newEdges])
                clearSource(id)
            }
        })

        return () => unregisterSaveCallback(id)
    }, [
        id,
        data,
        registerSaveCallback,
        unregisterSaveCallback,
        updateNodeData,
        edges,
        setEdges,
        getSourceDrafts,
        clearSource,
    ])

    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
                <Label className={clsx('text-sm font-semibold', colorText)}>
                    ⚙️ Configuración del Menú
                </Label>
                <Badge
                    variant="outline"
                    className={clsx(
                        'px-2 py-0.5 text-[10px]',
                        `border-${colorAccent}-300 bg-${colorAccent}-100 text-${colorAccent}-800`,
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

            {/* 🔀 Selección de variante */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">
                    Tipo de interacción
                </Label>
                <Select
                    value={variantType}
                    onValueChange={(val: WiGetDataVariantMap['variant']) => {
                        const config = getDataVariantsConfig[val]
                        if (!config) return
                        updateNodeData(id, {
                            ...data,
                            ...defaultBaseData,
                            id,
                            object: structuredClone(config.defaultObject),
                        })
                        setVariantType(id, val)
                    }}
                >
                    <SelectTrigger className="text-sm dark:bg-gray-900/50">
                        <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(getDataVariantsConfig).map(
                            ([key, conf]) => (
                                <SelectItem key={key} value={key}>
                                    {conf.label}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs italic">
                    {getDataVariantsConfig[variantType]?.description}
                </p>
            </div>

            {/* ⚙️ Control de flujo */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="config">
                    <AccordionTrigger className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                        <Settings2 className="h-4 w-4" />
                        Control de flujo (onTrue / onFalse / onError)
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900/40">
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
                                    sourceId={id}
                                    deferred={true}
                                    onSelect={(val: string) =>
                                        updateNodeData(id, { [key]: val })
                                    }
                                    onUnselect={() =>
                                        updateNodeData(id, { [key]: '' })
                                    }
                                    accentColor={`text-${colorAccent}-700 dark:text-${colorAccent}-300`}
                                />
                            )
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* ⚙️ Configuración base */}
            <div className="grid grid-cols-2 gap-4 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                            Interactividad
                        </Label>
                        <Switch
                            checked={!!data.isInteractive}
                            onCheckedChange={(val: boolean) =>
                                updateNodeData(id, { isInteractive: val })
                            }
                            className={clsx(
                                'transition-colors duration-300',
                                !!data.isInteractive
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-gray-400 hover:bg-gray-500'
                            )}
                        />
                    </div>
                    <p className="text-muted-foreground text-xs italic">
                        Habilita o deshabilita las respuestas interactivas.
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium">
                        Versión interactiva
                    </Label>
                    <Input
                        type="number"
                        min={1}
                        value={data.interactiveVersion ?? 4}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateNodeData(id, {
                                interactiveVersion: Number(e.target.value),
                            })
                        }
                        className="text-sm dark:bg-gray-900/50"
                    />
                    <p className="text-muted-foreground text-xs italic">
                        Define la versión del esquema (por defecto 4).
                    </p>
                </div>
            </div>

            {/* 🧩 Campos de variante dinámica */}
            <div
                className={clsx(
                    'rounded-md border p-1 transition-all duration-300',
                    variantType === 'quick_reply'
                        ? 'border-violet-300 bg-violet-50/25 dark:border-violet-800 dark:bg-violet-950/40'
                        : 'border-sky-300 bg-sky-50/25 dark:border-sky-800 dark:bg-sky-950/40'
                )}
            >
                {variantType === 'quick_reply' && (
                    <VariantQuickReplyForm
                        id={id}
                        data={data}
                        availableNodes={availableNodes.map((n: any) => ({
                            id: n.id,
                            label: n.data?.label || n.id,
                        }))}
                        onSelectCondition={(i: number, targetId: string) => {
                            const updated = setDeepValue(
                                data,
                                `object.conditions.${data.object.interactive.options[i].postbackText}`,
                                targetId
                            )
                            updateNodeData(id, updated)
                            setVariantConditions(
                                id,
                                updated.object.conditions ?? {}
                            )
                        }}
                        onChange={(path: string, val: any) => {
                            const updated = setDeepValue(data, path, val)
                            updateNodeData(id, updated)
                            setVariantOptions(
                                id,
                                updated.object.interactive.options ?? []
                            )
                        }}
                    />
                )}

                {variantType === 'list' && (
                    <VariantListForm
                        id={id}
                        data={data}
                        availableNodes={availableNodes.map((n: any) => ({
                            id: n.id,
                            label: n.data?.label || n.id,
                        }))}
                        onSelectCondition={(i: number, targetId: string) => {
                            const updated = setDeepValue(
                                data,
                                `object.conditions.${data.object.interactive.items[0].options[i].postbackText}`,
                                targetId
                            )
                            updateNodeData(id, updated)
                            setVariantConditions(
                                id,
                                updated.object.conditions ?? {}
                            )
                        }}
                        onChange={(path: string, val: any) => {
                            const updated = setDeepValue(data, path, val)
                            updateNodeData(id, updated)
                            setVariantOptions(
                                id,
                                updated.object.interactive.items?.[0]
                                    ?.options ?? []
                            )
                        }}
                    />
                )}
            </div>
        </div>
    )
}
