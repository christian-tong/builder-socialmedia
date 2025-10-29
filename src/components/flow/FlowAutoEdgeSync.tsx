// src\components\flow\FlowAutoEdgeSync.tsx

// src/components/flow/FlowAutoEdgeSync.tsx
'use client'

import { useEffect } from 'react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { createConnectionIfMissing } from '@/lib/edgeUtils'

/**
 * 🧠 FlowAutoEdgeSync (versión final estable)
 * ---------------------------------------------------------------
 * - Centraliza todos los callbacks post-save.
 * - Usa `createConnectionIfMissing` (puro, sin hooks).
 * - No rompe las reglas de React ni los tipos.
 */
export function FlowAutoEdgeSync() {
    const { setAfterSaveCallback: setGetData } = useGetDataCompleteBaseStore()
    const { setAfterSaveCallback: setSaveRecord } = useSaveRecordStore()
    const { setAfterSaveCallback: setSwitch } = useSwitchConditionStore()

    // 🟣 QuickReply → crea edges por opciones
    useEffect(() => {
        setGetData((nodeId, data) => {
            if (data.interactive?.type !== 'quick_reply') return
            const opts = data.interactive.options || []
            opts.forEach((opt) => {
                if (opt.nextNodeId) {
                    createConnectionIfMissing(
                        nodeId,
                        opt.nextNodeId,
                        opt.postbackText
                    )
                }
            })
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
