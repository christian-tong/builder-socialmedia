// src/services/skillService.ts

import { fakeApiGet } from './apiBase'
import { handleServiceError } from './utils/errorHandler'
import { alertHandler } from './utils/alertHandler'

export interface Skill {
    id: number
    label: string
}

/**
 * 🧩 getSkills — Obtiene lista de skills desde fuente local o API
 */
export async function getSkills(): Promise<Skill[]> {
    try {
        const skills = await fakeApiGet<Skill[]>('/skills')
        return skills
    } catch (error) {
        const msg = handleServiceError(error, 'obtener lista de skills')
        alertHandler.error(msg)
        return []
    }
}
