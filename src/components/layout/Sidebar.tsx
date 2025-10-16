// src\components\layout\Sidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface SidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * 🧱 Sidebar — Panel lateral con animación fluida
 * -------------------------------------------------------------
 * - Usa max-width + scale + opacity para una transición estable.
 * - Usa origin-left para expansión natural.
 * - Envuelve su contenido en un wrapper interno con suavizado.
 */
export function Sidebar({ isOpen, children }: SidebarProps) {
  const { isDark } = useTheme();

  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "flex flex-col gap-3 border-r p-3 overflow-hidden origin-left transition-all duration-500 ease-in-out transform",
        isDark
          ? "bg-[#141416] border-gray-800 text-gray-200"
          : "bg-white border-gray-200 text-gray-800",
        isOpen
          ? "max-w-[208px] scale-x-100 opacity-100"
          : "max-w-0 scale-x-95 opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          isOpen
            ? "opacity-100 translate-x-0 delay-150"
            : "opacity-0 -translate-x-3 delay-0"
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export default Sidebar;
