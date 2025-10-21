// src\pages\index.tsx

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { MainLayout } from "@/components/layout/MainLayout";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function Home() {
	return (
		<MainLayout>
			<Toaster
				richColors
				expand
				closeButton
				position="bottom-right"
				theme="system"
			/>

			<FlowCanvas />
		</MainLayout>
	);
}
