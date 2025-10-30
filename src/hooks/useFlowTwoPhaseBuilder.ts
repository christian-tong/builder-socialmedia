// src\hooks\useFlowTwoPhaseBuilder.ts

'use client'

import { useEffect, useState } from 'react'
import { useFlowStore } from '@/store/useFlowStore'
import type { Edge } from 'reactflow'

/**
 * 🧩 useFlowTwoPhaseBuilder (v6.0 — Solución definitiva)
 * ------------------------------------------------------------------------
 * 1️⃣ Fase 1 → crea y monta todos los nodos del JSON
 * 2️⃣ Fase 2 → crea edges solo cuando los nodos están listos
 * ------------------------------------------------------------------------
 * - Soporta: StartNode, SimpleTextNode, Derivate, TimeCondition, EndNode,
 *   MenuNode (GetDataComplete), SaveRecord, SwitchCondition.
 * - Elimina el error de handles inexistentes (#008)
 * - Evita duplicados y mezcla edges nuevos con los previos del import.
 */
export function useFlowTwoPhaseBuilder(json?: any) {
    const { setNodes, setEdges, nodes, edges } = useFlowStore()
    const [phase, setPhase] = useState<'idle' | 'nodes' | 'edges'>('idle')

    useEffect(() => {
        if (!json?.process?.steps?.length) return
        const steps = json.process.steps

        /** 🔹 1️⃣ FASE NODOS */
        const builtNodes = steps.map((step: any, i: number) => {
            const { id, action = '', object = {} } = step
            const lower = action.toLowerCase()
            const pos = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }

            switch (lower) {
                case 'startstep':
                    return {
                        id,
                        type: 'startNode',
                        position: pos,
                        data: { label: id },
                    }
                case 'simpletext':
                case 'simple_text':
                    return {
                        id,
                        type: 'simpleTextNode',
                        position: pos,
                        data: {
                            label: id,
                            message: decodeURIComponent(
                                object.text || object.prompt || ''
                            ),
                            description: decodeURIComponent(
                                object.description || ''
                            ),
                        },
                    }
                case 'derivate':
                    return {
                        id,
                        type: 'derivateNode',
                        position: pos,
                        data: {
                            label: id,
                            skill: Number(object.skill) || null,
                            timeoutMessage: object.timeoutMessage || '',
                            queueMessage: object.queueMessage || '',
                        },
                    }
                case 'timecondition':
                    return {
                        id,
                        type: 'timeConditionNode',
                        position: pos,
                        data: { label: id, condition: object.condition || '' },
                    }
                case 'hangup':
                    return {
                        id,
                        type: 'endNode',
                        position: pos,
                        data: { label: id },
                    }
                case 'getdatacomplete':
                case 'getdata':
                case 'menu':
                    return {
                        id,
                        type: 'menuNode',
                        position: pos,
                        data: {
                            label: id,
                            object,
                        },
                    }
                case 'saverecord':
                    return {
                        id,
                        type: 'saveRecordNode',
                        position: pos,
                        data: { label: id, ...object },
                    }
                case 'switchcondition':
                    return {
                        id,
                        type: 'switchConditionNode',
                        position: pos,
                        data: {
                            label: id,
                            connections: object.connections || {},
                        },
                    }
                default:
                    return {
                        id,
                        type: 'simpleTextNode',
                        position: pos,
                        data: { label: `${id} (${action})` },
                    }
            }
        })

        setNodes(builtNodes)
        setPhase('nodes')

        /** 🕒 2️⃣ FASE EDGES — después del montaje de nodos */
        const timer = setTimeout(() => {
            const validIds = new Set(builtNodes.map((n) => n.id))
            const builtEdges: Edge[] = []

            for (const step of steps) {
                const {
                    id,
                    action = '',
                    onTrue,
                    onFalse,
                    onError,
                    object = {},
                } = step
                const lower = action.toLowerCase()

                const add = (target?: string, handle?: string) => {
                    if (!target || !validIds.has(target)) return
                    const eid = `edge-${id}-${handle || 'auto'}-${target}`
                    builtEdges.push({
                        id: eid,
                        source: id,
                        target,
                        sourceHandle: handle,
                        type: 'smoothstep',
                        animated: true,
                        style: { strokeWidth: 1.8 },
                    })
                }

                add(onTrue, 'onTrue')
                add(onFalse, 'onFalse')
                add(onError, 'onError')

                // ✅ Casos especiales
                if (['getdatacomplete', 'getdata', 'menu'].includes(lower)) {
                    const conds = object.conditions || {}
                    for (const [k, v] of Object.entries(conds))
                        add(v as string, k)
                }

                if (lower === 'saverecord' && object.nextNodeId)
                    add(object.nextNodeId, 'onSuccess')

                if (lower === 'switchcondition' && object.connections)
                    for (const [key, v] of Object.entries(object.connections))
                        add(v as string, `on:${key}`)
            }

            // Mezclar con edges previos
            const merged = [...edges]
            builtEdges.forEach((e) => {
                if (!merged.find((x) => x.id === e.id)) merged.push(e)
            })
            setEdges(merged)
            setPhase('edges')
            console.info(
                `✅ Nodos: ${builtNodes.length} | Edges: ${builtEdges.length}`
            )
        }, 600)

        return () => clearTimeout(timer)
    }, [json])

    return { phase }
}
