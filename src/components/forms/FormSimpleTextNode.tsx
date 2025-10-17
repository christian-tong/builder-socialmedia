// src\components\forms\FormSimpleTextNode.tsx

"use client";

import React, { useRef, useEffect } from "react";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/**
 * 📝 FormSimpleTextNode
 * --------------------------------------------------
 * - El título no es editable
 * - Muestra el ID como badge
 * - Textarea ajusta su tamaño automáticamente
 * - Usa scroll interno si excede la altura máxima
 */
export default function FormSimpleTextNode({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ⚙️ Ajuste dinámico del alto del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto"; // resetea antes de recalcular
    const newHeight = Math.min(textarea.scrollHeight, 600); // altura máxima: 300px
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 600 ? "auto" : "hidden"; // scroll interno si excede
  }, [data.message]);

  return (
    <div className="flex flex-col gap-4">
      {/* 🔹 Campo de título + badge */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Título</Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-600 border-indigo-300 dark:border-indigo-700"
        >
          {id}
        </Badge>
      </div>

      {/* 🔸 Título solo lectura */}
      <Input
        value={data.label || ""}
        placeholder="Título del nodo"
        disabled
        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
      />

      {/* 🔹 Campo de mensaje editable */}
      <div className="flex flex-col gap-2 mt-2">
        <Label className="text-sm font-medium">Mensaje</Label>
        <Textarea
          ref={textareaRef}
          value={data.message || ""}
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
          placeholder="Escribe el mensaje del nodo..."
          className="min-h-[80px] max-h-[300px] overflow-y-auto dark:bg-gray-900/50 text-sm transition-[height] duration-150 ease-in-out"
        />
      </div>
    </div>
  );
}
