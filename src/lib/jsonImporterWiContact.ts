// src\lib\jsonImporterWiContact.ts
import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import type { GetDataCompleteObject } from '@/types/getDataComplete'

/**
 * 🔁 convertWiContactToFlow (v4.4 – Stable Global Edge IDs + Safe Handles)
 * ------------------------------------------------------------------------
 * - IDs 100% únicos con crypto.randomUUID()
 * - Ignora handles no definidos aún (previene error #008)
 * - Mantiene compatibilidad con GetDataComplete y auto-sync Zustand
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
    const pendingEdges: Edge[] = []

    const variantStore = useVariantTypeStore.getState()
    const gdcBaseStore = useGetDataCompleteBaseStore.getState()

    /** 🆔 Genera IDs únicos globales */
    const edgeGlobalUID = () => crypto.randomUUID()

    /** 🔗 Helper seguro: evita duplicados y valida handle */
    const addEdge = (
        source: string,
        target?: string,
        handle?: string,
        label?: string
    ) => {
        if (!target) return
        if (!source) return
        if (source === target) return

        const id = `edge-${source}-${handle || 'auto'}-${target}-${edgeGlobalUID()}`
        const exists = edges.some(
            (e) =>
                e.source === source &&
                e.target === target &&
                e.sourceHandle === handle
        )
        if (exists) return

        const edge: Edge = {
            id,
            source,
            target,
            sourceHandle: handle,
            label,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 1.8 },
        }

        // Si el handle parece no existir aún (ej. list-0, back), lo marcamos como pendiente
        if (
            handle &&
            (handle.startsWith('list-') ||
                handle.startsWith('qr-') ||
                handle === 'back')
        ) {
            pendingEdges.push(edge)
        } else {
            edges.push(edge)
        }
    }

    console.groupCollapsed('🧩 [Importer] WiContact → Flow (v4.4)')
    console.log('Total steps:', steps.length)

    // ========================
    // 🧱 PASADA 1: CREAR NODOS
    // ========================
    for (const step of steps) {
        const { id, action = '', object = {} } = step
        const lower = String(action).toLowerCase()

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
            case 'simpletextnode':
                nodes.push({
                    id,
                    type: 'simpleTextNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: id,
                        groodText: object.groodText || '',
                        description: decodeURIComponent(
                            object.description || ''
                        ),
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

            case 'hangup':
                nodes.push({
                    id,
                    type: 'endNode',
                    position: { x: 0, y: 0 },
                    data: { label: id, hangupCause: object.HangupCause || '' },
                })
                break

            // 🟣 GetDataComplete / MenuNode
            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
            case 'menu': {
                const interactive = object.interactive ?? {}
                const setvars = object.setvariables || {}
                const conditions = object.conditions || {}

                const isList =
                    interactive.type === 'list' ||
                    Object.keys(setvars).length > 4
                const variantType = isList ? 'list' : 'quick_reply'

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

                const prompt = decodeURIComponent(
                    interactive.body ||
                        interactive.content?.text ||
                        object.prompt ||
                        ''
                )

                const description = decodeURIComponent(object.description || '')

                const fullObject: GetDataCompleteObject = {
                    id,
                    action: 'getdatacomplete',
                    alias: object.alias || '',
                    variable: object.variable || '',
                    groodText: object.groodText || '',
                    prompt,
                    description,
                    setvar: object.setvar || '',
                    condition: object.condition || '',
                    iterations: object.iterations || '',
                    timeOut: object.timeOut || '',
                    saveHidden: object.saveHidden ?? false,
                    setvariables: setvars,
                    conditions,
                    interactive: {
                        ...interactive,
                        type: variantType,
                        options: !isList ? options : undefined,
                        items: isList ? interactive.items || [] : undefined,
                    },
                }

                gdcBaseStore.initNode(id)
                gdcBaseStore.setNodeData(id, fullObject)
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
                        alias: fullObject.alias,
                        variable: fullObject.variable,
                        message: fullObject.prompt,
                        saveHidden: fullObject.saveHidden,
                        object: fullObject,
                    },
                })
                break
            }

            default:
                nodes.push({
                    id,
                    type: 'simpleTextNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: `${id} (${action})`,
                        message: '[Acción no soportada]',
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
                const key = String(opt.postbackText)
                const target = conds?.[key]
                if (target)
                    addEdge(id, target, `${variantTypeHandle(isList)}-${key}`)
            })
        }
    }

    for (const [childId, conds] of conditionMap.entries()) {
        const parentId = conds['0']
        if (parentId) addEdge(childId, parentId, 'back', '🔙 Menú anterior')
    }

    nodes.forEach((node, i) => {
        node.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }
    })

    // ✅ Merge final de edges y pendientes
    const finalEdges = [...edges, ...pendingEdges]

    console.log('✅ Total Edges:', finalEdges.length)
    console.groupEnd()

    return { nodes, edges: finalEdges }
}

function variantTypeHandle(isList: boolean) {
    return isList ? 'list' : 'qr'
}
