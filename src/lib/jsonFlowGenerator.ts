// src/lib/jsonFlowGenerator.ts

import { Node, Edge } from 'reactflow'

/**
 * 🧠 Genera JSON conversacional basado en el flujo actual
 * -------------------------------------------------------
 * Convierte los nodos de React Flow a la estructura
 * final usada por el backend de conversación (WiContact)
 */
export function generateConversationJson(nodes: Node[], edges: Edge[]) {
    const steps: any[] = []

    // 🧩 Helper para buscar el siguiente nodo conectado
    const getNextNodeId = (sourceId: string) => {
        const edge = edges.find((e) => e.source === sourceId)
        return edge ? edge.target : 'Hangup0000'
    }

    // 🔗 Helper para obtener todos los edges salientes de un nodo
    const getOutgoingEdges = (sourceId: string) =>
        edges.filter((e) => e.source === sourceId)

    // 🧱 Construcción de pasos
    for (const node of nodes) {
        const { id, type, data } = node
        const nextId = getNextNodeId(id)

        switch (type) {
            /** 🟢 Texto Simple */
            case 'simpleTextNode':
                steps.push({
                    onTrue: nextId,
                    action: 'simpletext',
                    id,
                    object: {
                        groodText: data?.groodText || '',
                        text: encodeURIComponent(data?.message || ''),
                    },
                })
                break

            /** 🟠 Derivación */
            case 'derivateNode':
                steps.push({
                    onTrue: nextId,
                    action: 'derivate',
                    id,
                    object: {
                        timeoutMessage: encodeURIComponent(
                            data?.timeoutMessage || ''
                        ),
                        skill: data?.skill ? Number(data.skill) : 0,
                        queueMessage: encodeURIComponent(
                            data?.queueMessage || ''
                        ),
                        inboundMessage: encodeURIComponent(
                            data?.inboundMessage || ''
                        ),
                        groodText_queueMessage:
                            data?.groodText_queueMessage || '',
                        groodText_inboundMessage:
                            data?.groodText_inboundMessage || '',
                    },
                })
                break

            /** 🕓 Condición de tiempo */
            case 'timeConditionNode':
                steps.push({
                    onTrue: data?.onTrue || null,
                    onFalse: data?.onFalse || null,
                    action: 'timecondition',
                    id,
                    object: {
                        condition: data?.condition || '',
                    },
                })
                break

            /** 🔵 Menú Secundario */
            case 'menuNodeSecundario': {
                const options = data?.options || []
                const outgoingEdges = getOutgoingEdges(id)

                // 🔹 Mapeamos variables y condiciones según edges
                const setvariables: Record<string, string> = {}
                const conditions: Record<string, string> = {}

                options.forEach((opt: any) => {
                    setvariables[opt.postbackText] = opt.title || ''
                    const foundEdge = outgoingEdges.find(
                        (e) => e.sourceHandle === opt.postbackText
                    )
                    conditions[opt.postbackText] = foundEdge
                        ? foundEdge.target
                        : 'Hangup0000'
                })

                // 🔸 Rango [0-5], etc.
                const nums = options.map((o: any) => Number(o.postbackText))
                const min = Math.min(...nums)
                const max = Math.max(...nums)
                const conditionRange = `[${min}-${max}]`

                steps.push({
                    onTrue: 'SimpleText0098',
                    onError: 'SimpleText0099',
                    onFalse: 'SimpleText0098',
                    isInteractive: true,
                    action: 'getdatacomplete',
                    id,
                    source: 'GetData',
                    interactiveVersion: 4,
                    object: {
                        setvariables,
                        condition: conditionRange,
                        groodText: '',
                        setvar: data?.variable || 'SEGUNDO_NIVEL',
                        variable: data?.variable || 'SegundaOpcion',
                        saveHidden: true,
                        interactive: {
                            globalButtons: [{ type: 'text', title: 'Elegir' }],
                            type: 'list',
                            body: encodeURIComponent(data?.message || ''),
                            items: [
                                {
                                    options: options.map((opt: any) => ({
                                        postbackText: opt.postbackText,
                                        type: 'text',
                                        title: encodeURIComponent(
                                            opt.title || ''
                                        ),
                                    })),
                                    title: 'Elija una opción',
                                },
                            ],
                        },
                        alias: data?.variable || 'SegundaOpcion',
                        conditions,
                        iterations: '2',
                        timeOut: '90000',
                    },
                })
                break
            }

            /** 🟣 Menú Principal (idéntico a secundario pero tipo quick_reply) */
            case 'menuNodePrincipal': {
                const options = data?.options || []
                const outgoingEdges = getOutgoingEdges(id)
                const setvariables: Record<string, string> = {}
                const conditions: Record<string, string> = {}

                options.forEach((opt: any) => {
                    setvariables[opt.postbackText] = opt.title || ''
                    const foundEdge = outgoingEdges.find(
                        (e) => e.sourceHandle === opt.postbackText
                    )
                    conditions[opt.postbackText] = foundEdge
                        ? foundEdge.target
                        : 'Hangup0000'
                })

                const nums = options.map((o: any) => Number(o.postbackText))
                const min = Math.min(...nums)
                const max = Math.max(...nums)
                const conditionRange = `[${min}-${max}]`

                steps.push({
                    onTrue: 'SimpleText0098',
                    onError: 'SimpleText0099',
                    onFalse: 'SimpleText0098',
                    isInteractive: true,
                    action: 'getdatacomplete',
                    id,
                    source: 'GetData',
                    interactiveVersion: 4,
                    object: {
                        setvariables,
                        condition: conditionRange,
                        groodText: '',
                        setvar: data?.variable || 'PRIMER_NIVEL',
                        variable: data?.variable || 'PrimeraOpcion',
                        saveHidden: true,
                        interactive: {
                            options: options.map((opt: any) => ({
                                postbackText: opt.postbackText,
                                type: 'text',
                                title: encodeURIComponent(opt.title || ''),
                            })),
                            msgid: 'qr1',
                            type: 'quick_reply',
                            content: {
                                text: encodeURIComponent(data?.message || ''),
                                type: 'text',
                            },
                        },
                        alias: data?.variable || 'PrimeraOpcion',
                        conditions,
                        iterations: '2',
                        timeOut: '90000',
                    },
                })
                break
            }

            /** 🟥 Fin */
            case 'endNode':
                steps.push({
                    action: 'hangup',
                    id,
                    object: {
                        HangupCause: data?.hangupCause || '',
                    },
                })
                break

            default:
                break
        }
    }

    // 🟩 Paso inicial (StartStep)
    const firstNode = nodes.find((n) => n.type === 'menuNodePrincipal')
    if (firstNode) {
        steps.unshift({
            onTrue: firstNode.id,
            action: 'startstep',
            id: 'StartStepZPmf',
            object: {},
        })
    }

    // 🔚 Estructura final
    return {
        process: {
            steps,
        },
    }
}
