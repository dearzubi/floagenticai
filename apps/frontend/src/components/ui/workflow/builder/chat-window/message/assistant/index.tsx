import { FC } from "react";
import { ChatMessage } from "../../types.ts";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { Node, useNodes } from "@xyflow/react";
import { WorkflowBuilderUINodeData } from "common";
import { cn } from "../../../../../../../utils/ui.ts";
import Title from "./Title.tsx";
import Content from "./Content.tsx";
import { ApprovalResult } from "../../ApprovalSubmissionBar.tsx";

const statusMap = {
  thinking: {
    text: "Thinking",
    className: "bg-yellow-200 text-yellow-800",
    icon: "lucide:brain",
  },
  generating: {
    text: "Generating",
    className: "bg-blue-200 text-blue-800",
    icon: "lucide:cpu",
  },
  completed: {
    text: "Done",
    className: "bg-green-200 text-green-800",
    icon: "lucide:check",
  },
  error: {
    text: "Error",
    className: "bg-red-200 text-red-800",
    icon: "lucide:x-circle",
  },
};

const AssistantMessage: FC<{
  group: { messages: ChatMessage[] };
  workflowId: string;
  openByDefaultNodeId: string | null;
  onContentChange: () => void;
  isLastGroup: boolean;
  onApprovalChange: (
    messageId: string,
    nodeId: string,
    results: ApprovalResult[],
  ) => void;
  allApprovalResults: Map<string, ApprovalResult[]>;
  isSubmittingApprovals?: boolean;
}> = ({
  group,
  workflowId,
  onApprovalChange,
  allApprovalResults,
  isSubmittingApprovals,
}) => {
  const nodes = useNodes<Node<WorkflowBuilderUINodeData>>();
  return (
    <div className={"p-0  flex flex-col gap-3"}>
      {group.messages.map((message) => {
        const node = nodes.find((n) => n.id === message.nodeId);
        const nodeName = node ? node.data.name : undefined;
        const rawFriendlyName = node?.data.friendlyName;
        const friendlyName =
          typeof rawFriendlyName === "string" && rawFriendlyName
            ? rawFriendlyName
            : message.nodeId || "Bot Message";

        const currentStatus = message.status ? statusMap[message.status] : null;

        return (
          <Card
            key={message.id}
            aria-label={friendlyName}
            className={"shadow-sm border"}
          >
            <CardHeader className={cn("bg-default-100")}>
              <Title
                currentStatus={currentStatus}
                friendlyName={friendlyName}
                nodeName={nodeName}
              />
            </CardHeader>
            <CardBody className={"p-1"}>
              <Content
                content={message.content}
                messageId={message.id}
                nodeId={message.nodeId}
                workflowId={workflowId}
                artifacts={message.artifacts}
                onApprovalChange={onApprovalChange}
                approvalResults={allApprovalResults.get(message.id) || []}
                isSubmittingApprovals={isSubmittingApprovals}
              />
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default AssistantMessage;
