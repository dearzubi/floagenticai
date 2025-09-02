import { FC } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { itemVariants } from "../../ui/mcp/animation.ts";

const Header: FC<{
  totalServers: number;
  installedServers: number;
}> = ({ totalServers, installedServers }) => {
  return (
    <motion.div variants={itemVariants} className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            MCP Servers
          </h1>
          <p className="text-default-600 text-lg mt-1">
            Discover, install, and manage Model Context Protocol servers 🔌
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-default-200/80 dark:border-gray-700/30 rounded-full px-4 py-2 shadow-md">
            <Icon icon="lucide:server" className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-default-700">
              {totalServers} available
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-default-200/80 dark:border-gray-700/30 rounded-full px-4 py-2 shadow-md">
            <Icon
              icon="lucide:check-circle"
              className="w-4 h-4 text-emerald-500"
            />
            <span className="text-sm font-medium text-default-700">
              {installedServers} installed
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
