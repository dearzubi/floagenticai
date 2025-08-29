import { FC } from "react";
import { motion } from "framer-motion";
import {
  MCPInstallationResponse,
  MCPServerListResponse,
} from "../../../apis/mcp/schemas.ts";
import MCPServerCard from "../../ui/mcp/MCPServerCard.tsx";
import { cardVariants } from "../../ui/mcp/animation.ts";

const TabInstalledServers: FC<{
  installations: MCPInstallationResponse[];
  servers?: MCPServerListResponse["servers"];
  handleConfigure: (installation: MCPInstallationResponse) => void;
  handleUninstall: (installation: MCPInstallationResponse) => void;
}> = ({ installations, servers, handleConfigure, handleUninstall }) => {
  return (
    <>
      {installations.map((installation) => {
        const serverInfo = servers?.find(
          (s) => s.name === installation.mcpServerName,
        );
        return serverInfo ? (
          <motion.div
            key={installation.id}
            variants={cardVariants}
            className="h-full"
          >
            <MCPServerCard
              server={serverInfo}
              installation={installation}
              isInstalled={true}
              onConfigure={handleConfigure}
              onUninstall={handleUninstall}
            />
          </motion.div>
        ) : null;
      })}
    </>
  );
};

export default TabInstalledServers;
