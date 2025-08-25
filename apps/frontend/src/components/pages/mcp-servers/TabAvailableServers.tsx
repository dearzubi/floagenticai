import { FC } from "react";
import { motion } from "framer-motion";
import { MCPServerDescription } from "common";
import { cardVariants } from "../../ui/mcp/animation.ts";
import MCPServerCard from "../../ui/mcp/MCPServerCard.tsx";
import { MCPInstallationResponse } from "../../../apis/mcp/schemas.ts";

const TabAvailableServers: FC<{
  installations: MCPInstallationResponse[];
  availableServers: MCPServerDescription[];
  handleInstall: (server: MCPServerDescription) => void;
  handleConfigure: (installation: MCPInstallationResponse) => void;
  handleUninstall: (installation: MCPInstallationResponse) => void;
}> = ({
  availableServers,
  handleInstall,
  installations,
  handleConfigure,
  handleUninstall,
}) => {
  return (
    <>
      {availableServers.map((server) => {
        const installation = installations?.find(
          (i) => i.mcpServerName === server.name,
        );
        return (
          <motion.div
            key={server.name}
            variants={cardVariants}
            className="h-full"
          >
            <MCPServerCard
              server={server}
              onInstall={handleInstall}
              installation={installation}
              isInstalled={!!installation}
              onConfigure={handleConfigure}
              onUninstall={handleUninstall}
            />
          </motion.div>
        );
      })}
    </>
  );
};

export default TabAvailableServers;
