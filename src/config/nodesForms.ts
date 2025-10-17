// src\config\nodesForms.ts

// src/config/nodesForms.ts
import FormDerivateNode from "@/components/forms/FormDerivateNode";
import FormSimpleTextNode from "@/components/forms/FormSimpleTextNode";
import FormStartNode from "@/components/forms/FormStartNode";
import FormTimeConditionNode from "@/components/forms/FormTimeConditionNode";
import FormEndNode from "@/components/forms/FormEndNode";

export const nodeFormRegistry: Record<string, any> = {
  startNode: FormStartNode,
  simpleTextNode: FormSimpleTextNode,
  derivateNode: FormDerivateNode,
  timeConditionNode: FormTimeConditionNode,
  endNode: FormEndNode,
};
