// src\config\nodesForms.ts

import FormDerivateNode from "@/components/forms/FormDerivateNode";
import FormEndNode from "@/components/forms/FormEndNode";
import FormMenuNodePrincipal from "@/components/forms/FormMenuNodePrincipal";
import FormMenuNodeSecundario from "@/components/forms/FormMenuNodeSecundario";
import FormSimpleTextNode from "@/components/forms/FormSimpleTextNode";
import FormStartNode from "@/components/forms/FormStartNode";
import FormTimeConditionNode from "@/components/forms/FormTimeConditionNode";

export const nodeFormRegistry: Record<string, any> = {
	startNode: FormStartNode,
	menuNodePrincipal: FormMenuNodePrincipal,
	menuNodeSecundario: FormMenuNodeSecundario,
	simpleTextNode: FormSimpleTextNode,
	derivateNode: FormDerivateNode,
	timeConditionNode: FormTimeConditionNode,
	endNode: FormEndNode,
};
