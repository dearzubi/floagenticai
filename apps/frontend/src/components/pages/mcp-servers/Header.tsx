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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MCP Servers
          </h1>
          <p className="text-default-500 mt-1">
            Discover, install, and manage Model Context Protocol servers
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-default-500">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:server" className="w-4 h-4" />
            <span>{totalServers} available</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check-circle" className="w-4 h-4" />
            <span>{installedServers} installed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
