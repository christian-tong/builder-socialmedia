// src\components\flow\FlowAutoEdgeSync.tsx
'use client'

import { useEffect } from 'react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { createConnectionIfMissingGlobal } from '@/hooks/useNodeConnections'
import type {
    QuickReplyInteractive,
    ListInteractive,
    GetDataCompleteObject,
} from '@/types/getDataComplete'

/**
 * 🧠 FlowAutoEdgeSync (v3.8 — Safe Handles + Deferred)
 * --------------------------------------------------------------
 * - Solo crea edges cuando el handle existe visualmente.
 * - Reintenta automáticamente si aún no está montado.
 * - Evita superposición en importación masiva.
 */
export function FlowAutoEdgeSync() {
    const { setAfterSaveCallback: setGetData } = useGetDataCompleteBaseStore()
    const { setAfterSaveCallback: setSaveRecord } = useSaveRecordStore()
    const { setAfterSaveCallback: setSwitch } = useSwitchConditionStore()

    const safeCreate = (
        sourceId: string,
        targetId: string,
        handleId?: string,
        retries = 5
    ) => {
        const handleSel = `[data-handleid="${sourceId}-${handleId}"]`
        const handleExists = document.querySelector(handleSel)
        if (handleExists) {
            createConnectionIfMissingGlobal(sourceId, targetId, handleId)
            return
        }
        if (retries > 0) {
            setTimeout(
                () => safeCreate(sourceId, targetId, handleId, retries - 1),
                150
            )
        }
    }

    // 🟣 GetDataComplete
    useEffect(() => {
        setGetData((nodeId, data) => {
            const obj = data as Partial<GetDataCompleteObject>
            if (!obj) return
            const interactive = obj.interactive as
                | QuickReplyInteractive
                | ListInteractive
                | undefined
            const type = obj.interactive?.type?.toUpperCase()

            setTimeout(() => {
                if (interactive?.type === 'quick_reply') {
                    interactive.options?.forEach((opt) => {
                        if (opt.nextNodeId)
                            safeCreate(nodeId, opt.nextNodeId, opt.postbackText)
                    })
                    return
                }

                if (interactive?.type === 'list') {
                    interactive.items?.forEach((item) =>
                        item.options?.forEach((opt) => {
                            const nextId = (opt as any).nextNodeId
                            if (nextId)
                                safeCreate(nodeId, nextId, opt.postbackText)
                        })
                    )
                    return
                }

                if (type === 'GETDATA') {
                    Object.entries(obj.conditions || {}).forEach(
                        ([key, targetId]) => {
                            if (targetId)
                                safeCreate(nodeId, targetId as string, key)
                        }
                    )
                }

                if (type === 'SIMPLETEXT') {
                    Object.keys(obj.setvariables || {}).forEach((k) => {
                        const target = (obj.setvariables as any)[k]
                        if (target) safeCreate(nodeId, target, k)
                    })
                }
            }, 400)
        })
    }, [setGetData])

    // 🟢 SaveRecord
    useEffect(() => {
        setSaveRecord((nodeId, data) => {
            setTimeout(() => {
                if (data.nextNodeId)
                    safeCreate(nodeId, data.nextNodeId, 'onSuccess')
            }, 400)
        })
    }, [setSaveRecord])

    // 🔴 SwitchCondition
    useEffect(() => {
        setSwitch((nodeId, cfg) => {
            setTimeout(() => {
                Object.entries(cfg.connections || {}).forEach(
                    ([val, target]) => {
                        if (target) safeCreate(nodeId, target, `on:${val}`)
                    }
                )
            }, 400)
        })
    }, [setSwitch])

    return null
}
