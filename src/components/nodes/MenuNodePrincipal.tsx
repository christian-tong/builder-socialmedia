// src\components\nodes\MenuNodePrincipal.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { ListTree } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

/**
 * 💜 MenuNodePrincipal — versión compacta (padding reducido)
 * -------------------------------------------------------
 * - Menor separación vertical (más compacto).
 * - Handles siguen perfectamente alineados al borde.
 */
const MenuNodePrincipal = ({ id, data }: any) => {
  const { setSelectedNode } = useNodeConfigStore();
  const { orientation } = useFlowOrientationStore();

  const targetPosition =
    orientation === "vertical" ? Position.Top : Position.Left;

  const options = data.options || [];

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode({ id, type: "menuNodePrincipal", data });
      }}
      data-id={id}
      className="relative bg-violet-600 dark:bg-violet-700 text-white rounded-xl shadow-md border border-violet-800 cursor-pointer hover:scale-[1.01] transition-transform duration-200 select-none overflow-visible"
    >
      {/* 🔹 Encabezado */}
      <div className="px-3 pt-1.5 pb-1">
        <div className="flex items-center gap-2 leading-none">
          <ListTree className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {data.label || "Nodo de Menú"}
          </span>
        </div>
        {data.variable && (
          <p className="text-[11px] opacity-90 font-mono mt-0.5">
            Var: {data.variable}
          </p>
        )}
      </div>

      {/* 📨 Mensaje (opcional) */}
      {data.message && (
        <div className="mx-3 my-1 bg-violet-800/40 rounded-md px-2.5 py-1 text-[11px] italic text-violet-100 border border-violet-500/40">
          {data.message}
        </div>
      )}

      {/* 🎯 Handle de entrada */}
      <Handle
        type="target"
        position={targetPosition}
        style={{
          top: orientation === "vertical" ? "-5px" : "50%",
          left: orientation === "vertical" ? "50%" : "-5px",
          transform:
            orientation === "vertical"
              ? "translateX(-50%)"
              : "translateY(-50%)",
        }}
        className="!bg-violet-300 w-[10px] h-[10px] rounded-full shadow-sm"
      />

      {/* 🔸 Opciones enumeradas */}
      <div className="flex flex-col mt-0.5">
        {options.map((opt: any, index: number) => {
          const number = index + 1;
          return (
            <div
              key={index}
              className="relative flex items-center justify-between bg-violet-700/40 hover:bg-violet-700/60 transition-colors px-3 py-[6px] text-[12px] border-t border-violet-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{number}:</span>
                <span className="truncate">
                  {opt.title || `Opción ${number}`}
                </span>
              </div>

              {/* 🔹 Handle pegado al borde exterior */}
              <Handle
                id={`option-${index}`}
                type="source"
                position={Position.Right}
                style={{
                  top: "50%",
                  right: "-5px",
                  transform: "translateY(-50%)",
                }}
                className="!bg-white w-[10px] h-[10px] rounded-full shadow-sm"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MenuNodePrincipal;
