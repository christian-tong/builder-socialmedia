// src\hooks\useKeyboardShortcut.ts

"use client";

import { useEffect } from "react";

/**
 * 🎹 useKeyboardShortcut
 * -------------------------
 * Hook genérico para ejecutar acciones al presionar combinaciones de teclas.
 * Ejemplo:
 *   useKeyboardShortcut("Escape", () => cerrarSidebar());
 *   useKeyboardShortcut(["Control", "s"], () => saveFlow());
 */
export function useKeyboardShortcut(
  keys: string | string[],
  callback: () => void
) {
  useEffect(() => {
    const keyList = Array.isArray(keys)
      ? keys.map((k) => k.toLowerCase())
      : [keys.toLowerCase()];

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      // Si solo es una tecla (como Escape)
      if (keyList.length === 1 && pressedKey === keyList[0]) {
        event.preventDefault();
        callback();
        return;
      }

      // Si es una combinación (Ctrl + S, etc.)
      if (keyList.length > 1) {
        const allPressed = keyList.every((k) => {
          if (k === "control") return event.ctrlKey;
          if (k === "shift") return event.shiftKey;
          if (k === "alt") return event.altKey;
          return event.key.toLowerCase() === k;
        });

        if (allPressed) {
          event.preventDefault();
          callback();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback]);
}
