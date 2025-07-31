import { NodeNames } from "common";

export const NODE_SETTINGS: Record<
  NodeNames,
  {
    icon: string;
    color: string;
  }
> = {
  agent: {
    icon: "tabler:robot",
    color: "#4DD0E1",
  },
  manual_trigger: {
    icon: "lucide:mouse-pointer-click",
    color: "#7EE787",
  },
  chat_trigger: {
    icon: "tabler:message-circle-filled",
    color: "#4DDBBB",
  },
  aggregator_agent: {
    icon: "tabler:sparkles",
    color: "#64B5F6",
  },
  router_agent: {
    icon: "material-symbols:arrow-split-rounded",
    color: "#FFB938",
  },
  one_inch_agent: {
    icon: "token-branded:1inch",
    color: "rgb(198,54,46)",
  },
};

// export const NODE_SETTINGS = [
//   {
//     name: "agent",
//     icon: "tabler:robot",
//     color: "#4DD0E1",
//   },
//   {
//     name: "manualTrigger",
//     icon: "material-symbols:play-arrow",
//     color: "#7EE787",
//   },
//   {
//     name: "conditionAgentflow",
//     icon: "material-symbols:arrow-split-rounded",
//     color: "#FFB938",
//   },
//
//   {
//     name: "llmAgentflow",
//     icon: "tabler:sparkles",
//     color: "#64B5F6",
//   },
//   {
//     name: "humanInputAgentflow",
//     icon: "tabler:replace-user",
//     color: "#6E6EFD",
//   },
//   {
//     name: "loopAgentflow",
//     icon: "tabler:repeat",
//     color: "#FFA07A",
//   },
//   {
//     name: "directReplyAgentflow",
//     icon: "tabler:message-circle-filled",
//     color: "#4DDBBB",
//   },
//   {
//     name: "customFunctionAgentflow",
//     icon: "tabler:function-filled",
//     color: "#E4B7FF",
//   },
//   {
//     name: "toolAgentflow",
//     icon: "tabler:tools",
//     color: "#d4a373",
//   },
//   {
//     name: "retrieverAgentflow",
//     icon: "tabler:library",
//     color: "#b8bedd",
//   },
//   {
//     name: "conditionAgentAgentflow",
//     icon: "tabler:subtask",
//     color: "#ff8fab",
//   },
//   {
//     name: "stickyNoteAgentflow",
//     icon: "tabler:note",
//     color: "#fee440",
//   },
//   {
//     name: "httpAgentflow",
//     icon: "tabler:world-bolt",
//     color: "#FF7F7F",
//   },
//   {
//     name: "iterationAgentflow",
//     icon: "tabler:relation-one-to-many-filled",
//     color: "#9C89B8",
//   },
//   {
//     name: "executeFlowAgentflow",
//     icon: "tabler:vector-bezier-2",
//     color: "#a3b18a",
//   },
// ];
