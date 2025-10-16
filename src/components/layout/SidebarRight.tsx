// src\components\layout\SidebarRight.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface SidebarRightProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * 🧱 SidebarRight — Panel lateral derecho animado
 * -------------------------------------------------
 * - Usa overlay scroll invisible para evitar parpadeos
 * - Animación fluida igual que Sidebar izquierdo
 */
export function SidebarRight({ isOpen, children }: SidebarRightProps) {
  const { isDark } = useTheme();

  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "fixed right-0 top-0 h-full z-[50] flex flex-col gap-3 border-l p-4 origin-right transition-all duration-500 ease-in-out transform",
        isDark
          ? "bg-[#141416] border-gray-800 text-gray-200"
          : "bg-white border-gray-200 text-gray-800",
        isOpen
          ? "w-[320px] sm:w-[380px] opacity-100 translate-x-0"
          : "w-0 opacity-0 translate-x-10 pointer-events-none"
      )}
    >
      <div
        className={cn(
          // 👇 Scroll invisible y transición suave
          "scroll-smooth-hide transition-all duration-500 ease-in-out flex-1 overflow-y-overlay",
          isOpen
            ? "opacity-100 translate-x-0 delay-150"
            : "opacity-0 translate-x-3 delay-0"
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export default SidebarRight;
