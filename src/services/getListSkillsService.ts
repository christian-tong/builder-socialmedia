// src\services\getListSkillsService.ts

'use client'

import { toast } from 'sonner'

/**
 * 🧩 Tipado del Skill
 * Solo incluimos los campos importantes: skillNumber, skillName, skillTimeOut
 */
export interface SkillItem {
    skillNumber: number
    skillName: string
    skillTimeOut: number
}

/**
 * 🌐 Estructura de respuesta del endpoint
 */
export interface SkillListResponse {
    success: boolean
    message?: string
    data?: SkillItem[]
    error?: string
}

/**
 * 🌐 getListSkillsService v2.0 — Manejo completo de estado y errores
 * ------------------------------------------------------------------
 * - Mismo patrón que getListBotsService
 * - Controla loading, error y success con toasts
 * - Retorna solo los campos relevantes del endpoint obtenerSkills
 */
export async function getListSkills(
    apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:44385'
): Promise<SkillListResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
        toast.loading('Cargando lista de skills...', { id: 'skills-list' })

        const response = await fetch(`${apiUrl}/api/agente/obtenerSkills`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error ${response.status}: ${errorText}`)
        }

        const json = await response.json()

        // 🧠 Extraemos la lista de skills desde json.skills
        const skills: SkillItem[] = Array.isArray(json.skills)
            ? json.skills.map((s: any) => ({
                  skillNumber: s.skillNumber ?? 0,
                  skillName: s.skillName ?? '',
                  skillTimeOut: s.skillTimeOut ?? 0,
              }))
            : []

        toast.success('Skills cargados correctamente ✅', { id: 'skills-list' })
        return { success: true, data: skills }
    } catch (err: any) {
        console.error('❌ Error en getListSkills:', err)
        const message =
            err.name === 'AbortError'
                ? 'La solicitud de skills fue cancelada (timeout).'
                : err.message || 'Error desconocido al obtener skills.'
        toast.error(message, { id: 'skills-list' })
        return { success: false, message, error: message }
    } finally {
        clearTimeout(timeout)
    }
}
