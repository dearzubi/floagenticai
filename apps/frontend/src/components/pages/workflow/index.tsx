import { FC } from "react";
import { useDisclosure } from "@heroui/react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useWorkflowsList } from "../../../hooks/workflow/workflows.list.hook.ts";
import WorkflowList from "../../ui/workflow/list";
import { useNavigate } from "@tanstack/react-router";
import { useWorkflowStore } from "../../../stores/workflow.store.ts";
import { WorkflowImportModal } from "../../ui/workflow/import/WorkflowImportModal.tsx";

dayjs.extend(relativeTime);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const Workflows: FC = () => {
  const navigate = useNavigate();
  const workflowStore = useWorkflowStore();

  const workflowsList = useWorkflowsList();

  const {
    isOpen: isImportModalOpen,
    onOpen: onImportModalOpen,
    onOpenChange: onImportModalOpenChange,
  } = useDisclosure();

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-4 flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold">My Workflows</h1>
          <p className="text-default-500">
            Your multi-agentic workflow wizards, reporting for duty 🤖
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {workflowsList.numSelected > 0 && (
            <Button
              className="focus:outline-none hover:border-transparent rounded-md"
              color="danger"
              variant="flat"
              onPress={workflowsList.handleBulkDelete}
              startContent={
                <Icon icon="lucide:trash-2" width="20" height="20" />
              }
              isLoading={workflowsList.isDeletionPending}
              isDisabled={workflowsList.isDeletionPending}
            >
              Delete ({workflowsList.numSelected})
            </Button>
          )}
          <Button
            className="focus:outline-none hover:border-transparent rounded-md"
            variant="flat"
            startContent={<Icon icon="lucide:upload" width="20" height="20" />}
            onPress={onImportModalOpen}
          >
            Import
          </Button>
          <Button
            className="focus:outline-none hover:border-transparent rounded-md"
            color="primary"
            startContent={<Icon icon="lucide:plus" width="24" height="24" />}
            onPress={() => {
              workflowStore.reset();
              navigate({ to: "/builder" });
            }}
          >
            New Workflow
          </Button>
        </div>
      </motion.div>
      <motion.div variants={itemVariants}>
        <WorkflowList workflowsList={workflowsList} />
      </motion.div>

      <WorkflowImportModal
        isOpen={isImportModalOpen}
        onOpenChange={onImportModalOpenChange}
      />
    </motion.div>
  );
};

export default Workflows;
