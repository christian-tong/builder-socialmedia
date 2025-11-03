// src\components\forms\FormDerivateNode.tsx
'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { getSkills, type Skill } from '@/services/skillService'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🟨 FormDerivateNode (v2.2 – Estilo Estandarizado)
 * --------------------------------------------------
 * - Adopta estructura completa del Prompt Base v1.1
 * - Respeta jerarquía y colores onTrue / onFalse / onError
 * - Incluye secciones separadas por border-t
 * - Conserva lógica de skill, mensajes y auto-resize
 */
export default function FormDerivateNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const [skills, setSkills] = useState<Skill[]>([])

    // 🧠 Hook de conexiones centralizado
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    // 🔍 Filtrado de conexiones condicionales
    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)
    const falseConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onFalse'))
        .map((n) => n.id)
    const errorConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onError'))
        .map((n) => n.id)

    // ⚙️ Cargar skills del servicio
    useEffect(() => {
        getSkills().then(setSkills)
    }, [])

    // 🪶 Auto-ajuste de altura dinámica
    const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 400) + 'px'
    }

    // Refs de textareas
    const timeoutRef = useRef<HTMLTextAreaElement | null>(null)
    const queueRef = useRef<HTMLTextAreaElement | null>(null)
    const inboundRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        autoResize(timeoutRef)
        autoResize(queueRef)
        autoResize(inboundRef)
    }, [data])

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

            {/* 🔗 Conexión entrante */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* 🟢 Sección OnTrue */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conexión OnTrue
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (onTrue)"
                    nodesList={trueConnections}
                    accentColor="text-green-700 dark:text-green-300"
                />
                <NodeSelectionAccordion
                    title="Seleccionar nodo OnTrue"
                    availableNodes={availableNodes}
                    hasConnection={hasConnection}
                    toggleConnection={toggleConnection}
                    handleId="onTrue"
                    accentColor="text-green-700 dark:text-green-300"
                />
            </div>

            {/* 🎯 Skill destino */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
