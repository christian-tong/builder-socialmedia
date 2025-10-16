// src\components\layout\Header.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, FileJson, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useFlowStore } from "@/store/useFlowStore";
import LogoWimprove from "../shared/LogoWimprove";
import { GenerateJsonModal } from "@/components/shared/GenerateJsonModal";
import { ImportJsonModal } from "@/components/shared/ImportJsonModal";

/**
 * 🔹 Header — Cabecera principal reutilizable
 * -----------------------------------------------------------
 * - Exporta/Importa flujo completo (nodos + edges)
 * - Controla tema oscuro/claro y sidebar
 */
export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { exportFlow } = useFlowStore();

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between px-6 py-3 border-b transition-colors duration-500",
          isDark ? "border-gray-800 bg-[#141416]" : "border-gray-200 bg-white"
        )}
      >
        {/* 🔹 Izquierda */}
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

        {/* 🔸 Derecha */}
        <div className="flex items-center gap-2">
          {/* 📤 Exportar flujo */}
          <Button
            onClick={exportFlow}
            className={cn(
              "flex items-center gap-1 text-white",
              isDark
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            )}
          >
            <FileJson className="w-4 h-4" />
            Exportar
          </Button>

          {/* 📥 Importar flujo */}
          <Button
            onClick={() => setShowImportModal(true)}
            className={cn(
              "flex items-center gap-1 text-white",
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            <UploadCloud className="w-4 h-4" />
            Importar
          </Button>

          {/* 🟢 Generar JSON (demo interno) */}
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
            title={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* 🧱 Modales */}
      <GenerateJsonModal open={showJsonModal} onOpenChange={setShowJsonModal} />
      <ImportJsonModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
    </>
  );
}

export default Header;
