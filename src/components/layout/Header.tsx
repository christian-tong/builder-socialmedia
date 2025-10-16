// src\components\layout\Header.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarStore } from "@/store/useSidebarStore";
import LogoWimprove from "../shared/LogoWimprove";
import { GenerateJsonModal } from "@/components/shared/GenerateJsonModal";

/**
 * 🔹 Header — Cabecera principal reutilizable
 * -----------------------------------------------------------
 * - Controla el tema global (oscuro / claro)
 * - Contiene acciones (Guardar, Exportar, Generar JSON)
 * - Controla visibilidad del Sidebar
 */
export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebarStore();
  const [showJsonModal, setShowJsonModal] = useState(false);

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between px-6 py-3 border-b transition-colors duration-500",
          isDark ? "border-gray-800 bg-[#141416]" : "border-gray-200 bg-white"
        )}
      >
        {/* 🔹 Izquierda: menú + título */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "transition-all duration-300",
              isDark
                ? isOpen
                  ? "text-indigo-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-800"
                : isOpen
                ? "text-indigo-600 hover:bg-gray-200"
                : "text-gray-500 hover:bg-gray-100"
            )}
            title={isOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <LogoWimprove height={24} />
          <h1 className="text-lg font-semibold tracking-tight">
            Builder SocialMedia
          </h1>
        </div>

        {/* 🔸 Derecha: acciones */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-opacity-10",
              isDark
                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-200"
            )}
          >
            Guardar
          </Button>

          <Button
            className={cn(
              "text-white",
              isDark
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            )}
          >
            Exportar
          </Button>

          {/* 🟢 Nuevo botón: Generar JSON */}
          <Button
            onClick={() => setShowJsonModal(true)}
            className={cn(
              "flex items-center gap-1 text-white",
              isDark
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            )}
          >
            <FileJson className="w-4 h-4" />
            Generar JSON
          </Button>

          {/* 🌗 Tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "transition-colors duration-300",
              isDark
                ? "text-yellow-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            )}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* 🧱 Modal modularizado */}
      <GenerateJsonModal open={showJsonModal} onOpenChange={setShowJsonModal} />
    </>
  );
}

export default Header;
