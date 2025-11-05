// src/lib/jsonFlowGenerator.ts

// src/lib/jsonFlowGenerator.ts
import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useMySQLQueryStore } from '@/store/useMySQLQueryStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { useVariablesStore } from '@/store/useVariablesStore'

/**
 * 🧠 generateConversationJson (v5.9 – Full Store-Aware Export + Clean SwitchCondition)
 * ------------------------------------------------------------------------
 * ✅ Lee datos directamente desde los Zustand stores activos
 * ✅ Limpia valores vacíos (MySQL, SaveRecord, SwitchCondition, Variables)
 * ✅ Genera setvariables válidos en SwitchCondition
 * ✅ Mantiene compatibilidad total con importador v5.6+
 * ✅ Estructura final: { process: { steps: [...] } }
 */
export function generateConversationJson(
    nodes: Node<Record<string, any>>[],
    edges: Edge[]
): { process: { steps: any[] } } {
    const steps: any[] = []

    const findTarget = (sourceId: string, handleId?: string): string | null => {
        const match = edges.find(
            (e) =>
                e.source === sourceId &&
                (handleId ? e.sourceHandle === handleId : true)
        )
        return match?.target ?? null
    }

    // 🧩 Stores activos
    const variantStore = useVariantTypeStore.getState()
    const mysqlStore = useMySQLQueryStore.getState()
    const saveRecordStore = useSaveRecordStore.getState()
    const switchStore = useSwitchConditionStore.getState()
    const varsStore = useVariablesStore.getState()

    for (const node of nodes) {
        const { id, type, data } = node
        const onTrue = findTarget(id, 'onTrue')
        const onFalse = findTarget(id, 'onFalse')
        const onError = findTarget(id, 'onError')
        const onSuccess = findTarget(id, 'onSuccess')

        let action = ''
        let object: any = {}
        let description = data?.description ?? ''
        let isTemplate = false

        switch (type) {
            // 🟢 Inicio
            case 'startNode':
                action = 'startstep'
                object = {}
                break

            // 🟦 Texto simple
            case 'simpleTextNode':
                action = 'simpletext'
                object = { text: encodeURIComponent(data?.message ?? '') }
                break

            // 🧩 Variables
            case 'variablesNode': {
                const nodeVars = varsStore.getNodeVariables(id)
                const merged = Object.fromEntries(
                    nodeVars
                        .filter((v) => v.key?.trim())
                        .map((v) => [v.key.trim(), v.value])
                )
                action = 'setvariables'
                object = { setvars: JSON.stringify(merged) }
                break
            }

            // 👤 Set Customer ID
            case 'setCustomerIDNode': {
                type CustomerData = {
                    variable?: string
                    alias?: string
                    object?: any
                }
                const d = (data ?? {}) as CustomerData
                action = 'setcustomerid'
                object = d.object ?? {
                    variable: d.variable ?? '',
                    alias: d.alias ?? '',
                }
                break
            }

            // 🧠 IA Request
            case 'chatBotIARequestNode':
                action = 'chatbotiarequest'
                object = {
                    variable: data?.variable ?? '',
                    url: data?.url ?? '',
                    body: data?.body ?? '{}',
                }
                break

            // 🧩 MySQL Query
            case 'mysqlQueryNode': {
                const storeObj = mysqlStore.getNodeData(id)
                action = 'mysqlquery'
                object = {
                    mode: storeObj.mode ?? 'simpletext',
                    setvar: storeObj.setvar ?? '',
                    query: storeObj.query ?? '',
                    variable: storeObj.variable ?? '',
                    alias: storeObj.alias ?? '',
                    script: storeObj.script ?? '',
                }
                break
            }

            // 💾 Save Record
            case 'saveRecordNode': {
                const storeObj = saveRecordStore.getNodeData(id)
                action = 'saverecord'
                object = {
                    auth: storeObj.auth,
                    body: storeObj.body,
                }
                break
            }

            // 🧬 SwitchCondition — v3.0 Smart Sync SetVariables
            case 'switchConditionNode': {
                const cfg = switchStore.byId[id]
                action = 'switchcondition'

                if (cfg) {
                    // 🧠 1️⃣ Filtrar setvariables válidos existentes
                    let safeSetVars = Object.fromEntries(
                        cfg.setvariables
                            .filter(
                                (s) =>
                                    s.key?.trim() !== '' &&
                                    s.value?.trim() !== ''
                            )
                            .map((s) => [s.key.trim(), s.value.trim()])
                    )

                    // 🧩 2️⃣ Generar dinámicamente si está vacío
                    if (Object.keys(safeSetVars).length === 0) {
                        const conditionKeys = Object.keys(cfg.connections || {})
                        safeSetVars = Object.fromEntries(
                            conditionKeys.map((val, i) => [String(i + 1), val])
                        )
                    }

                    // 🧩 3️⃣ Filtrar conexiones válidas
                    const safeConnections = Object.fromEntries(
                        Object.entries(cfg.connections || {}).filter(
                            ([, target]) => target && target.trim() !== ''
                        )
                    )

                    // 🧩 4️⃣ Ensamblar objeto final
                    object = {
                        setvariables: safeSetVars,
                        variable: cfg.variable ?? '',
                        alias: cfg.alias ?? '',
                        conditions: safeConnections,
                        body: cfg.mode ?? 'strict',
                    }
                } else {
                    object = {}
                }

                break
            }

            // 🔑 Generar Token
            case 'generateTokenNode':
                action = 'generatetoken'
                object = data?.object ?? {
                    mode: data?.mode ?? 'simpletext',
                    text: data?.text ?? '',
                    body: data?.body ?? '',
                    script: data?.script ?? '',
                }
                break

            // 🧩 GetDataComplete (menú)
            case 'menuNode': {
                const variantType = variantStore.getVariantType(id)
                const options = variantStore.getVariantOptions(id)
                const conditions = variantStore.getVariantConditions(id)

                const setvariables: Record<string, string> = {}
                options.forEach((opt) => {
                    if (opt.postbackText)
                        setvariables[opt.postbackText] = opt.title ?? ''
                })

                const baseObject: Record<string, any> = {
                    setvariables,
                    variable: data?.object?.variable ?? 'Opcion',
                    alias: data?.object?.alias ?? 'Opcion',
                    conditions,
                    iterations: '2',
                    timeOut: '90000',
                }

                baseObject.interactive =
                    variantType === 'quick_reply'
                        ? {
                              type: 'quick_reply',
                              content: {
                                  type: 'text',
                                  text: encodeURIComponent(data?.message ?? ''),
                              },
                              options: options.map((o) => ({
                                  postbackText: o.postbackText,
                                  type: 'text',
                                  title: encodeURIComponent(o.title ?? ''),
                              })),
                          }
                        : {
                              globalButtons: [
                                  { type: 'text', title: 'Elegir' },
                              ],
                              type: 'list',
                              body: encodeURIComponent(data?.message ?? ''),
                              items: [
                                  {
                                      options: options.map((o) => ({
                                          postbackText: o.postbackText,
                                          type: 'text',
                                          title: encodeURIComponent(
                                              o.title ?? ''
                                          ),
                                      })),
                                      title: 'Elija una opción',
                                  },
                              ],
                          }

                action = 'getdatacomplete'
                object = baseObject
                break
            }

            // 🕓 Condición de tiempo
            case 'timeConditionNode':
                action = 'timecondition'
                object = { condition: data?.condition ?? '' }
                break

            // 🧾 No-op
            case 'noopNode':
                action = 'noop'
                object = {}
                break

            // 🟠 Derivación
            case 'derivateNode':
                action = 'derivate'
                object = {
                    timeoutMessage: encodeURIComponent(
                        data?.timeoutMessage ?? ''
                    ),
                    queueMessage: encodeURIComponent(data?.queueMessage ?? ''),
                    inboundMessage: encodeURIComponent(
                        data?.inboundMessage ?? ''
                    ),
                    skill: data?.skill ?? '',
                }
                break

            // 🔴 Fin
            case 'endNode':
                action = 'hangup'
                object = { HangupCause: data?.hangupCause ?? '' }
                break

            default:
                console.warn(`⚠️ Tipo no soportado: ${type} (${id})`)
                continue
        }

        steps.push({
            id,
            action,
            onTrue,
            onFalse,
            onError,
            onSuccess,
            isTemplate,
            description,
            object,
        })
    }

    return { process: { steps } }
}
