// src\components\shared\GenerateJsonModal.tsx

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

/**
 * 🧩 GenerateJsonModal — Modal reutilizable para mostrar o copiar JSON
 * --------------------------------------------------------------------
 * - Adaptado a tema claro/oscuro.
 * - Controlado por props open / onOpenChange.
 * - Incluye área editable y botón de copiar.
 * - Usa Sonner para feedback visual.
 */
export function GenerateJsonModal({
  open,
  onOpenChange,
  initialJson,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialJson?: object;
}) {
  const { isDark } = useTheme();
  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      initialJson || { example: "Aquí irá el JSON generado del flujo" },
      null,
      2
    )
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      toast.success("JSON copiado al portapapeles", {
        description: "Puedes pegarlo en tu editor o Postman.",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("❌ Error al copiar JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[600px] transition-colors",
          isDark
            ? "bg-[#141416] text-gray-200 border-gray-800"
            : "bg-white text-gray-800 border-gray-200"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Generar JSON del flujo
          </DialogTitle>
        </DialogHeader>

        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className={cn(
            "min-h-[300px] font-mono text-sm resize-none transition-colors",
            isDark
              ? "bg-[#1c1c1e] border-gray-700 text-gray-100 focus-visible:ring-indigo-600"
              : "bg-gray-50 border-gray-300 text-gray-800 focus-visible:ring-indigo-500"
          )}
        />

        <DialogFooter className="mt-4">
          <Button
            onClick={handleCopy}
            className={cn(
              "text-white w-full sm:w-auto",
              isDark
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600"
            )}
          >
            Copiar y cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateJsonModal;
