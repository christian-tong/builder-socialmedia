// src\components\flow\FlowSidebar.tsx

"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/utils";

/**
 * 🔹 FlowSidebar — Sidebar especializado para el editor de flujos
 * --------------------------------------------------------------
 * - Controla la apertura/cierre con animación fluida
 * - Incluye un título con efecto suave de aparición
 * - Evita deformación de texto y salto visual
 */

const nodeList = [{ type: "text", label: "Text Node", icon: FileText }];

export default function FlowSidebar() {
  const { isDark } = useTheme();
  const { isOpen } = useSidebarStore();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sidebar isOpen={isOpen}>
      {/* 🧱 Título con animación sincronizada */}
      <div
        className={cn(
          "overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out transform origin-left select-none",
          isOpen
            ? "opacity-100 translate-y-0 scale-y-100 delay-200"
            : "opacity-0 -translate-y-1 scale-y-90 delay-0"
        )}
      >
        <h3
          className={cn(
            "text-sm font-semibold uppercase tracking-wider mb-2",
            isDark ? "text-gray-400" : "text-gray-500"
          )}
        >
          Nodos disponibles
        </h3>
      </div>

      {/* 🧩 Lista de nodos */}
      <div className="flex flex-col gap-2">
        {nodeList.map(({ type, label, icon: Icon }) => (
          <div
            key={type}
            draggable
            onDragStart={(event) => onDragStart(event, type)}
            className={cn(
              "flex items-center gap-2 cursor-grab rounded-md border p-2 text-sm transition-all active:cursor-grabbing select-none overflow-hidden",
              isDark
                ? "border-gray-700 bg-[#1c1c1e] hover:bg-[#222]"
                : "border-gray-300 bg-gray-100 hover:bg-gray-200"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform duration-500",
                isOpen ? "scale-100" : "scale-90",
                isDark ? "text-indigo-400" : "text-indigo-600"
              )}
            />
            <span
              className={cn(
                "truncate transition-all duration-500",
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </Sidebar>
  );
}
