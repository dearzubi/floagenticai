import {
  useBulkDeleteWorkflows,
  useDeleteWorkflow,
  useGetWorkflowList,
  useOptimisticUpsertWorkflow,
} from "./api/workflow.api.hooks.ts";
import { SortDescriptor, useDisclosure } from "@heroui/react";
import { useMemo, useState } from "react";
import { WorkflowAPIResponse } from "../../apis/workflow/schemas.ts";

export const useWorkflowsList = () => {
  const { data: workflows = [], isLoading } = useGetWorkflowList();
  const deleteWorkflowMutation = useDeleteWorkflow();
  const bulkDeleteWorkflowsMutation = useBulkDeleteWorkflows();
  const upsertWorkflowMutation = useOptimisticUpsertWorkflow();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [workflowToDelete, setWorkflowToDelete] = useState<
    string | string[] | null
  >(null);
  const [workflowToDeleteName, setWorkflowToDeleteName] = useState<
    string | null
  >(null);

  const [selectedKeys, setSelectedKeys] = useState<"all" | Set<string>>(
    new Set([]),
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "updatedAt",
    direction: "descending",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAndSortedWorkflows = useMemo(() => {
    const filtered = workflows.filter((workflow) => {
      if (!searchTerm.trim()) {
        return true;
      }
      const searchLower = searchTerm.toLowerCase();
      return (
        workflow.name.toLowerCase().includes(searchLower) ||
        (workflow.category &&
          workflow.category.toLowerCase().includes(searchLower))
      );
    });

    return filtered.sort((a, b) => {
      const column = sortDescriptor.column;
      const direction = sortDescriptor.direction === "descending" ? -1 : 1;

      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof a];

      if (column === "updatedAt") {
        return (
          (new Date(aValue as string).getTime() -
            new Date(bValue as string).getTime()) *
          direction
        );
      }

      if (column === "isActive") {
        const aIsActive = a.isActive ?? false;
        const bIsActive = b.isActive ?? false;

        if (aIsActive === bIsActive) {
          return 0;
        }

        return (aIsActive > bIsActive ? -1 : 1) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [workflows, sortDescriptor, searchTerm]);

  const handleToggleActive = (
    workflow: WorkflowAPIResponse,
    isActive: boolean,
  ) => {
    upsertWorkflowMutation.mutate({
      id: workflow.id,
      name: workflow.name,
      serialisedReactFlow: workflow.serialisedReactFlow,
      config: workflow.config,
      category: workflow.category,
      isActive,
    });
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    setWorkflowToDelete(workflowId);
    setWorkflowToDeleteName(workflow?.name ?? null);
    onOpen();
  };

  const handleBulkDelete = () => {
    if (selectedKeys === "all") {
      setWorkflowToDelete(filteredAndSortedWorkflows.map((w) => w.id));
    } else {
      setWorkflowToDelete(Array.from(selectedKeys));
    }
    onOpen();
  };

  const confirmDeletion = async () => {
    if (typeof workflowToDelete === "string") {
      await deleteWorkflowMutation.mutateAsync(workflowToDelete);
      setWorkflowToDeleteName(null);
    } else if (Array.isArray(workflowToDelete)) {
      await bulkDeleteWorkflowsMutation.mutateAsync(workflowToDelete);
      setSelectedKeys(new Set([]));
    }
    onClose();
  };

  const numSelected =
    selectedKeys === "all"
      ? filteredAndSortedWorkflows.length
      : selectedKeys.size;

  return {
    workflows: filteredAndSortedWorkflows,
    isLoading,
    numSelected,
    selectedKeys,
    setSelectedKeys,
    sortDescriptor,
    setSortDescriptor,
    searchTerm,
    setSearchTerm,
    handleBulkDelete,
    handleDeleteWorkflow,
    handleToggleActive,
    isOpen,
    confirmDeletion,
    workflowToDelete,
    workflowToDeleteName,
    isDeletionPending:
      bulkDeleteWorkflowsMutation.isPending || deleteWorkflowMutation.isPending,
    upsertWorkflowMutation,
    deleteWorkflowMutation,
    onClose,
  };
};
