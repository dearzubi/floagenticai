import { useNavigate, useParams } from "@tanstack/react-router";
import { useWorkflowStore } from "../../stores/workflow.store.ts";
import {
  useGetWorkflow,
  useOptimisticUpsertWorkflow,
} from "./api/workflow.api.hooks.ts";
import { useEffect, useState } from "react";
import { WorkflowAPIResponse } from "../../apis/workflow/schemas.ts";
import { errorToast, successToast } from "../../utils/ui.ts";
import { useWorkflowHistory } from "./workflow.history.hook.ts";

export const useWorkflowData = () => {
  const { workflowId } = useParams({
    strict: false,
  });
  const navigate = useNavigate();

  const workflowStore = useWorkflowStore();
  const { resetHistory } = useWorkflowHistory(workflowId);

  const { mutate, isPending, data: upsertData } = useOptimisticUpsertWorkflow();
  const {
    data: fetchedData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetWorkflow(
    workflowId!,
    Boolean(workflowId) && typeof workflowId === "string",
  );

  const [currentWorkflowData, setCurrentWorkflowData] =
    useState<WorkflowAPIResponse | null>(null);

  const originalName =
    currentWorkflowData?.name || (isFetching ? "Loading..." : "My Workflow");

  const [workflowName, setWorkflowName] = useState(originalName);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleEditName = () => {
    setIsEditingName(false);
    if (originalName !== workflowName) {
      workflowStore.setPendingChanges(true);
    }
  };

  const handleSaveWorkflow = async () => {
    workflowStore.setIsLoading(true);
    if (!workflowName.trim()) {
      errorToast("Workflow name cannot be empty");
      return;
    }

    if (!workflowStore.reactFlowInstance) {
      return;
    }

    const flowData = workflowStore.reactFlowInstance.toObject();

    mutate(
      {
        id: currentWorkflowData?.id,
        name: workflowName.trim(),
        serialisedReactFlow: flowData,
        isActive: currentWorkflowData?.isActive,
        config: currentWorkflowData?.config,
        category: currentWorkflowData?.category,
      },
      {
        onSuccess: async () => {
          await resetHistory();
          workflowStore.setPendingChanges(false);
          successToast("Workflow saved successfully", { autoClose: 500 });
        },
        onError: () => {
          errorToast("Failed to save workflow. Please try again.");
        },
        onSettled: () => {
          workflowStore.setIsLoading(false);
        },
      },
    );
  };

  useEffect(() => {
    if (currentWorkflowData?.name) {
      setWorkflowName(currentWorkflowData.name);
    }
  }, [currentWorkflowData?.name]);

  useEffect(() => {
    if (upsertData) {
      return setCurrentWorkflowData(upsertData);
    } else if (fetchedData) {
      return setCurrentWorkflowData(fetchedData);
    }
    setCurrentWorkflowData(null);
  }, [upsertData, fetchedData]);

  useEffect(() => {
    if (fetchError?.errorCode === "NOT_FOUND") {
      setWorkflowName("My Workflow");
      workflowStore.setCurrentWorkflow(null);
      workflowStore.setReactFlowInstance(null);
      workflowStore.setPendingChanges(false);
      navigate({ to: "/builder" });
    } else if (fetchError) {
      console.error(fetchError.toJSON());
      errorToast("Failed to load workflow. Try refreshing the page.");
    }
  }, [fetchError]);

  useEffect(() => {
    if (fetchedData) {
      workflowStore.setCurrentWorkflow(fetchedData);
    }
  }, [fetchedData]);

  useEffect(() => {
    workflowStore.setIsLoading(isPending || isFetching);
  }, [isPending, isFetching, workflowStore.setIsLoading]);

  useEffect(() => {
    if (
      !workflowId &&
      currentWorkflowData?.id &&
      !workflowStore.pendingChanges
    ) {
      navigate({
        to: `/builder/${currentWorkflowData?.id}`,
      });
    }
  }, [workflowStore.pendingChanges, currentWorkflowData]);

  return {
    workflowId,
    handleEditName,
    handleSaveWorkflow,
    isEditingName,
    setIsEditingName,
    setWorkflowName,
    workflowName,
    isPending,
    isFetching,
    currentWorkflow: currentWorkflowData,
  };
};
