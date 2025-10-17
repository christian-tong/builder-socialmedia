// src/services/utils/alertHandler.ts

import { toast } from "sonner";

/**
 * 🔔 alertHandler — Utilidad central para mostrar mensajes al usuario
 * --------------------------------------------------------------------
 * - Muestra toasts estandarizados (éxito, error, info, loading)
 * - Permite mantener una interfaz consistente en toda la app
 */

export const alertHandler = {
  success: (message: string) => {
    toast.success(`✅ ${message}`);
  },

  error: (message: string) => {
    toast.error(`❌ ${message}`);
  },

  info: (message: string) => {
    toast(message, { description: "ℹ️ Información" });
  },

  loading: (message: string) => {
    toast.loading(message);
  },
};
