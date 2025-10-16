// src\pages\index.tsx

import FlowCanvas from "@/components/flow/FlowCanvas";
import { MainLayout } from "@/components/layout/MainLayout";
import { Geist, Geist_Mono } from "next/font/google";

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
      <FlowCanvas />
    </MainLayout>
  );
}
