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

/**
 * 🟨 FormDerivateNode
 * --------------------------------------------------
 * - Muestra y edita skill + mensajes
 * - Ahora incluye "Nodo anterior" y "Nodo siguiente"
 * - Con tipado estricto y auto-resize de textareas
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

    // 🔹 Estado local
    const [skills, setSkills] = useState<Skill[]>([])
    const [prevLabel, setPrevLabel] = useState<string>('—')
    const [nextLabel, setNextLabel] = useState<string>('—')

    // 🔹 Refs de textareas
    const timeoutRef = useRef<HTMLTextAreaElement | null>(null)
    const queueRef = useRef<HTMLTextAreaElement | null>(null)
    const inboundRef = useRef<HTMLTextAreaElement | null>(null)

    // ⚙️ Cargar skills disponibles
    useEffect(() => {
        getSkills().then(setSkills)
    }, [])

    // 🔁 Actualizar lista de nodos conectados
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevLabel(
            prev.length > 0
                ? prev.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
        setNextLabel(
            next.length > 0
                ? next.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
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

    return (
        <div className="flex flex-col gap-4">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    Configuración de Derivación
                </Label>
                <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔹 Nodos conectados */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo anterior</Label>
                <Input
                    value={prevLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo siguiente</Label>
                <Input
                    value={nextLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
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
