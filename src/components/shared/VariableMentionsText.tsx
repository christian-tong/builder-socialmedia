// src\components\shared\VariableMentionsText.tsx

'use client'

import React, { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useVariableMentions } from '@/hooks/useVariableMentions'
import { cn } from '@/lib/utils'

interface VariableMentionsTextProps {
    as?: 'input' | 'textarea'
    label?: string
    placeholder?: string
    initialValue?: string
    onValueChange?: (val: string) => void
    className?: string
}

/**
 * 💬 VariableMentionsText
 * ----------------------------------------------------
 * - Unifica <input> y <textarea> con menciones tipo @VARIABLE
 * - Usa el hook universal useVariableMentions
 * - Evita errores de tipos entre refs
 */
export function VariableMentionsText({
    as = 'textarea',
    label = 'Mensaje personalizado',
    placeholder = 'Escribe tu texto con @ para insertar variables...',
    initialValue = '',
    onValueChange,
    className,
}: VariableMentionsTextProps) {
    const {
        value,
        onChange,
        inputRef,
        suggestions,
        showSuggestions,
        insertVariable,
    } = useVariableMentions({
        initialValue,
        onValueChange,
    })

    // 🔹 Refs separados para tipado estricto
    const textRef = useRef<HTMLTextAreaElement>(null)
    const inputTextRef = useRef<HTMLInputElement>(null)

    // 🔹 Sincroniza el ref del hook con el tipo correcto
    useEffect(() => {
        if (as === 'textarea') {
            ;(
                inputRef as React.MutableRefObject<HTMLTextAreaElement | null>
            ).current = textRef.current
        } else {
            ;(
                inputRef as React.MutableRefObject<HTMLInputElement | null>
            ).current = inputTextRef.current
        }
    }, [as, inputRef])

    return (
        <div className="relative w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium">
                    {label}
                </label>
            )}

            {as === 'textarea' ? (
                <textarea
                    ref={textRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        'border-input bg-background focus:ring-primary min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none',
                        className
                    )}
                />
            ) : (
                <input
                    ref={inputTextRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        'border-input bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none',
                        className
                    )}
                />
            )}

            {showSuggestions && suggestions.length > 0 && (
                <Card className="border-border bg-popover absolute top-full z-50 mt-1 w-full border p-1 shadow-lg">
                    <ScrollArea className="max-h-[150px]">
                        {suggestions.map((sug) => (
                            <div
                                key={sug.key}
                                onClick={() => insertVariable(sug.key)}
                                className={cn(
                                    'hover:bg-accent cursor-pointer rounded px-3 py-1 text-sm'
                                )}
                            >
                                @{sug.key}{' '}
                                <span className="text-muted-foreground">
                                    ({sug.value})
                                </span>
                            </div>
                        ))}
                    </ScrollArea>
                </Card>
            )}
        </div>
    )
}
