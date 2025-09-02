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
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/100 to-cyan-500/100",
      borderColor: "border-blue-500/80",
      shadowColor: "shadow-blue-500/25",
    },
    {
      name: "Active Workflows",
      value: workflows.filter((w) => w.isActive).length,
      icon: "lucide:zap",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/100 to-teal-500/100",
      borderColor: "border-emerald-500/80",
      shadowColor: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50/20 to-blue-100/20 dark:from-gray-950/70 dark:to-blue-950/30 min-h-screen">
      <motion.div
        className="p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Welcome back, {user?.displayName}! 👋
          </h1>
          <p className="text-default-600 text-lg">
            Let's see what your AI allies are up to today ✨
          </p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid gap-6 sm:grid-cols-2 w-fit min-w-[600px]"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              className={`${stat.borderColor} border-r-8 border-b-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-3 border-${stat.borderColor} dark:border-gray-600/70 rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl ${stat.shadowColor} hover:scale-105 transition-all duration-300`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <p
                  className={`text-sm font-medium  bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.name}
                </p>
                {isLoading ? (
                  <Spinner size="sm" className="mt-2" />
                ) : (
                  <p
                    className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                )}
              </div>
              <motion.div
                className={`bg-gradient-to-r ${stat.bgGradient} p-4 rounded-2xl shadow-lg border border-gray-200/30 dark:border-gray-600/30`}
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                }}
              >
                <Icon
                  icon={stat.icon}
                  className={
                    stat.icon === "lucide:bot"
                      ? "w-8 h-8 text-white dark:text-blue-400"
                      : "w-8 h-8 text-white dark:text-emerald-400"
                  }
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
export default DashboardPage;
