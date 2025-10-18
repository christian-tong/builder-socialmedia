// src\lib\jsonImporterWiContact.ts

import { Node, Edge } from 'reactflow'
/**
 * 🔁 Convierte JSON WiContact (process.steps) → { nodes, edges }
 * --------------------------------------------------------------
 * Compatible 100% con los formularios:
 * - FormDerivateNode
 * - FormMenuNodePrincipal / Secundario
 * - FormSimpleTextNode
 * - FormTimeConditionNode
 */
export function convertWiContactToFlow(json: any): {
    nodes: Node[]
    edges: Edge[]
} {
    const steps = json?.process?.steps
    if (!Array.isArray(steps))
        throw new Error('JSON inválido: falta process.steps')

    const nodes: Node<any>[] = []
    const edges: Edge<any>[] = []
    const conditionMap = new Map<string, Record<string, string>>()

    for (const step of steps) {
        const { id, action, object = {}, onTrue, onFalse } = step

        switch (action) {
            // 🟢 Inicio
            case 'startstep':
                nodes.push({
                    id,
                    type: 'startNode',
                    position: { x: 0, y: 0 },
                    data: { label: id },
                })
                if (onTrue)
                    edges.push({
                        id: `${id}-${onTrue}`,
                        source: id,
                        target: onTrue,
                        type: 'smoothstep',
                    })
                break

            // 🟦 Texto simple
            case 'simpletext':
                nodes.push({
                    id,
                    type: 'simpleTextNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        groodText: object.groodText || '',
                        message: decodeURIComponent(object.text || ''),
                    },
                })
                if (onTrue)
                    edges.push({
                        id: `${id}-${onTrue}`,
                        source: id,
                        target: onTrue,
                        type: 'smoothstep',
                    })
                break

            // 🟨 Derivación (DerivateNode)
            case 'derivate': {
                const skill = object.skill ? Number(object.skill) : null
                nodes.push({
                    id,
                    type: 'derivateNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        skill,
                        skillLabel: '',
                        timeoutMessage: decodeURIComponent(
                            object.timeoutMessage || ''
                        ),
                        queueMessage: decodeURIComponent(
                            object.queueMessage || ''
                        ),
                        inboundMessage: decodeURIComponent(
                            object.inboundMessage || ''
                        ),
                    },
                })
                if (onTrue)
                    edges.push({
                        id: `${id}-${onTrue}`,
                        source: id,
                        target: onTrue,
                        type: 'smoothstep',
                    })
                break
            }

            // 🕓 Condición de tiempo
            case 'timecondition': {
                const cond: string = object.condition || ''
                const [days, times] = cond.split(',')
                const [dayStart, dayEnd] = (days || '').split('-')
                const [startTime, endTime] = (times || '').split('-')
                nodes.push({
                    id,
                    type: 'timeConditionNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        condition: cond,
                        dayStart: dayStart || '',
                        dayEnd: dayEnd || '',
                        startTime: startTime || '',
                        endTime: endTime || '',
                    },
                })
                if (onTrue)
                    edges.push({
                        id: `${id}-true-${onTrue}`,
                        source: id,
                        target: onTrue,
                        type: 'smoothstep',
                    })
                if (onFalse)
                    edges.push({
                        id: `${id}-false-${onFalse}`,
                        source: id,
                        target: onFalse,
                        type: 'smoothstep',
                    })
                break
            }

            // 🔴 Fin (Hangup)
            case 'hangup':
                nodes.push({
                    id,
                    type: 'endNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        hangupCause: object.HangupCause || '',
                    },
                })
                break

            // 🟣 Menús (GetDataComplete)
            case 'getdatacomplete': {
                const isList: boolean = object?.interactive?.type === 'list'
                const type: string = isList
                    ? 'menuNodeSecundario'
                    : 'menuNodePrincipal'

                conditionMap.set(id, object.conditions || {})

                // Tipar opciones explícitamente
                interface MenuOption {
                    postbackText: string
                    title: string
                    next: string
                }

                const options: MenuOption[] =
                    isList && object.interactive?.items
                        ? object.interactive.items[0].options.map(
                              (opt: any): MenuOption => ({
                                  postbackText: opt.postbackText,
                                  title: decodeURIComponent(opt.title || ''),
                                  next:
                                      object.conditions?.[opt.postbackText] ||
                                      'Hangup0000',
                              })
                          )
                        : object.interactive?.options?.map(
                              (opt: any): MenuOption => ({
                                  postbackText: opt.postbackText,
                                  title: decodeURIComponent(opt.title || ''),
                                  next:
                                      object.conditions?.[opt.postbackText] ||
                                      'Hangup0000',
                              })
                          ) || []

                nodes.push({
                    id,
                    type,
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        variable: object.variable || '',
                        message: decodeURIComponent(
                            isList
                                ? object.interactive?.body || ''
                                : object.interactive?.content?.text || ''
                        ),
                        options,
                    },
                })

                // 🔗 Crear edges por cada opción (con tipado)
                options.forEach((opt: MenuOption, index: number) => {
                    if (opt.next && opt.next !== 'Hangup0000') {
                        const edge: Edge<any> = {
                            id: `${id}-${opt.postbackText}-${opt.next}`,
                            source: id,
                            target: opt.next,
                            sourceHandle: `option-${index}`,
                            type: 'smoothstep',
                        }
                        edges.push(edge)
                    }
                })
                break
            }

            default:
                break
        }
    }

    // ♻ Reconstruir vínculos “Menú anterior”
    for (const [childId, conds] of conditionMap.entries()) {
        const parentId = conds['0']
        if (parentId && parentId !== 'Hangup0000') {
            const exists = edges.some(
                (e) => e.source === childId && e.target === parentId
            )
            if (!exists) {
                const backEdge: Edge<any> = {
                    id: `${childId}-back-${parentId}`,
                    source: childId,
                    target: parentId,
                    label: '🔙 Menú anterior',
                    type: 'smoothstep',
                }
                edges.push(backEdge)
            }
        }
    }

    // 📍 Posiciones base
    nodes.forEach((node, i) => {
        node.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }
    })

    return { nodes, edges }
}
