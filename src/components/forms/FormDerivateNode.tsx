// src\components\forms\FormDerivateNode.tsx

'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
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
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { getListSkills, type SkillItem } from '@/services/getListSkillsService'

/**
 * 🟨 FormDerivateNode (v2.4 – SkillName como label, SkillNumber como value)
 * ------------------------------------------------------------------------
 * - Usa getListSkillsService real
 * - Muestra el skillName en el select
 * - Guarda skillNumber como value en el nodo
 */
export default function FormDerivateNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const [skills, setSkills] = useState<SkillItem[]>([])

    // 🧠 Hook de conexiones
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    // ⚙️ Cargar lista de skills reales
    useEffect(() => {
        getListSkills().then((res) => {
            if (res.success && res.data) setSkills(res.data)
        })
    }, [])

    // 🪶 Auto-ajuste de altura dinámica
    const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 400) + 'px'
    }

    // Refs para textareas
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
                    Conexión trueStep
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (trueStep)"
                    nodesList={availableNodes
                        .filter((n) => hasConnection(n.id, 'onTrue'))
                        .map((n) => n.id)}
                    accentColor="text-green-700 dark:text-green-300"
                />
                <NodeSelectionAccordion
                    title="Seleccionar nodo trueStep"
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
                            (s) => String(s.skillNumber) === val
                        )
                        updateNodeData(id, {
                            skill: Number(val),
                            skillLabel: selected?.skillName || '',
                        })
                    }}
                >
                    <SelectTrigger className="w-full dark:bg-gray-900/50">
                        <SelectValue placeholder="Seleccionar skill" />
                    </SelectTrigger>
                    <SelectContent>
                        {skills.map((skill) => (
                            <SelectItem
                                key={skill.skillNumber}
                                value={String(skill.skillNumber)}
                            >
                                {skill.skillName}
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
