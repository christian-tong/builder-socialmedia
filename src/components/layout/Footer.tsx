// src\components\layout\Footer.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

/**
 * 🔹 Footer — Pie de página reutilizable
 * -----------------------------------------------------------
 * - Muestra información del proyecto y año actual
 * - Adapta sus colores dinámicamente al tema global
 */
export function Footer() {
  const { isDark } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "h-6 text-center text-[11px] border-t transition-colors duration-500 flex items-center justify-center",
        isDark
          ? "text-gray-600 border-gray-800 bg-[#141416]"
          : "text-gray-500 border-gray-200 bg-white"
      )}
    >
      © {year} Flow Builder — powered by React Flow ⚙️
    </footer>
  );
}

export default Footer;
