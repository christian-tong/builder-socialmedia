// src\utils\getNestedValue.ts
/**
 * 🧩 getNestedValue
 * ------------------------------------------------------
 * Permite acceder de forma segura a propiedades anidadas
 * dentro de un objeto usando notación por puntos.
 * Ejemplo:
 * getNestedValue(data, 'object.interactive.options.0.title')
 *
 * Devuelve un string seguro para inputs controlados.
 */
export function getNestedValue(obj: any, path: string): string {
    if (!obj || !path) return ''

    try {
        // Divide el path "a.b.c" en ["a", "b", "c"]
        const value = path.split('.').reduce((acc, key) => acc?.[key], obj)

        // Asegura tipo string para usar en inputs sin romper React
        if (typeof value === 'string' || typeof value === 'number') {
            return String(value)
        }

        // Si el valor es nulo o undefined, retorna cadena vacía
        return ''
    } catch {
        return ''
    }
}
