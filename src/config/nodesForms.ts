import FormSimpleTextNode from "@/components/forms/FormSimpleTextNode";
import FormStartNode from "@/components/forms/FormStartNode";

export const nodeFormRegistry: Record<string, any> = {
  startNode: FormStartNode,
  simpleTextNode: FormSimpleTextNode,
  // Agrega más: menuNode, derivateNode, etc.
};
