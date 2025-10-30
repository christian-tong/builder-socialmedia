'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

/**
 * 🟢 Switch (v2.0 – estilo Bootstrap)
 * -----------------------------------------------------
 * - Verde Bootstrap (bg-[#198754]) cuando está activo
 * - Gris claro cuando está inactivo
 * - Puntero blanco con sombra
 * - Transición suave y accesible
 */
const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        className={cn(
            'peer relative inline-flex h-[1.25rem] w-[2.5rem] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all duration-300 outline-none',
            // 🎨 Fondo dinámico estilo Bootstrap
            'data-[state=checked]:bg-[#198754] data-[state=unchecked]:bg-gray-300',
            'focus-visible:ring-2 focus-visible:ring-[#198754]/40 disabled:cursor-not-allowed disabled:opacity-50',
            className
        )}
        {...props}
    >
        <SwitchPrimitive.Thumb
            data-slot="switch-thumb"
            className={cn(
                'pointer-events-none block h-[1rem] w-[1rem] rounded-full bg-white shadow-md transition-transform duration-300',
                // 🟢 Movimiento del thumb
                'data-[state=checked]:translate-x-[1.25rem] data-[state=unchecked]:translate-x-[0.125rem]'
            )}
        />
    </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

export { Switch }
