// src\components\layout\MainLayout.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export function MainLayout({ children }: Props) {
  // 🌗 Estado para el modo
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // 🔄 Leer modo guardado en localStorage (opcional)
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  // 💾 Guardar cuando cambie
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-screen transition-colors duration-500",
        theme === "dark"
          ? "bg-[#0e0e10] text-gray-100"
          : "bg-[#fafafa] text-gray-900"
      )}
    >
      {/* 🔹 Header principal */}
      <header
        className={cn(
          "flex items-center justify-between px-6 py-3 border-b transition-colors duration-500",
          theme === "dark"
            ? "border-gray-800 bg-[#141416]"
            : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center gap-3">
          <Menu
            className={cn(
              "w-5 h-5",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          />
          <h1 className="text-lg font-semibold tracking-tight">
            🧠 Flow Builder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-opacity-10",
              theme === "dark"
                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-200"
            )}
          >
            Guardar
          </Button>
          <Button
            className={cn(
              "text-white",
              theme === "dark"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            )}
          >
            Exportar
          </Button>

          {/* 🌗 Botón para alternar modo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "transition-colors duration-300",
              theme === "dark"
                ? "text-yellow-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            )}
            title={
              theme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* 🔸 Contenido principal */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* 🔹 Footer */}
      <footer
        className={cn(
          "h-6 text-center text-[11px] border-t transition-colors duration-500",
          theme === "dark"
            ? "text-gray-600 border-gray-800 bg-[#141416]"
            : "text-gray-500 border-gray-200 bg-white"
        )}
      >
        © 2025 Flow Builder — powered by React Flow ⚙️
      </footer>
    </div>
  );
}
