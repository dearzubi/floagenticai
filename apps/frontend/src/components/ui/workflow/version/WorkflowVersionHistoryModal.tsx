import { useState, FC } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useGetInfiniteWorkflowVersions } from "../../../../hooks/workflow/api/workflow.api.hooks";
import { WorkflowVersionListItem } from "../../../../apis/workflow/schemas";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { WorkflowVersionPreviewModal } from "./WorkflowVersionPreviewModal.tsx";
import { WorkflowVersionRestoreModal } from "./WorkflowVersionRestoreModal.tsx";
import { WorkflowVersionDeleteModal } from "./WorkflowVersionDeleteModal.tsx";

dayjs.extend(relativeTime);

export const WorkflowVersionHistoryModal: FC<{
  workflowId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentVersion: number;
}> = ({ workflowId, isOpen, onOpenChange, currentVersion }) => {
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState<
    number | null
  >(null);
  const [selectedVersionForRestore, setSelectedVersionForRestore] = useState<
    number | null
  >(null);
  const [selectedVersionForDelete, setSelectedVersionForDelete] = useState<
    number | null
  >(null);

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onOpenChange: onPreviewOpenChange,
  } = useDisclosure();

  const {
    isOpen: isRestoreOpen,
    onOpen: onRestoreOpen,
    onOpenChange: onRestoreOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteWorkflowVersions(workflowId, 10, isOpen);

  const versions = data?.pages.flat() || [];

  const handlePreview = (version: number) => {
    setSelectedVersionForPreview(version);
    onPreviewOpen();
  };

  const handleRestore = (version: number) => {
    setSelectedVersionForRestore(version);
    onRestoreOpen();
  };

  const handleDelete = (version: number) => {
    setSelectedVersionForDelete(version);
    onDeleteOpen();
  };

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    return {
      relative: date.fromNow(),
      absolute: date.format("MMM D, YYYY at h:mm A"),
    };
  };

  const getVersionStatus = (version: WorkflowVersionListItem) => {
    if (version.version === currentVersion) {
      return (
        <Chip color="success" variant="flat" size="sm">
          Current
        </Chip>
      );
    }
    return (
      <Chip color="default" variant="flat" size="sm">
        Version {version.version}
      </Chip>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          body: "py-6",
          backdrop: "bg-black/50 backdrop-blur-sm",
          closeButton: "hover:border-transparent focus:outline-none",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">Version History</h2>
                <p className="text-sm text-default-500">
                  View and manage different versions of your workflow
                </p>
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                    <span className="ml-2">Loading version history...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12 text-danger">
                    <p>Failed to load version history. Please try again.</p>
                  </div>
                ) : !versions || versions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Icon
                        icon="lucide:clock"
                        className="w-16 h-16 text-default-300 mx-auto mb-4"
                      />
                      <p className="text-default-500">
                        No version history available
                      </p>
                      <p className="text-sm text-default-400 mt-1">
                        Version history will appear here after you make changes
                        to your workflow
                      </p>
                    </div>
                  </div>
                ) : (
                  <Table aria-label="Workflow version history">
                    <TableHeader>
                      <TableColumn>VERSION</TableColumn>
                      <TableColumn>NAME</TableColumn>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>CREATED</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version) => {
                        const dateInfo = formatDate(version.createdAt);
                        const isCurrentVersion =
                          version.version === currentVersion;

                        return (
                          <TableRow key={version.id}>
                            <TableCell>{getVersionStatus(version)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {version.name}
                                </span>
                                {version.category && (
                                  <span className="text-xs text-default-400">
                                    {version.category}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-default-600">
                                {version.description || "No description"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                content={dateInfo.absolute}
                                delay={300}
                                closeDelay={100}
                              >
                                <span className="text-sm text-default-500">
                                  {dateInfo.relative}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Tooltip
                                  content="Preview this version"
                                  delay={300}
                                  closeDelay={100}
                                >
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                      handlePreview(version.version)
                                    }
                                    className="hover:border-transparent focus:outline-none"
                                  >
                                    <Icon
                                      icon="lucide:eye"
                                      className="w-4 h-4"
                                    />
                                  </Button>
                                </Tooltip>
                                {!isCurrentVersion && (
                                  <>
                                    <Tooltip
                                      content="Restore this version"
                                      delay={300}
                                      closeDelay={100}
                                    >
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="warning"
                                        onPress={() =>
                                          handleRestore(version.version)
                                        }
                                        className="hover:border-transparent focus:outline-none"
                                      >
                                        <Icon
                                          icon="lucide:rotate-ccw"
                                          className="w-4 h-4"
                                        />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip
                                      content="Delete this version"
                                      delay={300}
                                      closeDelay={100}
                                    >
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        onPress={() =>
                                          handleDelete(version.version)
                                        }
                                        className="hover:border-transparent focus:outline-none"
                                      >
                                        <Icon
                                          icon="lucide:trash-2"
                                          className="w-4 h-4"
                                        />
                                      </Button>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <div className="flex gap-2">
                  {hasNextPage && (
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => fetchNextPage()}
                      isLoading={isFetchingNextPage}
                      className="hover:border-transparent focus:outline-none"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load More"}
                    </Button>
                  )}
                </div>
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  className="hover:border-transparent focus:outline-none"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {selectedVersionForPreview && (
        <WorkflowVersionPreviewModal
          workflowId={workflowId}
          version={selectedVersionForPreview}
          isOpen={isPreviewOpen}
          onOpenChange={onPreviewOpenChange}
        />
      )}

      {selectedVersionForRestore && (
        <WorkflowVersionRestoreModal
          workflowId={workflowId}
          version={selectedVersionForRestore}
          isOpen={isRestoreOpen}
          onOpenChange={onRestoreOpenChange}
          onSuccess={() => {
            onRestoreOpenChange();
            onOpenChange(false);
          }}
        />
      )}

      {selectedVersionForDelete && (
        <WorkflowVersionDeleteModal
          workflowId={workflowId}
          version={selectedVersionForDelete}
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          onSuccess={() => {
            onDeleteOpenChange();
          }}
        />
      )}
    </>
  );
};
