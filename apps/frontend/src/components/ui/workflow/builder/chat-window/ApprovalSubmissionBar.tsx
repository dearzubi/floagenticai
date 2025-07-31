import { FC } from "react";
import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { AgentToolApprovalItem } from "common";

export type ApprovalResult = AgentToolApprovalItem & {
  messageId: string;
  executionId?: string | null;
};

const ApprovalSubmissionBar: FC<{
  pendingApprovals: ApprovalResult[];
  approvedCount: number;
  rejectedCount: number;
  onSubmitApprovals: () => void;
  isSubmitting?: boolean;
}> = ({
  pendingApprovals,
  approvedCount,
  rejectedCount,
  onSubmitApprovals,
  isSubmitting = false,
}) => {
  const hasPendingApprovals = pendingApprovals.length > 0;

  return (
    <div
      className={`relative flex flex-col gap-2 p-2 border-t bg-warning-50 border-warning-200 ${isSubmitting ? "pointer-events-none" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1">
            <Icon
              icon="mdi:shield-check"
              className="w-5 h-5 text-warning-600"
            />
            <span className="text-sm font-medium text-warning-800">
              Tool Approval Required
            </span>
          </div>

          <div className="flex gap-2 ml-2">
            {pendingApprovals.length > 0 && (
              <Chip size="sm" color="warning" variant="flat">
                {pendingApprovals.length} Pending
              </Chip>
            )}
            {approvedCount > 0 && (
              <Chip size="sm" color="success" variant="flat">
                {approvedCount} Approved
              </Chip>
            )}
            {rejectedCount > 0 && (
              <Chip size="sm" color="danger" variant="flat">
                {rejectedCount} Rejected
              </Chip>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="flat"
          isDisabled={hasPendingApprovals || isSubmitting}
          isLoading={isSubmitting}
          onPress={() => {
            if (!isSubmitting && !hasPendingApprovals) {
              onSubmitApprovals();
            }
          }}
          className={`
            inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
            transition-all duration-200 focus:outline-none cursor-pointer
            ${
              hasPendingApprovals
                ? "bg-warning-100 text-warning-800 border border-warning-300"
                : "bg-success-100 text-success-800 border border-success-300 hover:border-success-300"
            }
          `}
          startContent={
            isSubmitting ? null : (
              <Icon
                icon={
                  hasPendingApprovals ? "mdi:clock-outline" : "mdi:check-circle"
                }
                className="w-4 h-4"
              />
            )
          }
        >
          {isSubmitting ? "Submitting..." : "Submit Approvals"}
        </Button>
      </div>

      {hasPendingApprovals && (
        <div className="mt-2">
          <p className="text-xs text-warning-700">
            <strong>Pending:</strong>{" "}
            {pendingApprovals
              .map((approval) => `${approval.nodeId} > ${approval.name}`)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalSubmissionBar;
