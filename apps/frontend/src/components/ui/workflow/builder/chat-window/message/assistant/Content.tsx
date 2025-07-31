import { FC, useState } from "react";
import Button from "../Button.tsx";
import ContentMarkdown from "./ContentMarkdown.tsx";
import { AgentArtifacts } from "common";
import Artifacts from "./artifacts";
import { ApprovalResult } from "../../ApprovalSubmissionBar.tsx";

const Content: FC<{
  content: string;
  messageId: string;
  workflowId: string;
  nodeId?: string;
  artifacts?: AgentArtifacts | null;
  onApprovalChange: (
    messageId: string,
    nodeId: string,
    results: ApprovalResult[],
  ) => void;
  approvalResults?: ApprovalResult[];
  isSubmittingApprovals?: boolean;
}> = ({
  content,
  messageId,
  nodeId,
  artifacts,
  onApprovalChange,
  approvalResults,
  isSubmittingApprovals,
}) => {
  // const { mutate: deleteMessage } = useDeleteChatMessage();
  const [isCopied, setIsCopied] = useState(false);

  // const handleDelete = () => {
  //   deleteMessage({ chatId: messageId, workflowId });
  // };

  const handleDownload = () => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    const blob = new Blob([content], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = `assistant-message-${messageId}.md`;
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className={"px-2"}>
      <div className={"flex gap-3 flex-col"}>
        <div className="prose max-w-none min-w-0 overflow-hidden">
          <ContentMarkdown content={content} />
        </div>
        {artifacts && (
          <Artifacts
            artifacts={artifacts}
            onApprovalChange={(results) => {
              if (nodeId) {
                onApprovalChange(messageId, nodeId, results);
              }
            }}
            approvalResults={approvalResults}
            isSubmittingApprovals={isSubmittingApprovals}
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          icon={isCopied ? "lucide:check" : "lucide:copy"}
          onPress={handleCopy}
          tooltipText={"Copy message"}
        />
        <Button
          icon="lucide:download"
          onPress={handleDownload}
          tooltipText={"Download message"}
        />
        <Button icon="lucide:thumbs-up" tooltipText={"Like message"} />
        <Button icon="lucide:thumbs-down" tooltipText={"Dislike message"} />
        {/* TODO: Maybe add this individual delete option but don't see any much utility for it *}
        {/*<Button icon="lucide:trash-2" onPress={handleDelete} />*/}
      </div>
    </div>
  );
};

export default Content;
