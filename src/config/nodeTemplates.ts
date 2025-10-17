// src/config/nodeTemplates.ts

import {
  generateSimpleTextId,
  generateDerivateId,
  generateTimeConditionId,
  generateEndId,
} from "@/utils/generateNodeId";

export const nodeTemplates: Record<
  string,
  () => { id: string; data: Record<string, any> }
> = {
  simpleTextNode: () => {
    const id = generateSimpleTextId();
    return { id, data: { label: id, message: "" } };
  },

  derivateNode: () => {
    const id = generateDerivateId();
    return {
      id,
      data: {
        label: id,
        skill: "",
        skillLabel: "",
        timeoutMessage: "",
        queueMessage: "",
        inboundMessage: "",
        groodText_queueMessage: "",
        groodText_inboundMessage: "",
      },
    };
  },

  timeConditionNode: () => {
    const id = generateTimeConditionId();
    return {
      id,
      data: {
        label: id,
        condition: "",
        dayStart: "",
        dayEnd: "",
        startTime: "",
        endTime: "",
      },
    };
  },

  /** 🟥 EndNode (Hangup) */
  endNode: () => {
    const id = generateEndId();
    return {
      id,
      data: {
        label: id,
        hangupCause: "",
      },
    };
  },
};

export function getNodeTemplate(type: string) {
  const templateFn = nodeTemplates[type];
  if (templateFn) return templateFn();
  const id = `${type}_${Date.now()}`;
  return { id, data: { label: id } };
}
