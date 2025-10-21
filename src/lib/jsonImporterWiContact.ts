// src\lib\jsonImporterWiContact.ts

import type { Edge, Node } from 'reactflow'

/**
 * 🔁 Convierte JSON WiContact (process.steps) → { nodes, edges }
 * --------------------------------------------------------------
 * - Mantiene IDs originales
 * - Crea conexiones de control (onTrue / onFalse / onError)
 * - Crea conexiones de menú (conditions / options)
 * - Detecta dinámicamente nodos de cierre (hangup)
 * - Compatible con tus formularios actuales
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
    const hangupIds = new Set<string>() // ← detecta dinámicamente nodos de cierre

    /**
     * 🔗 Helper: agrega una conexión (evita duplicados)
     */
    const addEdge = (
        source: string,
        target: string | undefined,
        sourceHandle?: string,
        label?: string
    ) => {
        if (!target) return // evita edges sin destino
        const id = `${source}-${sourceHandle || 'auto'}-${target}`
        if (edges.some((e) => e.id === id)) return
        edges.push({
            id,
            source,
            target,
            sourceHandle,
            label,
            type: 'smoothstep',
        })
    }

    // ========================
    // 🧱 PRIMERA PASADA: NODOS
    // ========================
    for (const step of steps) {
        const { id, action, object = {} } = step

        // 🟥 Detectar nodos de cierre dinámicamente
        if (action === 'hangup') hangupIds.add(id)

        switch (action) {
            // 🟢 Inicio
            case 'startstep':
                nodes.push({
                    id,
                    type: 'startNode',
                    position: { x: 0, y: 0 },
                    data: { label: id },
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
                break

            // 🟨 Derivación
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

                interface MenuOption {
                    postbackText: string
                    title: string
                    next: string
                }

                const options: MenuOption[] =
                    isList && object.interactive?.items
                        ? object.interactive.items[0].options.map(
                              (opt: any, idx: number): MenuOption => ({
                                  postbackText: opt.postbackText,
                                  title: decodeURIComponent(opt.title || ''),
                                  next: object.conditions?.[opt.postbackText],
                              })
                          )
                        : object.interactive?.options?.map(
                              (opt: any, idx: number): MenuOption => ({
                                  postbackText: opt.postbackText,
                                  title: decodeURIComponent(opt.title || ''),
                                  next: object.conditions?.[opt.postbackText],
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
                break
            }

            default:
                break
        }
    }

    // ==========================
    // 🔗 SEGUNDA PASADA: EDGES
    // ==========================
    for (const step of steps) {
        const { id, action, onTrue, onFalse, onError, object = {} } = step

        // Conexiones de control (presentes en todos los tipos)
        addEdge(id, onTrue, 'onTrue')
        addEdge(id, onFalse, 'onFalse')
        addEdge(id, onError, 'onError')

        // Conexiones de menú
        if (action === 'getdatacomplete') {
            const conds = object.conditions || {}
            const isList = object?.interactive?.type === 'list'
            const options = isList
                ? object.interactive?.items?.[0]?.options || []
                : object.interactive?.options || []

            options.forEach((opt: any, index: number) => {
                const target = conds?.[opt.postbackText]
                addEdge(id, target, `option-${index}`)
            })
        }
    }

    // ♻ Reconstruir vínculos “Menú anterior” (condición [0])
    for (const [childId, conds] of conditionMap.entries()) {
        const parentId = conds['0']
        if (parentId) {
            const exists = edges.some(
                (e) => e.source === childId && e.target === parentId
            )
            if (!exists) {
                addEdge(childId, parentId, 'back', '🔙 Menú anterior')
            }
        }
    }

    // 📍 Posiciones base
    nodes.forEach((node, i) => {
        node.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }
    })

    return { nodes, edges }
}
