// src\lib\jsonImporterWiContact.ts

import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import type { GetDataCompleteObject } from '@/types/getDataComplete'
import { nodeTypes } from '@/config/nodesConfig'

/**
 * 🔁 convertWiContactToFlow (v5.4 – Variant Auto Detection)
 * ------------------------------------------------------------------------
 * ✅ Auto-detecta variantes GETDATA / SIMPLETEXT / QuickReply / List
 * ✅ Integración completa con useSaveRecordStore y useVariantTypeStore
 * ✅ Evita duplicados de IDs
 * ✅ Crea edges válidos y únicos
 * ✅ Soporta importación desde WiContact y osm_wsp.json
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
    const duplicateIds: Set<string> = new Set()
    const uniqueNodeIds: Set<string> = new Set()

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

    console.groupCollapsed('🧩 [Importer v5.4] WiContact / osm_wsp → Flow')
    console.log('Total steps:', steps.length)

    // ========================
    // 🧱 PASADA 1: CREAR NODOS
    // ========================
    for (const step of steps) {
        const { id, action = '', object = {} } = step
        const lower = String(action).toLowerCase()

        if (uniqueNodeIds.has(id)) {
            duplicateIds.add(id)
            continue
        }
        uniqueNodeIds.add(id)

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

            case 'switchcondition':
                nodeType = 'switchConditionNode'
                nodeData = {
                    label: id,
                    variable: object.variable || '',
                    alias: object.alias || '',
                    setvariables: object.setvariables || {},
                    conditions: object.conditions || {},
                    body: object.body || 'strict',
                }
                break

            case 'setvariables':
                nodeType = 'variablesNode'
                try {
                    const parsed = JSON.parse(object.setvars || '{}')
                    nodeData = { label: id, variables: parsed }
                } catch {
                    nodeData = { label: id, variables: {} }
                }
                break

            /**
             * 🧩 GETDATA COMPLETE / MENU / SIMPLETEXT VARIANTS
             * ----------------------------------------------------
             * Detecta automáticamente tipo de formulario:
             *  - "GETDATA" → FormGetDataCompleteGetData
             *  - "SIMPLETEXT" → FormGetDataCompleteSimpleText
             *  - Otros → QuickReply / List
             */
            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
            case 'menu': {
                nodeType = 'menuNode'
                const interactive = object.interactive ?? {}
                const setvars = object.setvariables || {}
                const conditions = object.conditions || {}

                // 🧠 Detección automática de variante
                let variantType: string | null = null
                const declaredType = String(object.type || '').toUpperCase()

                if (declaredType === 'GETDATA') variantType = 'GETDATA'
                else if (declaredType === 'SIMPLETEXT')
                    variantType = 'SIMPLETEXT'
                else if (
                    interactive.type === 'list' ||
                    Object.keys(setvars).length > 4
                )
                    variantType = 'list'
                else variantType = 'quick_reply'

                // 🧩 Genera opciones legibles
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
                    type: variantType,
                    interactive: {
                        ...interactive,
                        type: variantType?.toLowerCase?.() ?? 'quick_reply',
                        options: !['list', 'GETDATA', 'SIMPLETEXT'].includes(
                            variantType
                        )
                            ? options
                            : undefined,
                        items:
                            variantType === 'list'
                                ? interactive.items || []
                                : undefined,
                    },
                }

                gdcBaseStore.initNode(id)
                gdcBaseStore.setNodeData(id, fullObject)

                // 🧩 Persistencia en stores de variantes
                variantStore.setVariantType(id, variantType.toLowerCase())
                variantStore.setVariantOptions(id, options)
                variantStore.setVariantConditions(id, conditions)

                nodeData = { label: id, object: fullObject }

                console.log(`🧩 [Importer] ${id} detectado como ${variantType}`)
                break
            }

            case 'generatetoken': {
                nodeType = 'generateTokenNode'
                const tokenStore =
                    require('@/store/useGenerateTokenStore').useGenerateTokenStore.getState()
                const mode = object?.mode || 'simpletext'
                const text = object?.text || ''
                const bodyRaw = object?.body || ''
                const script = object?.script || ''
                let bodyObj: Record<string, string> = {}
                try {
                    if (typeof bodyRaw === 'string' && bodyRaw.includes('=')) {
                        bodyRaw.split(',').forEach((pair: string) => {
                            const [key, val] = pair.split('=')
                            if (key && val) bodyObj[key.trim()] = val.trim()
                        })
                    } else if (typeof bodyRaw === 'object') {
                        bodyObj = bodyRaw
                    }
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando body en ${id}:`,
                        err
                    )
                }
                const fullObject = { mode, text, body: bodyObj, script }
                tokenStore.initNode(id)
                tokenStore.setNodeData(id, fullObject)
                nodeData = { label: id, ...fullObject }
                console.log(
                    `🔑 [Importer] GenerateToken cargado: ${id}`,
                    fullObject
                )
                break
            }

            case 'chatbotiarequest':
                nodeType = 'chatBotIARequestNode'
                nodeData = {
                    label: id,
                    variable: object.variable || '',
                    url: object.url || '',
                    body: object.body || '',
                    prompt: object.prompt || '',
                }
                break

            case 'saverecord': {
                nodeType = 'saveRecordNode'
                const saveRecordStore =
                    require('@/store/useSaveRecordStore').useSaveRecordStore.getState()
                const auth = {
                    headers: object?.auth?.headers || {},
                    vartoken: object?.auth?.vartoken || '',
                    body: object?.auth?.body || '{}',
                    url: object?.auth?.url || '',
                }
                const body = object?.body || '{}'
                const fullObject = {
                    auth,
                    body,
                    nextNodeId: step?.onTrue || undefined,
                }
                saveRecordStore.initNode(id)
                saveRecordStore.setNodeData(id, fullObject)
                nodeData = { label: id, ...fullObject }
                console.log(
                    `💾 [Importer] SaveRecord inicializado: ${id}`,
                    fullObject
                )
                break
            }

            case 'mysqlquery':
                nodeType = 'mysqlQueryNode'
                nodeData = {
                    label: id,
                    query: object.query || '',
                    variable: object.variable || '',
                    alias: object.alias || '',
                    script: object.script || '',
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
        if (!uniqueNodeIds.has(id)) continue

        addEdge(id, onTrue, 'onTrue')
        addEdge(id, onFalse, 'onFalse')
        addEdge(id, onError, 'onError')
        if (object?.nextNodeId) addEdge(id, object.nextNodeId, 'onSuccess')

        const conditions = object?.conditions || {}
        const interactiveType = object?.interactive?.type
        const declaredType = String(object?.type || '').toUpperCase()

        // 🔗 Manejo especial para GETDATA y SIMPLETEXT
        if (
            ['GETDATA', 'SIMPLETEXT'].includes(declaredType) &&
            Object.keys(conditions).length
        ) {
            for (const [key, targetId] of Object.entries(conditions)) {
                addEdge(id, targetId as string, `cond_${key}`)
            }
        }

        // QuickReply / List
        if (
            ['quick_reply', 'list'].includes(interactiveType) &&
            Object.keys(conditions).length
        ) {
            for (const [key, targetId] of Object.entries(conditions)) {
                addEdge(id, targetId as string, `option_${key}`)
            }
        }
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

    if (duplicateIds.size > 0) {
        console.warn(
            '⚠️ Nodos duplicados omitidos:',
            [...duplicateIds].join(', ')
        )
    }
    if (unsupported.size > 0) {
        console.warn('⚠️ Tipos no soportados:')
        console.table([...unsupported].map((t) => ({ tipo: t })))
    } else {
        console.log('✅ Todos los tipos soportados.')
    }

    console.groupEnd()
    return { nodes, edges }
}
