// src\lib\jsonImporterWiContact.ts

import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

/**
 * 🔁 Convierte JSON WiContact u OSM_WSP → { nodes, edges }
 * --------------------------------------------------------------
 * - Detecta automáticamente estructuras OSM o WiContact.
 * - Crea nodos compatibles con el builder actual (MenuNode, etc.).
 * - Sincroniza useVariantTypeStore con variantes y opciones.
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

    const variantStore = useVariantTypeStore.getState()

    /** 🔗 Helper: evita duplicados */
    const addEdge = (
        source: string,
        target?: string,
        handle?: string,
        label?: string
    ) => {
        if (!target) return
        const id = `${source}-${handle || 'auto'}-${target}`
        if (edges.some((e) => e.id === id)) return
        edges.push({
            id,
            source,
            target,
            sourceHandle: handle,
            label,
            type: 'smoothstep',
        })
    }

    // ========================
    // 🧱 PASADA 1: CREAR NODOS
    // ========================
    for (const step of steps) {
        const { id, action, object = {} } = step
        const lower = String(action || '').toLowerCase()

        switch (lower) {
            case 'startstep':
                nodes.push({
                    id,
                    type: 'startNode',
                    position: { x: 0, y: 0 },
                    data: { label: id },
                })
                break

            case 'simpletext':
            case 'simple_text':
                nodes.push({
                    id,
                    type: 'simpleTextNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        groodText: object.groodText || '',
                        message: decodeURIComponent(
                            object.text || object.prompt || ''
                        ),
                    },
                })
                break

            case 'derivate':
                nodes.push({
                    id,
                    type: 'derivateNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        skill: object.skill ? Number(object.skill) : null,
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

            case 'timecondition':
                {
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
                }
                break

            case 'hangup':
                nodes.push({
                    id,
                    type: 'endNode',
                    position: { x: 0, y: 0 },
                    data: { label: id, hangupCause: object.HangupCause || '' },
                })
                break

            // 🟣 WiContact o OSM menú interactivo
            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
                {
                    // --- Compatibilidad OSM/WiContact ---
                    const interactive = object.interactive ?? {}
                    const prompt = object.prompt || ''
                    const setvars = object.setvariables || {}
                    const conditions = object.conditions || {}

                    // tipo list / quick_reply
                    const isList =
                        interactive.type === 'list' ||
                        Object.keys(setvars).length > 4 // heurística básica
                    const variantType = isList ? 'list' : 'quick_reply'

                    // opciones: usar interactive o setvariables
                    const rawOptions =
                        interactive?.options ??
                        interactive?.items?.[0]?.options ??
                        Object.entries(setvars).map(([key, title]) => ({
                            postbackText: key,
                            title,
                        }))

                    const options = rawOptions.map((opt: any, i: number) => ({
                        postbackText: String(opt.postbackText ?? i + 1),
                        title: decodeURIComponent(opt.title || ''),
                        type: opt.type || 'text',
                    }))

                    // texto principal
                    const message = decodeURIComponent(
                        interactive.body ||
                            interactive.content?.text ||
                            prompt ||
                            ''
                    )

                    // sincronizar store Zustand
                    variantStore.setVariantType(id, variantType)
                    variantStore.setVariantOptions(id, options)
                    variantStore.setVariantConditions(id, conditions)

                    conditionMap.set(id, conditions)

                    nodes.push({
                        id,
                        type: 'menuNode',
                        position: { x: 0, y: 0 },
                        data: {
                            label: id,
                            variable: object.variable || '',
                            variantType,
                            object: {
                                ...object,
                                interactive: {
                                    ...interactive,
                                    type: variantType,
                                    options: !isList ? rawOptions : undefined,
                                    items: isList
                                        ? interactive.items
                                        : undefined,
                                },
                            },
                            message,
                            options,
                        },
                    })
                }
                break

            default:
                // 👇 Ignorar nodos no soportados (mysqlquery, saverecord, etc.)
                nodes.push({
                    id,
                    type: 'simpleTextNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: `${id} (${action})`,
                        message: '[No soportado]',
                    },
                })
                break
        }
    }

    // ==========================
    // 🔗 PASADA 2: CREAR EDGES
    // ==========================
    for (const step of steps) {
        const { id, action, onTrue, onFalse, onError, object = {} } = step

        addEdge(id, onTrue, 'onTrue')
        addEdge(id, onFalse, 'onFalse')
        addEdge(id, onError, 'onError')

        const lower = String(action || '').toLowerCase()
        if (
            ['getdatacomplete', 'getdata', 'getdata_v2', 'get_data'].includes(
                lower
            )
        ) {
            const conds = object.conditions || {}
            const interactive = object.interactive ?? {}
            const setvars = object.setvariables || {}

            const isList =
                interactive.type === 'list' || Object.keys(setvars).length > 4
            const rawOptions =
                interactive.options ??
                interactive.items?.[0]?.options ??
                Object.entries(setvars).map(([key, title]) => ({
                    postbackText: key,
                    title,
                }))

            rawOptions.forEach((opt: any) => {
                const target = conds?.[opt.postbackText]
                if (target)
                    addEdge(
                        id,
                        target,
                        `${variantTypeHandle(isList)}-${opt.postbackText}`
                    )
            })
        }
    }

    // 🔄 Menú anterior (condición '0')
    for (const [childId, conds] of conditionMap.entries()) {
        const parentId = conds['0']
        if (parentId) addEdge(childId, parentId, 'back', '🔙 Menú anterior')
    }

    // posiciones iniciales
    nodes.forEach((node, i) => {
        node.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }
    })

    return { nodes, edges }
}

/** 🔧 Prefijo correcto */
function variantTypeHandle(isList: boolean) {
    return isList ? 'list' : 'qr'
}
