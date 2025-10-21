// src\components\layout\SidebarRight.tsx

"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface SidebarRightProps {
	isOpen: boolean;
	children: React.ReactNode;
	onSave?: () => void;
}

/**
 * 🧭 SidebarRight
 * -------------------------------------------------------
 * - Altura total fija: 100vh
 * - Scroll interno solo para formularios
 * - Footer fijo con botón “Guardar cambios”
 */
export function SidebarRight({ isOpen, children, onSave }: SidebarRightProps) {
	const { isDark } = useTheme();

	return (
		<aside
			data-state={isOpen ? "open" : "closed"}
			aria-hidden={!isOpen}
			className={cn(
				"fixed top-0 right-0 z-[50] flex h-screen origin-right flex-col overflow-hidden border-l transition-all duration-500 ease-in-out",
				isDark
					? "border-gray-800 bg-[#141416] text-gray-200"
					: "border-gray-200 bg-white text-gray-800",
				isOpen
					? "w-[320px] translate-x-0 opacity-100 sm:w-[380px]"
					: "pointer-events-none w-0 translate-x-10 opacity-0",
			)}
		>
			{/* 🔹 Contenido del formulario con scroll */}
			<ScrollArea
				className={cn(
					"flex-1 overflow-y-auto p-4 transition-all duration-500 ease-in-out",
					isOpen
						? "translate-x-0 opacity-100 delay-150"
						: "translate-x-3 opacity-0 delay-0",
				)}
			>
				{children}
				<ScrollBar orientation="vertical" />
			</ScrollArea>

			{/* 🔸 Footer fijo con botón */}
			<div
				className={cn(
					"border-t p-3 shadow-inner",
					isDark ? "border-gray-800 bg-[#121214]" : "border-gray-200 bg-white",
				)}
			>
				<Button
					onClick={onSave}
					disabled={!isOpen}
					className={cn(
						"w-full font-semibold text-white transition-all",
						isDark
							? "bg-indigo-600 hover:bg-indigo-700"
							: "bg-indigo-500 hover:bg-indigo-600",
					)}
				>
					Guardar cambios
				</Button>
			</div>
		</aside>
	);
}

export default SidebarRight;
