// src\components\flow\FlowSidebar.tsx

"use client";

import type React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { nodeRegistry } from "@/config/nodesConfig";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";

/**
 * 🔹 FlowSidebar — Sidebar especializado para el editor de flujos
 * --------------------------------------------------------------
 * - Controla la apertura/cierre con animación fluida
 * - Incluye un título con efecto suave de aparición
 * - Evita deformación de texto y salto visual
 */

export default function FlowSidebar() {
	const { isDark } = useTheme();
	const { isOpen } = useSidebarStore();

	const onDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		nodeType: string,
	) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<Sidebar isOpen={isOpen}>
			{/* 🧱 Título con animación sincronizada */}
			<div
				className={cn(
					"origin-left transform overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out select-none",
					isOpen
						? "translate-y-0 scale-y-100 opacity-100 delay-200"
						: "-translate-y-1 scale-y-90 opacity-0 delay-0",
				)}
			>
				<h3
					className={cn(
						"mb-2 text-sm font-semibold tracking-wider uppercase",
						isDark ? "text-gray-400" : "text-gray-500",
					)}
				>
					Nodos disponibles
				</h3>
			</div>

			{/* 🧩 Lista de nodos */}
			<div className="flex flex-col gap-2">
				{nodeRegistry.map(({ type, label, icon: Icon }) => (
					<div
						key={type}
						draggable
						onDragStart={(event) => onDragStart(event, type)}
						className={cn(
							"flex cursor-grab items-center gap-2 overflow-hidden rounded-md border p-2 text-sm transition-all select-none active:cursor-grabbing",
							isDark
								? "border-gray-700 bg-[#1c1c1e] hover:bg-[#222]"
								: "border-gray-300 bg-gray-100 hover:bg-gray-200",
						)}
					>
						<Icon
							className={cn(
								"h-4 w-4 flex-shrink-0 transition-transform duration-500",
								isOpen ? "scale-100" : "scale-90",
								isDark ? "text-indigo-400" : "text-indigo-600",
							)}
						/>
						<span
							className={cn(
								"truncate transition-all duration-500",
								isOpen
									? "translate-x-0 opacity-100"
									: "-translate-x-2 opacity-0",
							)}
						>
							{label}
						</span>
					</div>
				))}
			</div>
		</Sidebar>
	);
}
