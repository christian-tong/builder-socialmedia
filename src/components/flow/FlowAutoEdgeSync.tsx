// src\components\flow\FlowAutoEdgeSync.tsx

'use client'

import { useEffect } from 'react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { createConnectionIfMissing } from '@/lib/edgeUtils'
import type {
    QuickReplyInteractive,
    ListInteractive,
    GetDataCompleteObject,
} from '@/types/getDataComplete'

/**
 * 🧠 FlowAutoEdgeSync (v3.5 — soporta GETDATA + SIMPLETEXT)
 * ------------------------------------------------------------------
 * - QuickReply → crea edges por cada opción (nextNodeId)
 * - List → crea edges por cada opción de cada item
 * - GetData → crea edges según `conditions` y `setvariables`
 * - SimpleText → crea edge simple por variable asignada (si aplica)
 * - SaveRecord / SwitchCondition → sin cambios
 * - Usa createConnectionIfMissing (seguro e idempotente)
 */
export function FlowAutoEdgeSync() {
    const { setAfterSaveCallback: setGetData } = useGetDataCompleteBaseStore()
    const { setAfterSaveCallback: setSaveRecord } = useSaveRecordStore()
    const { setAfterSaveCallback: setSwitch } = useSwitchConditionStore()

    // 🟣 GetDataComplete (QuickReply + List + GetData + SimpleText)
    useEffect(() => {
        setGetData((nodeId, data) => {
            const obj = data as Partial<GetDataCompleteObject>
            const interactive = obj?.interactive as
                | QuickReplyInteractive
                | ListInteractive
                | undefined

            if (!obj) return
            const type = obj.type?.toUpperCase()

            // 💬 QUICK_REPLY
            if (interactive?.type === 'quick_reply') {
                interactive.options?.forEach((opt) => {
                    if (opt.nextNodeId) {
                        createConnectionIfMissing(
                            nodeId,
                            opt.nextNodeId,
                            opt.postbackText
                        )
                    }
                })
                return
            }

            // 🔵 LIST
            if (interactive?.type === 'list') {
                interactive.items?.forEach((item) => {
                    item.options?.forEach((opt) => {
                        const nextId = (opt as any).nextNodeId
                        if (nextId) {
                            createConnectionIfMissing(
                                nodeId,
                                nextId,
                                opt.postbackText
                            )
                        }
                    })
                })
                return
            }

            // 🧾 GETDATA → crea edges dinámicos por conditions o setvariables
            if (type === 'GETDATA' || type === 'getdata') {
                const { conditions = {}, setvariables = {} } = obj
                Object.entries(conditions).forEach(([key, targetId]) => {
                    if (targetId)
                        createConnectionIfMissing(
                            nodeId,
                            targetId,
                            `cond:${key}`
                        )
                })
                Object.entries(setvariables).forEach(([key, val]) => {
                    if (val)
                        createConnectionIfMissing(nodeId, val, `setvar:${key}`)
                })
                return
            }

            // 🗒️ SIMPLETEXT → crea edge directo si hay variable destino
            if (type === 'SIMPLETEXT' || type === 'simple_text') {
                const { variable } = obj
                if (variable) {
                    createConnectionIfMissing(nodeId, variable, 'onComplete')
                }
            }
        })
    }, [setGetData])

    // 🟢 SaveRecord → edge onSuccess
    useEffect(() => {
        setSaveRecord((nodeId, data) => {
            if (!data.nextNodeId) return
            createConnectionIfMissing(nodeId, data.nextNodeId, 'onSuccess')
        })
    }, [setSaveRecord])

    // 🔴 SwitchCondition → edges SI / NO / otros
    useEffect(() => {
        setSwitch((nodeId, cfg) => {
            Object.entries(cfg.connections || {}).forEach(([val, target]) => {
                if (target)
                    createConnectionIfMissing(nodeId, target, `on:${val}`)
            })
        })
    }, [setSwitch])

    return null
}
