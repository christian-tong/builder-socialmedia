// src/components/flow/FlowStylePanel.tsx

"use client";

import React from "react";
import { useFlowStyleStore } from "@/store/useFlowStyleStore";
import { cn } from "@/lib/utils";

export function FlowStylePanel() {
  const { backgroundType, edgeType, setBackgroundType, setEdgeType } =
    useFlowStyleStore();

  const backgrounds = [
    { key: "dots", label: "Puntos" },
    { key: "lines", label: "Líneas" },
  ] as const;

  const edges = [
    { key: "default", label: "Curvo" },
    { key: "straight", label: "Recto" },
    { key: "step", label: "Escalonado" },
    { key: "smoothstep", label: "Suave" },
  ] as const;

  return (
    <div className="absolute bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-3 border border-gray-300 dark:border-gray-700">
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
        🎨 Fondo
      </p>
      <div className="flex gap-2 mb-3">
        {backgrounds.map((b) => (
          <button
            key={b.key}
            onClick={() => setBackgroundType(b.key)}
            className={cn(
              "px-2 py-1 text-xs rounded-md border transition-colors",
              backgroundType === b.key
                ? "bg-indigo-500 text-white border-indigo-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
        🔗 Conexiones
      </p>
      <div className="flex flex-wrap gap-2">
        {edges.map((e) => (
          <button
            key={e.key}
            onClick={() => setEdgeType(e.key)}
            className={cn(
              "px-2 py-1 text-xs rounded-md border transition-colors",
              edgeType === e.key
                ? "bg-indigo-500 text-white border-indigo-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
