// src\components\shared\ImportJsonModal.tsx
"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadCloud, FileJson, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { useFlowStore } from "@/store/useFlowStore"; // ✅ actualizado

/**
 * 🧩 ImportJsonModal — Subida y validación de archivos JSON
 * --------------------------------------------------------------------
 * - Valida extensión .json
 * - Verifica formato compatible (nodes + edges)
 * - Usa Sonner para feedback visual
 * - Compatible con modo claro/oscuro
 */
export function ImportJsonModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isDark } = useTheme();
  const { importFlow } = useFlowStore(); // ✅ actualizado
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar extensión
    if (!file.name.endsWith(".json")) {
      setStatus("invalid");
      toast.error("El archivo debe tener extensión .json");
      e.target.value = "";
      return;
    }

    // Intentar parsear
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        setSelectedFile(file);
        setStatus("valid");
      } else {
        setStatus("invalid");
        toast.error(
          "Formato JSON no compatible con el flujo esperado (nodes + edges)."
        );
      }
    } catch {
      setStatus("invalid");
      toast.error("Archivo JSON corrupto o no válido.");
    }

    e.target.value = "";
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await importFlow(selectedFile);
    toast.success("✅ Flujo importado correctamente");
    onOpenChange(false);
    setSelectedFile(null);
    setStatus("idle");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[480px] transition-colors",
          isDark
            ? "bg-[#141416] text-gray-200 border-gray-800"
            : "bg-white text-gray-800 border-gray-200"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            Importar Flujo JSON
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            isDark
              ? "border-gray-700 hover:border-indigo-600"
              : "border-gray-300 hover:border-indigo-500"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            placeholder="Subir Archivo"
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          <FileJson
            className={cn(
              "w-10 h-10 mb-3",
              status === "valid"
                ? "text-green-500"
                : status === "invalid"
                ? "text-red-500"
                : "text-gray-400"
            )}
          />

          <p className="text-sm text-center">
            {status === "idle" &&
              "Haz clic o arrastra un archivo .json con nodos y edges"}
            {status === "valid" && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="w-4 h-4" /> Archivo válido
              </span>
            )}
            {status === "invalid" && (
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="w-4 h-4" /> Archivo inválido
              </span>
            )}
          </p>

          {selectedFile && (
            <p className="mt-2 text-xs opacity-70">{selectedFile.name}</p>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              setSelectedFile(null);
              setStatus("idle");
            }}
          >
            Cancelar
          </Button>

          <Button
            disabled={!selectedFile || status !== "valid"}
            onClick={handleImport}
            className={cn(
              "text-white",
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            Importar y aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImportJsonModal;
