// src/lib/jsonFlowGenerator.ts

import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

/**
 * 🧠 generateConversationJson (v5 — Orden jerárquico Ambipar)
 * ------------------------------------------------------------
 * - Genera el flujo con orden jerárquico específico:
 *   1️⃣ startstep
 *   2️⃣ simpletext
 *   3️⃣ timecondition
 *   4️⃣ derivate
 *   5️⃣ getdatacomplete
 *   6️⃣ hangup
 * - Asegura fallback de edges sin handle
 * - Sincroniza variantes interactivas (quick_reply / list)
 */

export interface WiStep {
    id: string
    action: string
    onTrue?: string | null
    onFalse?: string | null
    onError?: string | null
    isInteractive?: boolean
    source?: string
    interactiveVersion?: number
    object: Record<string, any>
}

export interface WiProcess {
    process: {
        steps: WiStep[]
    }
}

export function generateConversationJson(
    nodes: Node<Record<string, any>>[],
    edges: Edge[]
): WiProcess {
    const allSteps: WiStep[] = []

    // 🧩 Helpers
    const getOutgoingEdges = (sourceId: string): Edge[] =>
        edges.filter((e) => e.source === sourceId)

    const getConnectedTarget = (
        edgeList: Edge[],
        sourceId: string,
        handleId?: string
    ): string | null => {
        // 🔹 Buscar edge con handle específico
        if (handleId) {
            const match = edgeList.find(
                (e) => e.source === sourceId && e.sourceHandle === handleId
            )
            if (match) return match.target
        }

        // 🔹 Si no existe, tomar el primero saliente (fallback)
        const fallback = edgeList.find((e) => e.source === sourceId)
        return fallback?.target ?? null
    }

    // 🔗 Instancia del store
    const { getVariantOptions, getVariantConditions, getVariantType } =
        useVariantTypeStore.getState()

    // 🧱 Recorrer todos los nodos y crear pasos
    for (const node of nodes) {
        const { id, type, data } = node
        const outgoing = getOutgoingEdges(id)
        const onTrue = getConnectedTarget(outgoing, id, 'onTrue')
        const onFalse = getConnectedTarget(outgoing, id, 'onFalse')
        const onError = getConnectedTarget(outgoing, id, 'onError')

        switch (type) {
            /** 🟢 START NODE */
            case 'startNode': {
                const next = outgoing[0]?.target ?? null
                allSteps.push({
                    id,
                    action: 'startstep',
                    onTrue: next,
                    object: {},
                })
                break
            }

            /** 🟦 SIMPLE TEXT NODE */
            case 'simpleTextNode': {
                const text = encodeURIComponent(data?.message ?? '')
                allSteps.push({
                    id,
                    action: 'simpletext',
                    onTrue: onTrue ?? getConnectedTarget(outgoing, id),
                    object: {
                        groodText: data?.groodText ?? '',
                        text,
                    },
                })
                break
            }

            /** 🕓 TIME CONDITION NODE */
            case 'timeConditionNode': {
                allSteps.push({
                    id,
                    action: 'timecondition',
                    onTrue,
                    onFalse,
                    object: {
                        condition: data?.condition ?? '',
                    },
                })
                break
            }

            /** 🟠 DERIVATE NODE */
            case 'derivateNode': {
                allSteps.push({
                    id,
                    action: 'derivate',
                    onTrue,
                    onFalse,
                    onError,
                    object: {
                        timeoutMessage: encodeURIComponent(
                            data?.timeoutMessage ?? ''
                        ),
                        skill: data?.skill ? Number(data.skill) : 0,
                        queueMessage: encodeURIComponent(
                            data?.queueMessage ?? ''
                        ),
                        inboundMessage: encodeURIComponent(
                            data?.inboundMessage ?? ''
                        ),
                        groodText_queueMessage:
                            data?.groodText_queueMessage ?? '',
                        groodText_inboundMessage:
                            data?.groodText_inboundMessage ?? '',
                    },
                })
                break
            }

            /** 🟣 MENU NODE (getdatacomplete) */
            case 'menuNode': {
                const variantType = getVariantType(id)
                const options = getVariantOptions(id)
                const conditions = getVariantConditions(id)

                const setvariables: Record<string, string> = {}
                options.forEach((opt) => {
                    setvariables[opt.postbackText] = opt.title ?? ''
                })

                const numeric = options
                    .map((o) => Number(o.postbackText))
                    .filter((n) => !isNaN(n))
                const min = Math.min(...numeric)
                const max = Math.max(...numeric)
                const conditionRange =
                    numeric.length > 0 ? `[${min}-${max}]` : '[1-1]'

                const baseObject: Record<string, any> = {
                    setvariables,
                    condition: data?.object?.condition ?? conditionRange,
                    groodText: data?.object?.groodText ?? '',
                    setvar: data?.object?.setvar ?? '',
                    variable:
                        data?.object?.variable ??
                        (variantType === 'list'
                            ? 'SegundaOpcion'
                            : 'PrimeraOpcion'),
                    saveHidden: true,
                    alias:
                        data?.object?.alias ??
                        (variantType === 'list'
                            ? 'SegundaOpcion'
                            : 'PrimeraOpcion'),
                    conditions,
                    iterations: '2',
                    timeOut: '90000',
                }

                if (variantType === 'quick_reply') {
                    baseObject.interactive = {
                        type: 'quick_reply',
                        msgid: 'qr1',
                        content: {
                            type: 'text',
                            text: encodeURIComponent(data?.message ?? ''),
                        },
                        options: options.map((opt) => ({
                            postbackText: opt.postbackText,
                            type: 'text',
                            title: encodeURIComponent(opt.title ?? ''),
                        })),
                    }
                } else {
                    baseObject.interactive = {
                        globalButtons: [{ type: 'text', title: 'Elegir' }],
                        type: 'list',
                        body: encodeURIComponent(data?.message ?? ''),
                        items: [
                            {
                                options: options.map((opt) => ({
                                    postbackText: opt.postbackText,
                                    type: 'text',
                                    title: encodeURIComponent(opt.title ?? ''),
                                })),
                                title: 'Elija una opción',
                            },
                        ],
                    }
                }

                allSteps.push({
                    id,
                    action: 'getdatacomplete',
                    onTrue,
                    onFalse,
                    onError,
                    isInteractive: true,
                    source: 'GetData',
                    interactiveVersion: 4,
                    object: baseObject,
                })
                break
            }

            /** 🔴 END NODE */
            case 'endNode': {
                allSteps.push({
                    id,
                    action: 'hangup',
                    object: {
                        HangupCause: data?.hangupCause ?? '',
                    },
                })
                break
            }

            default:
                break
        }
    }

    // 🧮 ORDENAMIENTO JERÁRQUICO (como Ambipar)
    const ordered = [
        ...allSteps.filter((s) => s.action === 'startstep'),
        ...allSteps.filter((s) => s.action === 'simpletext'),
        ...allSteps.filter((s) => s.action === 'timecondition'),
        ...allSteps.filter((s) => s.action === 'derivate'),
        ...allSteps.filter((s) => s.action === 'getdatacomplete'),
        ...allSteps.filter((s) => s.action === 'hangup'),
    ]

    return {
        process: { steps: ordered },
    }
}
