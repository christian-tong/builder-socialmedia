// src\store\useFlowOrientationStore.ts

import { create } from "zustand";

interface FlowOrientationState {
  orientation: "vertical" | "horizontal";
  toggleOrientation: () => void;
  setOrientation: (value: "vertical" | "horizontal") => void;
}

export const useFlowOrientationStore = create<FlowOrientationState>((set) => ({
  orientation: "vertical",
  toggleOrientation: () =>
    set((state) => ({
      orientation: state.orientation === "vertical" ? "horizontal" : "vertical",
    })),
  setOrientation: (value) => set({ orientation: value }),
}));
