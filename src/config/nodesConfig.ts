// src/config/nodesConfig.ts
import {
  FileText,
  PlayCircle,
  MessageSquare,
  Clock,
  UserCircle2,
  Power,
} from "lucide-react";

import { StartNode } from "@/components/nodes/StartNode";
import { SimpleTextNode } from "@/components/nodes/SimpleTextNode";
import TimeConditionNode from "@/components/nodes/TimeConditionNode";
import DerivateNode from "@/components/nodes/DerivateNode";
import EndNode from "@/components/nodes/EndNode";
import { MenuNode } from "@/components/nodes/MenuNode";

// =============================================================
// 🔒 Extiende el namespace global (para cachear nodeTypes)
// =============================================================
declare global {
  // eslint-disable-next-line no-var
  var __NODE_TYPES__: Record<string, any> | undefined;
}

// =============================================================
// 🧱 Registro de nodos
// =============================================================
export const nodeRegistry = [
  {
    type: "startNode",
    label: "Inicio",
    icon: PlayCircle,
    component: StartNode,
  },
  { type: "menuNode", label: "Menú", icon: FileText, component: MenuNode },
  {
    type: "timeConditionNode",
    label: "Condición Tiempo",
    icon: Clock,
    component: TimeConditionNode,
  },
  {
    type: "derivateNode",
    label: "Derivar",
    icon: UserCircle2,
    component: DerivateNode,
  },
  {
    type: "simpleTextNode",
    label: "Texto",
    icon: MessageSquare,
    component: SimpleTextNode,
  },
  { type: "endNode", label: "Fin", icon: Power, component: EndNode },
] as const;

// =============================================================
// 🧠 Cache global contra HMR (sin useMemo)
// =============================================================
if (!globalThis.__NODE_TYPES__) {
  globalThis.__NODE_TYPES__ = Object.freeze(
    Object.fromEntries(nodeRegistry.map((n) => [n.type, n.component]))
  );
}

export const nodeTypes = globalThis.__NODE_TYPES__;
