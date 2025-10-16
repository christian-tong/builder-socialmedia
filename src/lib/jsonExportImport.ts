// src/lib/jsonExportImport.ts

import { toast } from "sonner";

/**
 * 🧾 Genera un nombre de archivo con marca, fecha y hora
 * Ejemplo: builderSocialMedia_20251016_173025.json
 */
export function generateJsonFilename(brand: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .split(".")[0];
  return `${brand}_${timestamp}.json`;
}

/**
 * 📤 Exporta un objeto como archivo JSON descargable
 */
export function exportToJsonFile(
  data: any,
  brand = "builderSocialMedia"
): void {
  try {
    const filename = generateJsonFilename(brand);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Error al exportar JSON:", err);
    toast.error("❌ Error al exportar archivo JSON.");
  }
}

/**
 * 📥 Importa un archivo JSON seleccionado por el usuario
 */
export async function importFromJsonFile<T = any>(
  file: File
): Promise<T | null> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (err) {
    console.error("❌ Error al importar JSON:", err);
    toast.error("❌ No se pudo leer el archivo JSON o está corrupto.");
    return null;
  }
}
