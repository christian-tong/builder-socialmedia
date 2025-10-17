// src\components\forms\FormTimeConditionNode.tsx
"use client";

import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * Mapeo de días válidos para generar los códigos ISO cortos:
 * mon, tue, wed, thu, fri, sat, sun
 */
const DAYS = [
  { value: "mon", label: "Lunes" },
  { value: "tue", label: "Martes" },
  { value: "wed", label: "Miércoles" },
  { value: "thu", label: "Jueves" },
  { value: "fri", label: "Viernes" },
  { value: "sat", label: "Sábado" },
  { value: "sun", label: "Domingo" },
];

/**
 * 🕓 FormTimeConditionNode
 * --------------------------------------------------
 * - Permite definir un rango de días y horario (inicio-fin)
 * - Genera automáticamente una condición tipo: mon-fri,09:00-19:00
 */
export default function FormTimeConditionNode({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();

  // 🧩 Actualiza automáticamente la condición textual
  useEffect(() => {
    if (data.dayStart && data.dayEnd && data.startTime && data.endTime) {
      const condition = `${data.dayStart}-${data.dayEnd},${data.startTime}-${data.endTime}`;
      updateNodeData(id, { condition });
    }
  }, [data.dayStart, data.dayEnd, data.startTime, data.endTime]);

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Condición de Tiempo</Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-300 dark:border-sky-700"
        >
          {id}
        </Badge>
      </div>

      {/* 🔹 Rango de días */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Rango de días</Label>
        <div className="flex items-center gap-2">
          {/* Día inicio */}
          <Select
            value={data.dayStart || ""}
            onValueChange={(val) => updateNodeData(id, { dayStart: val })}
          >
            <SelectTrigger className="w-full dark:bg-gray-900/50">
              <SelectValue placeholder="Día inicio" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-gray-500">a</span>

          {/* Día fin */}
          <Select
            value={data.dayEnd || ""}
            onValueChange={(val) => updateNodeData(id, { dayEnd: val })}
          >
            <SelectTrigger className="w-full dark:bg-gray-900/50">
              <SelectValue placeholder="Día fin" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔹 Horario */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Horario (formato 24 h)</Label>
        <div className="flex gap-2 items-center justify-between">
          <div className="flex-1">
            <Label className="text-xs text-gray-500 dark:text-gray-400">
              Desde
            </Label>
            <Input
              type="time"
              value={data.startTime || ""}
              onChange={(e) =>
                updateNodeData(id, { startTime: e.target.value })
              }
              className="dark:bg-gray-900/50 text-sm mt-1"
            />
          </div>

          <div className="flex-1">
            <Label className="text-xs text-gray-500 dark:text-gray-400">
              Hasta
            </Label>
            <Input
              type="time"
              value={data.endTime || ""}
              onChange={(e) => updateNodeData(id, { endTime: e.target.value })}
              className="dark:bg-gray-900/50 text-sm mt-1"
            />
          </div>
        </div>
      </div>

      {/* 🔹 Resultado */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Condición generada</Label>
        <Input
          value={data.condition || ""}
          readOnly
          className="bg-gray-100 dark:bg-gray-800 text-xs font-mono"
        />
      </div>
    </div>
  );
}
