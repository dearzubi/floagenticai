import { FC, useMemo } from "react";
import { ApprovalResult } from "../../../../ApprovalSubmissionBar.tsx";
import { AgentToolApprovalActionStatus, AgentToolApprovalItem } from "common";
import { Button, Card, CardBody, CardHeader, Chip, Code } from "@heroui/react";
import { Icon } from "@iconify/react";

const ToolApprovalsArtifacts: FC<{
  agentToolApprovals: AgentToolApprovalItem[];
  onApprovalChange: (results: ApprovalResult[]) => void;
  approvalResults: ApprovalResult[];
  isSubmittingApprovals?: boolean;
}> = ({
  agentToolApprovals,
  onApprovalChange,
  approvalResults,
  isSubmittingApprovals,
}) => {
  const approvalResultsMap = useMemo(() => {
    const map = new Map<string, ApprovalResult>();
    approvalResults.forEach((result) => {
      const key = `${result.name}-${result.callId}`;
      map.set(key, result);
    });
    return map;
  }, [approvalResults]);

  const handleApproval = (
    approvalKey: string,
    actionStatus: AgentToolApprovalActionStatus,
  ) => {
    if (onApprovalChange) {
      const updatedResults = approvalResults.map((result) => {
        const key = `${result.name}-${result.callId}`;
        if (key === approvalKey) {
          return { ...result, actionStatus };
        }
        return result;
      });
      onApprovalChange(updatedResults);
    }
  };

  return (
    <div className="space-y-3">
      {agentToolApprovals.map((approval) => {
        const approvalKey = `${approval.name}-${approval.callId}`;
        const result = approvalResultsMap.get(approvalKey);
        const actionStatus = result?.actionStatus || "pending";

        return (
          <Card
            key={approvalKey}
            className={`
                    border-1 transition-all duration-200 shadow-none
                    ${
                      actionStatus === "approved"
                        ? "border-success-200 bg-success-50"
                        : actionStatus === "rejected"
                          ? "border-danger-200 bg-danger-50"
                          : "border-default-200 bg-default-50"
                    }
                  `}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="carbon:tool-kit"
                    className="w-3 h-3 text-default-600"
                  />
                  <span className="font-semibold text-default-800 text-xs">
                    {approval.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {actionStatus === "pending" && (
                    <Chip size="sm" color="warning" variant="flat">
                      Pending
                    </Chip>
                  )}
                  {actionStatus === "approved" && (
                    <Chip size="sm" color="success" variant="flat">
                      Approved
                    </Chip>
                  )}
                  {actionStatus === "rejected" && (
                    <Chip size="sm" color="danger" variant="flat">
                      Rejected
                    </Chip>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-default-600 mb-2">
                    This tool wants to execute with the following parameters:
                  </p>
                  <Code
                    className="w-full p-3"
                    color="default"
                    radius="md"
                    size="sm"
                  >
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(JSON.parse(approval.arguments), null, 2)}
                    </pre>
                  </Code>
                </div>

                {actionStatus === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      onPress={() => handleApproval(approvalKey, "approved")}
                      startContent={
                        <Icon icon="mdi:check" className="w-3 h-3" />
                      }
                      className="font-medium hover:border-transparent focus:outline-none "
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => handleApproval(approvalKey, "rejected")}
                      startContent={
                        <Icon icon="mdi:close" className="w-3 h-3" />
                      }
                      className="font-medium hover:border-transparent focus:outline-none"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {actionStatus !== "pending" && !isSubmittingApprovals && (
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => handleApproval(approvalKey, "pending")}
                    className="text-default-600 hover:text-default-800 hover:border-transparent focus:outline-none"
                  >
                    Change Decision
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default ToolApprovalsArtifacts;
