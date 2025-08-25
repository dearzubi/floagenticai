import { FC, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Pagination } from "@heroui/react";
import {
  useGetMCPServers,
  useGetUserMCPInstallations,
  useInstallMCPServer,
  useUpdateMCPInstallation,
  useDeleteMCPInstallation,
} from "../../../hooks/mcp/api/mcp.api.hooks.ts";
import {
  MCPServerListParams,
  MCPInstallationResponse,
  MCPInstallationCreate,
  MCPInstallationUpdate,
} from "../../../apis/mcp/schemas.ts";
import { MCPServerDescription } from "common";
import MCPConfigurationModal from "../../ui/mcp/MCPConfigurationModal.tsx";
import UninstallConfirmationModal from "../../ui/mcp/UninstallConfirmationModal.tsx";
import { containerVariants, itemVariants } from "../../ui/mcp/animation.ts";
import Header from "./Header.tsx";
import Tabs from "./Tabs.tsx";
import { TabNames } from "../../ui/mcp/types.ts";
import Filters from "./Filters.tsx";
import LoadingCardSkeleton from "../../ui/mcp/LoadingCardSkeleton.tsx";
import LoadingError from "../../ui/mcp/LoadingError.tsx";
import NoServers from "../../ui/mcp/NoServers.tsx";
import TabAvailableServers from "./TabAvailableServers.tsx";
import TabInstalledServers from "./TabInstalledServers.tsx";
import { AppError } from "../../../utils/errors";
import { errorToast, successToast } from "../../../utils/ui.ts";

const MCPServersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<TabNames>("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] =
    useState<MCPServerDescription | null>(null);
  const [editingInstallation, setEditingInstallation] =
    useState<MCPInstallationResponse | null>(null);
  const [isUninstallModalOpen, setIsUninstallModalOpen] = useState(false);
  const [installationToUninstall, setInstallationToUninstall] =
    useState<MCPInstallationResponse | null>(null);

  const params: MCPServerListParams = useMemo(
    () => ({
      page: currentPage,
      limit: 12,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
    }),
    [currentPage, searchQuery, selectedCategory],
  );

  const { data: serversData, isLoading, error } = useGetMCPServers(params);
  const { data: installations, isLoading: installationsLoading } =
    useGetUserMCPInstallations();

  const installMutation = useInstallMCPServer();
  const updateMutation = useUpdateMCPInstallation();
  const deleteMutation = useDeleteMCPInstallation();

  const installedServerNames = new Set(
    installations?.map((i) => i.mcpServerName) || [],
  );

  const availableServers =
    serversData?.servers.filter((server) =>
      activeTab === "available" ? true : installedServerNames.has(server.name),
    ) || [];

  const displayedInstallations =
    activeTab === "installed"
      ? installations?.filter((installation) => {
          const serverInfo = serversData?.servers.find(
            (s) => s.name === installation.mcpServerName,
          );
          if (!searchQuery && !selectedCategory) {
            return true;
          }

          let matchesSearch = true;
          let matchesCategory = true;

          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            matchesSearch =
              installation.name.toLowerCase().includes(searchLower) ||
              installation.description?.toLowerCase().includes(searchLower) ||
              serverInfo?.label.toLowerCase().includes(searchLower) ||
              serverInfo?.description.toLowerCase().includes(searchLower) ||
              installation.selectedTools.some((tool) =>
                tool.toLowerCase().includes(searchLower),
              );
          }

          if (selectedCategory && serverInfo) {
            matchesCategory = serverInfo.category === selectedCategory;
          }

          return matchesSearch && matchesCategory;
        }) || []
      : [];

  const currentServers =
    activeTab === "installed" ? displayedInstallations : availableServers;
  const isCurrentlyLoading =
    activeTab === "installed" ? installationsLoading : isLoading;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const handleInstall = (server: MCPServerDescription) => {
    setSelectedServer(server);
    setEditingInstallation(null);
    setIsInstallModalOpen(true);
  };

  const handleConfigure = (installation: MCPInstallationResponse) => {
    const serverInfo = serversData?.servers.find(
      (s) => s.name === installation.mcpServerName,
    );
    if (serverInfo) {
      setSelectedServer(serverInfo);
      setEditingInstallation(installation);
      setIsInstallModalOpen(true);
    }
  };

  const handleUninstall = (installation: MCPInstallationResponse) => {
    setInstallationToUninstall(installation);
    setIsUninstallModalOpen(true);
  };

  const confirmUninstall = async () => {
    if (!installationToUninstall) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(installationToUninstall.id);
      successToast("MCP server uninstalled successfully");
      setIsUninstallModalOpen(false);
      setInstallationToUninstall(null);
    } catch (error) {
      if (error instanceof AppError) {
        console.error(error.toJSON());
      } else {
        console.error(error);
      }
      errorToast("Failed to uninstall MCP server");
    }
  };

  const handleModalSubmit = async (
    data: MCPInstallationCreate | MCPInstallationUpdate,
  ) => {
    try {
      if (editingInstallation) {
        await updateMutation.mutateAsync({
          id: editingInstallation.id,
          data,
        });
        successToast("MCP server configuration updated successfully");
      } else {
        await installMutation.mutateAsync(data as MCPInstallationCreate);
        successToast("MCP server installed successfully");
        setActiveTab("installed");
      }
      setIsInstallModalOpen(false);
      setSelectedServer(null);
      setEditingInstallation(null);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        console.error(error.toJSON());
      } else {
        console.error(error);
      }
      errorToast(
        (error as Error).message || "Failed to save MCP server configuration",
      );
    }
  };

  return (
    <>
      <motion.div
        className="p-6 space-y-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Header
          totalServers={serversData?.servers.length || 0}
          installedServers={installations?.length || 0}
        />

        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          installedServers={installations?.length || 0}
          setCurrentPage={setCurrentPage}
        />

        <Filters
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          handleCategoryFilter={handleCategoryFilter}
          clearFilters={clearFilters}
          categories={serversData?.categories || []}
        />

        <motion.div variants={itemVariants}>
          {isCurrentlyLoading ? (
            <LoadingCardSkeleton />
          ) : error && activeTab === "available" ? (
            <LoadingError errorMessage={error.message} />
          ) : currentServers.length === 0 ? (
            <NoServers
              activeTab={activeTab}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
              variants={containerVariants}
            >
              {activeTab === "installed" ? (
                <TabInstalledServers
                  installations={installations || []}
                  servers={serversData?.servers}
                  handleConfigure={handleConfigure}
                  handleUninstall={handleUninstall}
                />
              ) : (
                <TabAvailableServers
                  installations={installations || []}
                  availableServers={availableServers}
                  handleInstall={handleInstall}
                  handleConfigure={handleConfigure}
                  handleUninstall={handleUninstall}
                />
              )}
            </motion.div>
          )}
        </motion.div>

        {activeTab === "available" &&
          serversData &&
          serversData.pagination.totalPages > 1 && (
            <motion.div
              variants={itemVariants}
              className="flex justify-center pt-8"
            >
              <Pagination
                total={serversData.pagination.totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                color="primary"
                size="lg"
              />
            </motion.div>
          )}
      </motion.div>

      {selectedServer && (
        <MCPConfigurationModal
          isOpen={isInstallModalOpen}
          onOpenChange={setIsInstallModalOpen}
          server={selectedServer}
          installation={editingInstallation || undefined}
          onSubmit={handleModalSubmit}
          isLoading={installMutation.isPending || updateMutation.isPending}
        />
      )}

      <UninstallConfirmationModal
        isOpen={isUninstallModalOpen}
        onClose={() => {
          setIsUninstallModalOpen(false);
          setInstallationToUninstall(null);
        }}
        confirmUninstall={confirmUninstall}
        installation={installationToUninstall}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};

export default MCPServersPage;
