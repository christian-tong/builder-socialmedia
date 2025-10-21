// src\components\flow\NodeConfigSidebar.tsx

"use client";

import React from "react";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { nodeFormRegistry } from "@/config/nodesForms";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * ⚙️ NodeConfigSidebar
 * -------------------------------------------------------
 * - Panel de configuración del nodo.
 * - Mantiene transiciones suaves.
 * - Cierra con tecla Escape.
 * - Botón Guardar fijo en el footer (controlado por SidebarRight).
 */
export function NodeConfigSidebar() {
	const { isDark } = useTheme();
	const { selectedNode, setSelectedNode, saveNodeDataToFlow } =
		useNodeConfigStore();
	const isOpen = !!selectedNode;

	// 🎹 Cerrar con tecla Escape
	useKeyboardShortcut("Escape", () => {
		if (isOpen) setSelectedNode(null);
	});

	// ⛑️ Determinar nodo activo
	const { id, type, data } = selectedNode ?? {};
	const FormComponent = type ? nodeFormRegistry[type] : null;

	// 💾 Guardar cambios y cerrar
	const handleSave = () => {
		saveNodeDataToFlow();
		setSelectedNode(null);
	};

	return (
		<SidebarRight isOpen={isOpen} onSave={handleSave}>
			<div
				className={cn(
					"flex h-full flex-col transition-all duration-500 ease-in-out",
					isOpen
						? "translate-x-0 opacity-100 delay-150"
						: "pointer-events-none translate-x-3 opacity-0 delay-0",
				)}
			>
				{/* 🧱 Header */}
				<div
					className={cn(
						"mb-4 flex items-center justify-between transition-all duration-500 ease-in-out",
						isOpen
							? "translate-x-0 scale-100 opacity-100 delay-200"
							: "translate-x-2 scale-95 opacity-0 delay-0",
					)}
				>
					<h3
						className={cn(
							"text-sm font-semibold tracking-wider uppercase",
							isDark ? "text-gray-400" : "text-gray-600",
						)}
					>
						⚙️ Configurar Nodo
					</h3>

					<button
						onClick={() => setSelectedNode(null)}
						className={cn(
							"rounded-md px-2 py-1 text-xs transition-colors",
							isDark
								? "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
								: "text-gray-500 hover:bg-gray-200 hover:text-gray-900",
						)}
					>
						✕
					</button>
				</div>

				{/* 🔤 Tipo de nodo */}
				{type && (
					<p
						className={cn(
							"mb-4 text-xs transition-all duration-500 ease-in-out",
							isOpen
								? "translate-x-0 opacity-100 delay-300"
								: "translate-x-2 opacity-0 delay-0",
							isDark ? "text-gray-500" : "text-gray-400",
						)}
					>
						Tipo: <span className="font-mono">{type}</span>
					</p>
				)}

				{/* 🧩 Contenido del formulario */}
				<div
					className={cn(
						"flex-1 transition-all duration-500 ease-in-out",
						isOpen
							? "translate-x-0 opacity-100 delay-400"
							: "translate-x-2 opacity-0 delay-0",
					)}
				>
					{FormComponent ? (
						<FormComponent id={id} data={data} />
					) : (
						<p className="mt-10 text-center text-sm text-gray-400">
							Selecciona un nodo para configurarlo
						</p>
					)}
				</div>
			</div>
		</SidebarRight>
	);
}

export default NodeConfigSidebar;
