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
    <div className="bg-gradient-to-br from-gray-50/20 to-purple-100/20 dark:from-gray-900/50 dark:to-purple-900/20 min-h-screen">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              My Workflows
            </h1>
            <p className="text-default-600 text-lg">
              Your multi-agentic workflow wizards, reporting for duty 🤖
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {workflowsList.numSelected > 0 && (
              <Button
                className="focus:outline-none hover:border-transparent rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                variant="solid"
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
              className="focus:outline-none rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-gray-300/30 hover:border-gray-300/50 text-foreground shadow-lg hover:shadow-gray-500/25 transition-all duration-300"
              variant="bordered"
              startContent={
                <Icon icon="lucide:upload" width="20" height="20" />
              }
              onPress={onImportModalOpen}
            >
              Import
            </Button>
            <Button
              className="focus:outline-none hover:border-transparent rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
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
    </div>
  );
};

export default Workflows;
