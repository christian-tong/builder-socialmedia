// src/config/nodesConfig.ts

import {
    Clock,
    GitBranch,
    ListTree,
    MessageSquare,
    PlayCircle,
    Power,
    UserCircle2,
    Variable, // 🟣 nuevo icono agregado
} from 'lucide-react'

import DerivateNode from '@/components/nodes/DerivateNode'
import EndNode from '@/components/nodes/EndNode'
import { SimpleTextNode } from '@/components/nodes/SimpleTextNode'
import { StartNode } from '@/components/nodes/StartNode'
import TimeConditionNode from '@/components/nodes/TimeConditionNode'
import MenuNode from '@/components/nodes/MenuNode'
import { VariablesNode } from '@/components/nodes/VariablesNode' // 🧩 nuevo nodo
import SwitchConditionNode from '@/components/nodes/SwitchConditionNode'

// =============================================================
// 🔒 Extiende el namespace global (para cachear nodeTypes)
// =============================================================
declare global {
    // eslint-disable-next-line no-var
    var __NODE_TYPES__: Record<string, any> | undefined
}

// =============================================================
// 🧱 Registro de nodos
// =============================================================
export const nodeRegistry = [
    {
        type: 'startNode',
        label: 'Inicio',
        icon: PlayCircle,
        component: StartNode,
    },
    {
        type: 'menuNode',
        label: 'Menú',
        icon: ListTree,
        component: MenuNode,
    },
    {
        type: 'variablesNode',
        label: 'Variables',
        icon: Variable,
        component: VariablesNode,
    },
    {
        type: 'switchConditionNode',
        label: 'Condición Variable',
        icon: GitBranch,
        component: SwitchConditionNode,
    }, // 🆕
    {
        type: 'timeConditionNode',
        label: 'Condición Tiempo',
        icon: Clock,
        component: TimeConditionNode,
    },
    {
        type: 'derivateNode',
        label: 'Derivar',
        icon: UserCircle2,
        component: DerivateNode,
    },
    {
        type: 'simpleTextNode',
        label: 'Texto',
        icon: MessageSquare,
        component: SimpleTextNode,
    },
    {
        type: 'endNode',
        label: 'Fin',
        icon: Power,
        component: EndNode,
    },
] as const

// =============================================================
// 🧠 Cache global contra HMR (sin useMemo)
// =============================================================
if (!globalThis.__NODE_TYPES__) {
    globalThis.__NODE_TYPES__ = Object.freeze(
        Object.fromEntries(nodeRegistry.map((n) => [n.type, n.component]))
    )
}

export const nodeTypes = globalThis.__NODE_TYPES__
