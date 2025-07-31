import { FC, useEffect, useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Progress } from "@heroui/react";
import WorkflowCanvas from "../../../ui/workflow/builder/WorkflowCanvas.tsx";
import { useWorkflowStore } from "../../../../stores/workflow.store.ts";
import NavigationBlocker from "../../../ui/misc/NavigationBlocker.tsx";
import { useParams } from "@tanstack/react-router";
import { useWorkflowHistory } from "../../../../hooks/workflow/workflow.history.hook.ts";

const Builder: FC = () => {
  const { workflowId } = useParams({
    strict: false,
  });

  const workflowStore = useWorkflowStore();
  const { saveSnapshot } = useWorkflowHistory(workflowId);

  const isApplyingInitialSnapshotRef = useRef(false);

  useEffect(() => {
    return () => {
      workflowStore.reset();
    };
  }, []);

  useEffect(() => {
    if (
      isApplyingInitialSnapshotRef.current ||
      !workflowId ||
      !workflowStore.reactFlowInstance ||
      (workflowStore.reactFlowInstance.getNodes().length === 0 &&
        workflowStore.reactFlowInstance.getEdges().length === 0)
    ) {
      return;
    }

    saveSnapshot();

    isApplyingInitialSnapshotRef.current = true;

    const timer = setTimeout(() => {
      isApplyingInitialSnapshotRef.current = false;
    }, 200);

    return () => clearTimeout(timer);
  }, [workflowId, workflowStore.reactFlowInstance]);

  return (
    <NavigationBlocker
      blockCondition={workflowStore.pendingChanges}
      handleOnConfirm={() => workflowStore.reset()}
    >
      <ReactFlowProvider>
        {workflowStore.isLoading && (
          <Progress isIndeterminate aria-label="Loading..." size="sm" />
        )}
        <WorkflowCanvas />
      </ReactFlowProvider>
    </NavigationBlocker>
  );
};

export default Builder;
