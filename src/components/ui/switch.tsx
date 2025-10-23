import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

/**
 * 🌈 Switch amigable — colores más suaves y modernos
 * ----------------------------------------------------
 * - Activo → verde pastel (#4ade80 / #22c55e)
 * - Inactivo → gris claro (#d1d5db)
 * - Thumb blanco con sombra y animación suave
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 🟢 Fondo verde cuando está activo, gris cuando está inactivo
        "peer inline-flex h-[1.25rem] w-9 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none shadow-sm",
        "data-[state=checked]:bg-green-400 data-[state=checked]:hover:bg-green-500",
        "data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:hover:bg-gray-400",
        "focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // ⚪️ Thumb blanco con sombra y movimiento fluido
          "pointer-events-none block h-[1rem] w-[1rem] rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
