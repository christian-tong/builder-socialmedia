// src\components\forms\FormDerivateNode.tsx

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getSkills, Skill } from '@/services/skillService'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

/**
 * 🟨 FormDerivateNode
 * --------------------------------------------------
 * - Muestra y edita skill + mensajes
 * - Incluye acordeones de "Nodo anterior" y "Nodo siguiente"
 * - Usa el mismo estilo de los formularios de menú
 */
export default function FormDerivateNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [skills, setSkills] = useState<Skill[]>([])
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 🔹 Refs de textareas
    const timeoutRef = useRef<HTMLTextAreaElement | null>(null)
    const queueRef = useRef<HTMLTextAreaElement | null>(null)
    const inboundRef = useRef<HTMLTextAreaElement | null>(null)

    // ⚙️ Cargar skills disponibles
    useEffect(() => {
        getSkills().then(setSkills)
    }, [])

    // 🔁 Actualizar nodos conectados
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // 🧠 Auto-ajuste de altura
    const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 400) + 'px'
    }

    useEffect(() => {
        autoResize(timeoutRef)
        autoResize(queueRef)
        autoResize(inboundRef)
    }, [data])

    // 📋 Acordeón reutilizable
    const renderNodeList = (
        title: string,
        nodesList: string[],
        accent: string
    ) => {
        const visible = nodesList.slice(0, 1)
        const hidden = nodesList.slice(1)

        return (
            <div className="flex flex-col gap-2">
                <Label className={`text-sm font-medium ${accent}`}>
                    {title}
                </Label>

                {nodesList.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                        Ninguno conectado
                    </p>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="list">
                            <AccordionTrigger className="flex justify-between rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                {visible[0]}
                                {hidden.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] opacity-70">
                                        {`+${hidden.length} más`}{' '}
                                        <ChevronDown className="h-3 w-3" />
                                    </span>
                                )}
                            </AccordionTrigger>
                            {hidden.length > 0 && (
                                <AccordionContent className="mt-1 space-y-1 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-900">
                                    {hidden.map((n, i) => (
                                        <div
                                            key={i}
                                            className="rounded px-2 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
                                        >
                                            {n}
                                        </div>
                                    ))}
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    </Accordion>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                    Configuración de Derivación
                </Label>
                <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodos conectados con acordeón */}
            <div className="flex flex-col gap-3">
                {renderNodeList(
                    'Nodo anterior',
                    prevNodes,
                    'text-amber-700 dark:text-amber-300'
                )}
                {renderNodeList(
                    'Nodo siguiente',
                    nextNodes,
                    'text-amber-700 dark:text-amber-300'
                )}
            </div>

            {/* 🎯 Skill destino */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Skill destino</Label>
                <Select
                    value={String(data.skill ?? '')}
                    onValueChange={(val) => {
                        const selected = skills.find(
                            (s) => String(s.id) === val
                        )
                        updateNodeData(id, {
                            skill: Number(val),
                            skillLabel: selected?.label || '',
                        })
                    }}
                >
                    <SelectTrigger className="w-full dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar skill" />
                    </SelectTrigger>
                    <SelectContent>
                        {skills.map((skill) => (
                            <SelectItem key={skill.id} value={String(skill.id)}>
                                {skill.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 🕓 Timeout Message */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Timeout Message</Label>
                <Textarea
                    ref={timeoutRef}
                    value={data.timeoutMessage || ''}
                    onChange={(e) => {
                        updateNodeData(id, { timeoutMessage: e.target.value })
                        autoResize(timeoutRef)
                    }}
                    placeholder="Mensaje cuando el usuario no responde..."
                    className="min-h-[80px] text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 🕓 Queue Message */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Queue Message</Label>
                <Textarea
                    ref={queueRef}
                    value={data.queueMessage || ''}
                    onChange={(e) => {
                        updateNodeData(id, { queueMessage: e.target.value })
                        autoResize(queueRef)
                    }}
                    placeholder="Mensaje cuando hay alta demanda..."
                    className="min-h-[60px] text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 🕓 Inbound Message */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Inbound Message</Label>
                <Textarea
                    ref={inboundRef}
                    value={data.inboundMessage || ''}
                    onChange={(e) => {
                        updateNodeData(id, { inboundMessage: e.target.value })
                        autoResize(inboundRef)
                    }}
                    placeholder="Mensaje al asignar al asesor..."
                    className="min-h-[60px] text-sm dark:bg-gray-900/50"
                />
            </div>
        </div>
    )
}
