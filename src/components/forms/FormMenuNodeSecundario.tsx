// src\components\forms\FormMenuNodeSecundario.tsx

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
 * 🧾 FormMenuNodeSecundario
 * --------------------------------------------------
 * - Permite editar título, variable, mensaje.
 * - Muestra cada opción + nodo siguiente (solo lectura).
 */
export default function FormMenuNodeSecundario({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();
  const { edges, nodes } = useFlowStore();
  const [connections, setConnections] = useState<Record<number, string>>({});
  const options = data.options || [];

  // 🔄 Actualizar nodos conectados
  useEffect(() => {
    const conns: Record<number, string> = {};
    edges.forEach((edge) => {
      if (edge.source === id && edge.sourceHandle?.startsWith("option-")) {
        const index = parseInt(edge.sourceHandle.split("-")[1], 10);
        const targetNode = nodes.find((n) => n.id === edge.target);
        conns[index] = targetNode?.data?.label || targetNode?.id || "—";
      }
    });
    setConnections(conns);
  }, [edges, nodes, id, options.length]);

  const handleAddOption = () => {
    const newOptions = [
      ...options,
      { postbackText: String(options.length + 1), title: "", next: "" },
    ];
    updateNodeData(id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const newOptions = options.filter((_: any, i: number) => i !== index);
    updateNodeData(id, { options: newOptions });
  };

  const handleUpdateOption = (index: number, field: string, value: string) => {
    const newOptions = options.map((opt: any, i: number) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    updateNodeData(id, { options: newOptions });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-gray-800">
        <Label className="text-sm font-semibold text-sky-600 dark:text-sky-300">
          Configuración del Menú Secundario
        </Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 border-sky-300 dark:border-sky-700"
        >
          {id}
        </Badge>
      </div>

      {/* Variable */}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Variable</Label>
        <Input
          value={data.variable || ""}
          placeholder="Ejemplo: SEGUNDO_NIVEL"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
          className="dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* Mensaje */}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Mensaje inicial</Label>
        <Input
          value={data.message || ""}
          placeholder="Texto que verá el usuario..."
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
          className="dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* Opciones */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-sky-700 dark:text-sky-300">
            Opciones ({options.length})
          </Label>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddOption}
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1"
          >
            <Plus className="w-3 h-3 mr-1" /> Agregar opción
          </Button>
        </div>

        {options.map((opt: any, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-2 border border-sky-100 dark:border-gray-700 rounded-md p-3 bg-sky-50/40 dark:bg-gray-900/30 relative"
          >
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-sky-600 dark:text-sky-300">
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

            <div className="flex gap-2">
              <Input
                value={opt.title}
                onChange={(e) =>
                  handleUpdateOption(index, "title", e.target.value)
                }
                placeholder="Título visible"
                className="flex-1 text-sm dark:bg-gray-900/50"
              />
              <Input
                value={opt.postbackText}
                onChange={(e) =>
                  handleUpdateOption(index, "postbackText", e.target.value)
                }
                placeholder="Valor"
                className="w-24 text-sm dark:bg-gray-900/50 text-center"
              />
            </div>

            {/* Nodo siguiente */}
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
