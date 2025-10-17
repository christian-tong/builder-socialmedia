// src\components\forms\FormMenuNodePrincipal.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowStore } from "@/store/useFlowStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

/**
 * 🧾 FormMenuNodePrincipal
 * --------------------------------------------------
 * - Permite agregar / quitar opciones (mínimo 1)
 * - Muestra para cada opción: su valor y el nodo siguiente conectado (solo lectura)
 * - Similar a FormSimpleTextNode, pero aplicado por opción
 */
export default function FormMenuNodePrincipal({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();
  const { edges, nodes } = useFlowStore();

  const [connections, setConnections] = useState<Record<number, string>>({});
  const options = data.options || [];

  // 🔄 Detecta los nodos conectados a cada opción
  useEffect(() => {
    const conns: Record<number, string> = {};

    edges.forEach((edge) => {
      // Ejemplo: sourceHandle = "option-0", source = menuNode
      if (edge.source === id && edge.sourceHandle?.startsWith("option-")) {
        const index = parseInt(edge.sourceHandle.split("-")[1], 10);
        const targetNode = nodes.find((n) => n.id === edge.target);
        conns[index] = targetNode?.data?.label || targetNode?.id || "—";
      }
    });

    setConnections(conns);
  }, [edges, nodes, id, options.length]);

  // ➕ Agregar nueva opción
  const handleAddOption = () => {
    const newOptions = [
      ...options,
      { postbackText: String(options.length + 1), title: "", next: "" },
    ];
    updateNodeData(id, { options: newOptions });
  };

  // 🗑️ Eliminar opción (mínimo 1)
  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const newOptions = options.filter((_: any, i: number) => i !== index);
    updateNodeData(id, { options: newOptions });
  };

  // ✏️ Actualizar campo editable
  const handleUpdateOption = (index: number, field: string, value: string) => {
    const newOptions = options.map((opt: any, i: number) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    updateNodeData(id, { options: newOptions });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-gray-800">
        <Label className="text-sm font-semibold text-violet-600 dark:text-violet-300">
          Configuración del Menú Principal
        </Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 border-violet-300 dark:border-violet-700"
        >
          {id}
        </Badge>
      </div>

      {/* 🧠 Variable */}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Variable</Label>
        <Input
          value={data.variable || ""}
          placeholder="Ejemplo: PRIMER_NIVEL"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
          className="dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* 📨 Mensaje inicial */}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Mensaje inicial</Label>
        <Input
          value={data.message || ""}
          placeholder="Texto que verá el usuario..."
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
          className="dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* 🧩 Opciones */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">
            Opciones ({options.length})
          </Label>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddOption}
            className="bg-violet-500 hover:bg-violet-600 text-white text-xs px-3 py-1"
          >
            <Plus className="w-3 h-3 mr-1" /> Agregar opción
          </Button>
        </div>

        {options.map((opt: any, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-2 border border-violet-200 dark:border-gray-700 rounded-md p-3 bg-violet-50/40 dark:bg-gray-900/30 relative"
          >
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                Opción {index + 1}
              </Label>
              {options.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* ✏️ Campos editables */}
            <div className="flex gap-2">
              <Input
                value={opt.title}
                onChange={(e) =>
                  handleUpdateOption(index, "title", e.target.value)
                }
                placeholder="Título visible"
                className="flex-1 text-sm dark:bg-gray-900/50"
              />
            </div>

            {/* 🔗 Nodo siguiente (solo lectura) */}
            <div className="flex flex-col gap-1 mt-1">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Nodo siguiente
              </Label>
              <Input
                value={connections[index] || "—"}
                readOnly
                className="bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
