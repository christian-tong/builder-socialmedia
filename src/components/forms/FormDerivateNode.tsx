// src\components\forms\FormDerivateNode.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getSkills, Skill } from "@/services/skillService";

/**
 * 📝 FormDerivateNode
 * --------------------------------------------------
 * - Formulario de edición de DerivateNode
 * - Permite editar mensajes y skill destino
 * - Carga dinámica de skills desde servicio
 */
const FormDerivateNode = ({ id, data }: any) => {
  const { updateNodeData } = useNodeConfigStore();

  // 🔹 Estado local para skills
  const [skills, setSkills] = useState<Skill[]>([]);

  // ✅ Refs correctamente tipadas (ya incluyen null por defecto)
  const timeoutRef = useRef<HTMLTextAreaElement>(null);
  const queueRef = useRef<HTMLTextAreaElement>(null);
  const inboundRef = useRef<HTMLTextAreaElement>(null);

  // ⚙️ Cargar lista de skills al montar
  useEffect(() => {
    getSkills().then(setSkills);
  }, []);

  // ✅ Auto ajuste de altura de los textareas
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    try {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 400) + "px";
    } catch {}
  };

  useEffect(() => {
    autoResize(timeoutRef);
    autoResize(queueRef);
    autoResize(inboundRef);
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {/* 🔹 Encabezado con ID */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Configuración de Derivación
        </Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700"
        >
          {id}
        </Badge>
      </div>

      {/* Skill */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Skill destino</Label>
        <Select
          value={String(data.skill || "")}
          onValueChange={(val) => {
            const selected = skills.find((s) => String(s.id) === val);
            updateNodeData(id, {
              skill: Number(val),
              skillLabel: selected?.label || "",
            });
          }}
        >
          <SelectTrigger className="w-full dark:bg-gray-900/50">
            <SelectValue placeholder="Seleccionar skill" />
          </SelectTrigger>
          <SelectContent>
            {skills.map((skill) => (
              <SelectItem key={skill.id} value={String(skill.id)}>
                {skill.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeout Message */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Timeout Message</Label>
        <Textarea
          ref={timeoutRef}
          value={data.timeoutMessage || ""}
          onChange={(e) => {
            updateNodeData(id, { timeoutMessage: e.target.value });
            autoResize(timeoutRef);
          }}
          placeholder="Mensaje cuando el usuario no responde..."
          className="min-h-[80px] dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* Queue Message */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Queue Message</Label>
        <Textarea
          ref={queueRef}
          value={data.queueMessage || ""}
          onChange={(e) => {
            updateNodeData(id, { queueMessage: e.target.value });
            autoResize(queueRef);
          }}
          placeholder="Mensaje cuando hay alta demanda..."
          className="min-h-[60px] dark:bg-gray-900/50 text-sm"
        />
      </div>

      {/* Inbound Message */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Inbound Message</Label>
        <Textarea
          ref={inboundRef}
          value={data.inboundMessage || ""}
          onChange={(e) => {
            updateNodeData(id, { inboundMessage: e.target.value });
            autoResize(inboundRef);
          }}
          placeholder="Mensaje al asignar al asesor..."
          className="min-h-[60px] dark:bg-gray-900/50 text-sm"
        />
      </div>
    </div>
  );
};

export default FormDerivateNode;
