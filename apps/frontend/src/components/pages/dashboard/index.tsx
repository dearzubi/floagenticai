import { motion } from "framer-motion";
import { useUserStore } from "../../../stores/user.store.ts";
import { FC } from "react";
import { useGetWorkflowList } from "../../../hooks/workflow/api/workflow.api.hooks.ts";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

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
export const DashboardPage: FC = () => {
  const user = useUserStore((state) => state.user);
  const { data: workflows = [], isLoading } = useGetWorkflowList();

  const stats = [
    {
      name: "Total Workflows",
      value: workflows.length,
      icon: "lucide:bot",
    },
    {
      name: "Active Workflows",
      value: workflows.filter((w) => w.isActive).length,
      icon: "lucide:zap",
    },
  ];

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.displayName}! 👋
        </h1>
        <p className="text-default-500">
          Let's see what your AI allies are up to today ✨
        </p>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="grid gap-6 sm:grid-cols-2 w-fit min-w-[600px]"
      >
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-content1 border border-default-200 rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-default-500">
                {stat.name}
              </p>
              {isLoading ? (
                <Spinner size="sm" className="mt-2" />
              ) : (
                <p className="text-3xl font-bold text-default-900">
                  {stat.value}
                </p>
              )}
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Icon icon={stat.icon} className="w-6 h-6 text-primary" />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
export default DashboardPage;
