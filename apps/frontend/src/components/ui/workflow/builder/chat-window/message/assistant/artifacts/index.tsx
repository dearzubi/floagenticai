import { FC } from "react";
import { AgentArtifacts } from "common";
import { Divider } from "@heroui/react";
import { ApprovalResult } from "../../../ApprovalSubmissionBar.tsx";
import ToolApprovalsArtifacts from "./tool-approvals";
import ToolCallsArtifacts from "./tool-calls";

const Artifacts: FC<{
  artifacts?: AgentArtifacts;
  onApprovalChange?: (results: ApprovalResult[]) => void;
  approvalResults?: ApprovalResult[];
  isSubmittingApprovals?: boolean;
}> = ({
  artifacts,
  onApprovalChange,
  approvalResults,
  isSubmittingApprovals,
}) => {
  const hasToolCalls =
    Array.isArray(artifacts?.agentToolCalls) &&
    artifacts?.agentToolCalls?.length > 0;
  const hasToolApprovals =
    Array.isArray(artifacts?.agentToolApprovals) &&
    artifacts?.agentToolApprovals?.length > 0;

  if (!hasToolCalls && !hasToolApprovals) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasToolApprovals && onApprovalChange && (
        <ToolApprovalsArtifacts
          agentToolApprovals={artifacts.agentToolApprovals!}
          onApprovalChange={onApprovalChange}
          approvalResults={approvalResults || []}
          isSubmittingApprovals={isSubmittingApprovals}
        />
      )}

      {hasToolApprovals && <Divider />}

      {hasToolCalls && (
        <ToolCallsArtifacts agentToolCalls={artifacts.agentToolCalls || []} />
      )}
    </div>
  );
};

export default Artifacts;
