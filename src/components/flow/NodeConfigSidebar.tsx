// src\components\flow\NodeConfigSidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { nodeFormRegistry } from "@/config/nodesForms";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

/**
 * ⚙️ NodeConfigSidebar
 * -------------------------------------------------------
 * - Mantiene animaciones igual que el Sidebar izquierdo.
 * - NO se desmonta al cerrar (permite transiciones reales).
 * - Cierra con tecla Escape.
 */
export function NodeConfigSidebar() {
  const { isDark } = useTheme();
  const { selectedNode, setSelectedNode } = useNodeConfigStore();
  const isOpen = !!selectedNode;

  // 🎹 Cerrar con tecla Escape
  useKeyboardShortcut("Escape", () => {
    if (isOpen) setSelectedNode(null);
  });

  // ⛑️ Determinar nodo activo
  const { id, type, data } = selectedNode ?? {};
  const FormComponent = type ? nodeFormRegistry[type] : null;

  return (
    <SidebarRight isOpen={isOpen}>
      {/* 🧱 Wrapper con transición fluida */}
      <div
        className={cn(
          "transition-all duration-500 ease-in-out transform flex flex-col h-full",
          isOpen
            ? "opacity-100 translate-x-0 delay-150"
            : "opacity-0 translate-x-3 delay-0 pointer-events-none"
        )}
      >
        {/* 🧱 Header animado */}
        <div
          className={cn(
            "flex justify-between items-center mb-4 transition-all duration-500 ease-in-out transform origin-right",
            isOpen
              ? "opacity-100 translate-x-0 scale-100 delay-200"
              : "opacity-0 translate-x-2 scale-95 delay-0"
          )}
        >
          <h3
            className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            ⚙️ Configurar Nodo
          </h3>

          <button
            onClick={() => setSelectedNode(null)}
            className={cn(
              "text-xs px-2 py-1 rounded-md transition-colors",
              isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-100"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )}
          >
            ✕
          </button>
        </div>

        {/* 🔤 Tipo de nodo */}
        {type && (
          <p
            className={cn(
              "text-xs mb-4 transition-all duration-500 ease-in-out transform",
              isOpen
                ? "opacity-100 translate-x-0 delay-300"
                : "opacity-0 translate-x-2 delay-0",
              isDark ? "text-gray-500" : "text-gray-400"
            )}
          >
            Tipo: <span className="font-mono">{type}</span>
          </p>
        )}

        {/* 🧩 Formulario dinámico */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out transform flex-1 overflow-y-auto",
            isOpen
              ? "opacity-100 translate-x-0 delay-400"
              : "opacity-0 translate-x-2 delay-0"
          )}
        >
          {FormComponent ? (
            <FormComponent id={id} data={data} />
          ) : (
            <p className="text-sm text-gray-400 mt-10 text-center">
              Selecciona un nodo para configurarlo
            </p>
          )}
        </div>

        {/* 💾 Botón animado */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out transform",
            isOpen
              ? "opacity-100 translate-y-0 delay-500"
              : "opacity-0 translate-y-2 delay-0"
          )}
        >
          <Button
            disabled={!isOpen}
            className={cn(
              "mt-6 w-full transition-all",
              isDark
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            )}
            onClick={() => setSelectedNode(null)}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </SidebarRight>
  );
}
