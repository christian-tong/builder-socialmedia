// src\hooks\service\useBotsService.ts

'use client'

import { useState, useCallback } from 'react'
import { getListBots, type BotListItem } from '@/services/getListBotsService'

/**
 * 🧩 useBotsService — Encapsula toda la lógica de carga de bots
 * -------------------------------------------------------------
 * - Maneja loading, error y data
 * - Usa getListBots (que ya maneja toast y errores)
 * - Reusable por cualquier componente
 */
export function useBotsService() {
    const [data, setData] = useState<BotListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchBots = useCallback(async (type = 'SM') => {
        setLoading(true)
        setError(null)
        const res = await getListBots(type)
        if (res.success && res.data) {
            setData(res.data)
        } else {
            setError(
                res.message ?? res.error ?? 'Error desconocido al obtener bots.'
            )
        }
        setLoading(false)
    }, [])

    return { data, loading, error, fetchBots }
}
