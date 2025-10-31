// src\lib\jsonImporterWiContact.ts
import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import type { GetDataCompleteObject } from '@/types/getDataComplete'
import { nodeTypes } from '@/config/nodesConfig'

/**
 * 🔁 convertWiContactToFlow (v5.1 – Filtra nodos soportados + Log de faltantes)
 * ------------------------------------------------------------------------
 * ✅ Muestra solo los nodos compatibles con tu proyecto actual.
 * ✅ Imprime en consola los tipos que faltan implementar.
 * ✅ Mantiene compatibilidad con WiContact y osm_wsp.json.
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
    const unsupported: Set<string> = new Set()

    const gdcBaseStore = useGetDataCompleteBaseStore.getState()
    const variantStore = useVariantTypeStore.getState()

    const edgeGlobalUID = () => crypto.randomUUID()

    /** 🔗 Helper seguro para edges */
    const addEdge = (
        source: string,
        target?: string,
        handle?: string,
        label?: string
    ) => {
        if (!target || !source || source === target) return
        const id = `edge-${source}-${handle || 'auto'}-${target}-${edgeGlobalUID()}`
        if (
            edges.some(
                (e) =>
                    e.source === source &&
                    e.target === target &&
                    e.sourceHandle === handle
            )
        )
            return
        edges.push({
            id,
            source,
            target,
            sourceHandle: handle,
            label,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 1.8 },
        })
    }

    console.groupCollapsed('🧩 [Importer v5.1] WiContact / osm_wsp → Flow')
    console.log('Total steps:', steps.length)

    // ========================
    // 🧱 PASADA 1: CREAR NODOS
    // ========================
    for (const step of steps) {
        const { id, action = '', object = {} } = step
        const lower = String(action).toLowerCase()
        let nodeType: string | null = null
        let nodeData: any = {}

        switch (lower) {
            case 'startstep':
                nodeType = 'startNode'
                nodeData = { label: id }
                break

            case 'simpletext':
            case 'simple_text':
            case 'simpletextnode':
                nodeType = 'simpleTextNode'
                nodeData = {
                    label: id,
                    message: decodeURIComponent(
                        object.text || object.prompt || ''
                    ),
                }
                break

            case 'derivate':
                nodeType = 'derivateNode'
                nodeData = {
                    label: id,
                    skill: object.skill ? Number(object.skill) : null,
                    timeoutMessage: decodeURIComponent(
                        object.timeoutMessage || ''
                    ),
                    queueMessage: decodeURIComponent(object.queueMessage || ''),
                    inboundMessage: decodeURIComponent(
                        object.inboundMessage || ''
                    ),
                }
                break

            case 'timecondition':
                nodeType = 'timeConditionNode'
                nodeData = { label: id, condition: object.condition || '' }
                break

            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
            case 'menu':
                nodeType = 'menuNode'
                const interactive = object.interactive ?? {}
                const setvars = object.setvariables || {}
                const conditions = object.conditions || {}
                const isList =
                    interactive.type === 'list' ||
                    Object.keys(setvars).length > 4
                const variantType = isList ? 'list' : 'quick_reply'
                const rawOptions =
                    interactive.options ??
                    interactive.items?.[0]?.options ??
                    Object.entries(setvars).map(([key, title]) => ({
                        postbackText: key,
                        title,
                    }))
                const options = rawOptions.map((opt: any, i: number) => ({
                    postbackText: String(opt.postbackText ?? i + 1),
                    title: decodeURIComponent(opt.title || ''),
                }))
                const prompt = decodeURIComponent(
                    interactive.body ||
                        interactive.content?.text ||
                        object.prompt ||
                        ''
                )
                const fullObject: GetDataCompleteObject = {
                    id,
                    action: 'getdatacomplete',
                    alias: object.alias || '',
                    variable: object.variable || '',
                    prompt,
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
                nodeData = { label: id, object: fullObject }
                break

            case 'chatbotiarequest':
                nodeType = 'chatBotIARequestNode'
                nodeData = {
                    label: id,
                    prompt: object.prompt || '',
                    model: object.model || 'gpt-3.5-turbo',
                    variable: object.variable || '',
                }
                break

            case 'saverecord':
                nodeType = 'saveRecordNode'
                nodeData = {
                    label: id,
                    table: object.table || '',
                    values: object.values || {},
                }
                break

            case 'variables':
                nodeType = 'variablesNode'
                nodeData = { label: id, variables: object.variables || {} }
                break

            case 'mysqlquery':
                nodeType = 'mysqlQueryNode'
                nodeData = {
                    label: id,
                    query: object.query || '',
                    assignTo: object.assignTo || '',
                }
                break

            case 'generatetoken':
                nodeType = 'generateTokenNode'
                nodeData = {
                    label: id,
                    tokenName: object.tokenName || '',
                    expiresIn: object.expiresIn || '',
                }
                break

            case 'noop':
                nodeType = 'noopNode'
                nodeData = { label: id }
                break

            case 'hangup':
                nodeType = 'endNode'
                nodeData = { label: id, hangupCause: object.HangupCause || '' }
                break

            default:
                unsupported.add(lower)
                continue
        }

        // ✅ Solo agregamos nodos que existen en nodeTypes registrados
        if (nodeType && nodeTypes[nodeType]) {
            nodes.push({
                id,
                type: nodeType,
                position: { x: 0, y: 0 },
                data: nodeData,
            })
        } else if (nodeType) {
            unsupported.add(nodeType)
        }
    }

    // ==========================
    // 🔗 PASADA 2: CREAR EDGES
    // ==========================
    for (const step of steps) {
        const { id, onTrue, onFalse, onError, object = {} } = step
        addEdge(id, onTrue, 'onTrue')
        addEdge(id, onFalse, 'onFalse')
        addEdge(id, onError, 'onError')
        if (object?.nextNodeId) addEdge(id, object.nextNodeId, 'onSuccess')
    }

    // 📍 Layout básico
    nodes.forEach((n, i) => {
        n.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 }
    })

    console.log(
        '✅ Nodos renderizados:',
        nodes.length,
        '| Edges:',
        edges.length
    )

    // 🧾 Log de tipos faltantes
    if (unsupported.size > 0) {
        console.warn('⚠️ Tipos de nodos no soportados detectados:')
        console.table([...unsupported].map((t) => ({ tipo: t })))
    } else {
        console.log('✅ Todos los tipos de nodos están soportados.')
    }

    console.groupEnd()
    return { nodes, edges }
}
