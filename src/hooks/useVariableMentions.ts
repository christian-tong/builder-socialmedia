// src\hooks\useVariableMentions.ts
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useVariablesStore } from '@/store/useVariablesStore'

interface MentionSuggestion {
    key: string
    value: string
}

interface UseVariableMentionsOptions {
    initialValue?: string
    onValueChange?: (value: string) => void
}

/**
 * 🧠 useVariableMentions (versión 100% estable y protegida)
 * -----------------------------------------------------
 * ✅ Sin bucles infinitos
 * ✅ Sin re-renderes redundantes
 * ✅ Sin pérdida de foco
 * ✅ Detecta cambios reales entre valor interno y externo
 */
export function useVariableMentions({
    initialValue = '',
    onValueChange,
}: UseVariableMentionsOptions = {}) {
    const [value, setValue] = useState(initialValue)
    const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [cursorPos, setCursorPos] = useState(0)
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)

    const allVariables = useVariablesStore((s) => s.getAllVariables())

    const isInternalUpdate = useRef(false)
    const firstLoad = useRef(true)

    /** 🧠 Solo re-sincroniza si el valor inicial cambia realmente (p. ej., cambio de nodo) */
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false
            setValue(initialValue)
            return
        }

        if (initialValue !== value && !isInternalUpdate.current) {
            setValue(initialValue)
        }

        isInternalUpdate.current = false
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue])

    /** ✍️ Maneja escritura y detección de menciones */
    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const val = e.target.value
            const cursor = e.target.selectionStart ?? 0

            if (val === value) return // 🔒 evita renders innecesarios

            setValue(val)
            setCursorPos(cursor)

            isInternalUpdate.current = true
            onValueChange?.(val)

            const beforeCursor = val.slice(0, cursor)
            const match = /@([A-Z0-9_]*)$/i.exec(beforeCursor)

            if (match) {
                const query = match[1].toUpperCase()
                const filtered = Object.entries(allVariables)
                    .filter(([key]) => key.toUpperCase().includes(query))
                    .map(([key, value]) => ({ key, value }))
                setSuggestions(filtered)
                setShowSuggestions(filtered.length > 0)
            } else {
                setShowSuggestions(false)
            }
        },
        [value, allVariables, onValueChange]
    )

    /** ⌨️ Inserta variable seleccionada */
    const insertVariable = useCallback(
        (key: string) => {
            if (!inputRef.current) return
            const start = value.slice(0, cursorPos)
            const end = value.slice(cursorPos)
            const beforeCursor = start.replace(/@([A-Z0-9_]*)$/i, `@${key}`)
            const newText = beforeCursor + ' ' + end

            if (newText === value) return // 🔒 evita bucles

            setValue(newText)
            setShowSuggestions(false)

            isInternalUpdate.current = true
            onValueChange?.(newText)

            // 🔁 Restaura foco tras insertar
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
        },
        [cursorPos, value, onValueChange]
    )

    return {
        value,
        onChange,
        inputRef,
        suggestions,
        showSuggestions,
        insertVariable,
    }
}
