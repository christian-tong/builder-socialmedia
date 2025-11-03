// src\lib\jsonImporterWiContact.ts

import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import type {
    GetDataCompleteObject,
    InteractiveBlock,
    QuickReplyInteractive,
    ListInteractive,
    GetDataInteractive,
    SimpleTextInteractive,
} from '@/types/getDataComplete'
import { nodeTypes } from '@/config/nodesConfig'

/**
 * 🔁 convertWiContactToFlow (v5.6 – VariablesStore Sync)
 * ------------------------------------------------------------------------
 * ✅ Sincroniza VariablesNode con useVariablesStore
 * ✅ Auto-detecta variantes GETDATA / SIMPLETEXT / quick_reply / list
 * ✅ Integra useSaveRecordStore, useVariantTypeStore y useSwitchConditionStore
 * ✅ Evita duplicados de IDs y crea edges válidos y únicos
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
    const unsupported = new Set<string>()
    const duplicateIds = new Set<string>()
    const uniqueNodeIds = new Set<string>()

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

    console.groupCollapsed('🧩 [Importer v5.6] WiContact / osm_wsp → Flow')
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

            case 'switchcondition': {
                nodeType = 'switchConditionNode'
                const variable: string = object.variable || ''
                const alias: string = object.alias || ''
                const setvariables: Record<string, string> =
                    (object.setvariables as Record<string, string>) || {}
                const conditions: Record<string, string> =
                    (object.conditions as Record<string, string>) || {}
                const mode: 'strict' | 'flex' =
                    (object.body as 'strict' | 'flex') || 'strict'

                const switchStore =
                    require('@/store/useSwitchConditionStore').useSwitchConditionStore.getState()
                switchStore.initNode(id)
                switchStore.setVariable(id, variable)
                switchStore.setAlias(id, alias)
                switchStore.setMode(id, mode)

                const values = Object.values(setvariables) as string[]
                values.forEach((val) => {
                    if (typeof val === 'string' && val.length > 0)
                        switchStore.addValue(id, val)
                })
                Object.entries(conditions).forEach(([val, target]) => {
                    if (typeof target === 'string' && target)
                        switchStore.setConnection(id, val, target)
                })

                nodeData = {
                    label: id,
                    variable,
                    alias,
                    setvariables,
                    conditions,
                    body: mode,
                }
                console.log(`🪄 [Importer] SwitchCondition inicializado: ${id}`)
                break
            }

            /** 🟣 NUEVO BLOQUE - Sincronización con useVariablesStore */
            case 'setvariables': {
                nodeType = 'variablesNode'

                const variablesStore =
                    require('@/store/useVariablesStore').useVariablesStore.getState()

                let parsed: Record<string, string> = {}
                try {
                    parsed =
                        typeof object.setvars === 'string'
                            ? JSON.parse(object.setvars)
                            : object.setvars || {}
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando setvars en ${id}:`,
                        err
                    )
                    parsed = {}
                }

                const entries = Object.entries(parsed).map(([key, value]) => ({
                    key,
                    value: String(value).toUpperCase(),
                }))
                variablesStore.setNodeVariables(id, entries)

                nodeData = { label: id, variables: entries }
                console.log(
                    `🟣 [Importer] VariablesNode inicializado: ${id}`,
                    parsed
                )
                break
            }

            /** 🧩 GETDATA COMPLETE / MENU / SIMPLETEXT VARIANTS */
            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
            case 'menu': {
                nodeType = 'menuNode'
                const interactiveIn = object.interactive ?? {}
                const setvars: Record<string, string> =
                    (object.setvariables as Record<string, string>) || {}
                const conditions: Record<string, string> =
                    (object.conditions as Record<string, string>) || {}

                type Variant = 'GETDATA' | 'SIMPLETEXT' | 'quick_reply' | 'list'
                const declaredRaw = String(object.type || '')
                const declaredUp = declaredRaw.toUpperCase()

                let variantType: Variant
                if (declaredUp === 'GETDATA' || declaredUp === 'GET_DATA')
                    variantType = 'GETDATA'
                else if (
                    declaredUp === 'SIMPLETEXT' ||
                    declaredUp === 'SIMPLE_TEXT'
                )
                    variantType = 'SIMPLETEXT'
                else if (
                    interactiveIn.type === 'list' ||
                    Object.keys(setvars).length > 4
                )
                    variantType = 'list'
                else variantType = 'quick_reply'

                const rawOptions =
                    interactiveIn.options ??
                    interactiveIn.items?.[0]?.options ??
                    Object.entries(setvars).map(([key, title]) => ({
                        postbackText: key,
                        title,
                    }))

                const options = (rawOptions || []).map(
                    (opt: any, i: number) => ({
                        postbackText: String(opt?.postbackText ?? i + 1),
                        title: decodeURIComponent(String(opt?.title ?? '')),
                        type: 'text' as const,
                    })
                )

                const prompt = decodeURIComponent(
                    interactiveIn.body ||
                        interactiveIn.content?.text ||
                        object.prompt ||
                        ''
                )
                const description: string = object.description || ''

                let interactive: InteractiveBlock | undefined
                if (variantType === 'quick_reply') {
                    interactive = {
                        type: 'quick_reply',
                        msgid: 'qr_import',
                        content: { text: prompt, type: 'text' },
                        options,
                        conditions: Object.keys(conditions).length
                            ? conditions
                            : undefined,
                    } as QuickReplyInteractive
                } else if (variantType === 'list') {
                    const items = interactiveIn.items || [
                        {
                            title: 'Elija una opción',
                            options: options.map((o) => ({ ...o })),
                        },
                    ]
                    interactive = {
                        type: 'list',
                        body: prompt,
                        items,
                        globalButtons: interactiveIn.globalButtons || [],
                        conditions: Object.keys(conditions).length
                            ? conditions
                            : undefined,
                    } as ListInteractive
                } else if (variantType === 'GETDATA') {
                    interactive = {
                        type: 'GETDATA',
                        prompt,
                        description,
                    } as GetDataInteractive
                } else if (variantType === 'SIMPLETEXT') {
                    interactive = {
                        type: 'SIMPLETEXT',
                        prompt,
                        description,
                    } as SimpleTextInteractive
                }

                const fullObject: GetDataCompleteObject = {
                    id,
                    action: 'getdatacomplete',
                    alias: object.alias || '',
                    variable: object.variable || '',
                    prompt,
                    setvariables: setvars,
                    conditions,
                    type: variantType,
                    interactive,
                    description,
                    saveHidden: Boolean(object.saveHidden),
                    setvar: object.setvar || '',
                    condition: String(object.condition || ''),
                    iterations: String(object.iterations || '1'),
                    timeOut: String(object.timeOut || '60000'),
                    groodText: object.groodText || '',
                }

                gdcBaseStore.initNode(id)
                gdcBaseStore.setNodeData(id, fullObject)

                if (variantType === 'quick_reply' || variantType === 'list') {
                    variantStore.setVariantType(id, variantType)
                    variantStore.setVariantOptions(id, options)
                    variantStore.setVariantConditions(id, conditions)
                }

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
                    } else if (typeof bodyRaw === 'object') bodyObj = bodyRaw
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

            /** 🧠 SetCustomerID */
            case 'setcustomerid': {
                nodeType = 'setCustomerIDNode'

                let optionsObj: Record<string, string> = {}

                try {
                    if (object?.options && typeof object.options === 'object') {
                        optionsObj = object.options
                    } else if (
                        typeof object === 'object' &&
                        !Array.isArray(object)
                    ) {
                        // fallback: si vino plano como { variable: '', alias: '' }
                        optionsObj = {
                            variable: object.variable || '',
                            alias: object.alias || '',
                        }
                    }
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando options en ${id}:`,
                        err
                    )
                }

                nodeData = {
                    label: id,
                    object: {
                        options: optionsObj,
                    },
                }

                console.log(
                    `🧠 [Importer] SetCustomerIDNode creado: ${id}`,
                    optionsObj
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

            case 'mysqlquery': {
                nodeType = 'mysqlQueryNode'

                const mysqlStore =
                    require('@/store/useMySQLQueryStore').useMySQLQueryStore.getState()

                // 🧩 Normalización
                const mode = object?.mode || 'simpletext'
                const setvar = object?.setvar || ''
                const query = object?.query || ''
                const variable = object?.variable || ''
                const alias = object?.alias || ''
                const script = object?.script || ''

                // 🧱 Objeto completo
                const fullObject = {
                    mode,
                    setvar,
                    query,
                    variable,
                    alias,
                    script,
                }

                // 🧠 Sincronizar en store
                mysqlStore.initNode(id)
                mysqlStore.setNodeData(id, fullObject)

                // 🧩 Data para el nodo visual
                nodeData = {
                    label: id,
                    object: fullObject,
                }

                console.log(
                    `🧩 [Importer] MySQLQueryNode inicializado: ${id}`,
                    fullObject
                )
                break
            }

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
        } else if (nodeType) unsupported.add(nodeType)
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
        if ((object as any)?.nextNodeId)
            addEdge(id, (object as any).nextNodeId, 'onSuccess')

        const conditions = (object as any)?.conditions as
            | Record<string, string>
            | undefined
        const interactiveType = (object as any)?.interactive?.type as
            | 'quick_reply'
            | 'list'
            | 'GETDATA'
            | 'SIMPLETEXT'
            | undefined
        const declaredTypeUp = String((object as any)?.type || '').toUpperCase()

        if (
            (declaredTypeUp === 'GETDATA' || declaredTypeUp === 'SIMPLETEXT') &&
            conditions &&
            Object.keys(conditions).length
        )
            for (const [key, targetId] of Object.entries(conditions))
                addEdge(id, targetId as string, `cond_${key}`)

        if (
            (interactiveType === 'quick_reply' || interactiveType === 'list') &&
            conditions &&
            Object.keys(conditions).length
        )
            for (const [key, targetId] of Object.entries(conditions))
                addEdge(id, targetId as string, `option_${key}`)
    }

    // 📍 Layout básico
    nodes.forEach(
        (n, i) =>
            (n.position = { x: (i % 5) * 320, y: Math.floor(i / 5) * 220 })
    )

    console.log(
        '✅ Nodos renderizados:',
        nodes.length,
        '| Edges:',
        edges.length
    )
    if (duplicateIds.size > 0)
        console.warn(
            '⚠️ Nodos duplicados omitidos:',
            [...duplicateIds].join(', ')
        )
    if (unsupported.size > 0) {
        console.warn('⚠️ Tipos no soportados:')
        console.table([...unsupported].map((t) => ({ tipo: t })))
    } else console.log('✅ Todos los tipos soportados.')

    console.groupEnd()
    return { nodes, edges }
}
