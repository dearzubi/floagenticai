import { useState, useMemo } from "react";
import { useDisclosure, SortDescriptor } from "@heroui/react";
import {
  useGetCredentialList,
  useDeleteCredential,
  useBulkDeleteCredentials,
  useCredentialDefinitionList,
} from "./api/credential.api.hooks.ts";

export const useCredentialsList = () => {
  const { data: credentials = [], isLoading } = useGetCredentialList();
  const { data: credentialDefinitions = [] } = useCredentialDefinitionList();
  const deleteCredentialMutation = useDeleteCredential();
  const bulkDeleteCredentialsMutation = useBulkDeleteCredentials();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [credentialToDelete, setCredentialToDelete] = useState<
    string | string[] | null
  >(null);
  const [credentialToDeleteName, setCredentialToDeleteName] = useState<
    string | null
  >(null);

  const [editCredentialId, setEditCredentialId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedKeys, setSelectedKeys] = useState<"all" | Set<string>>(
    new Set([]),
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "updatedAt",
    direction: "descending",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Create a map for quick credential definition lookup
  const credentialDefinitionsMap = useMemo(() => {
    if (!Array.isArray(credentialDefinitions)) {
      return new Map();
    }

    return new Map(
      credentialDefinitions.map((definition) => [definition.name, definition]),
    );
  }, [credentialDefinitions]);

  const filteredAndSortedCredentials = useMemo(() => {
    const filtered = credentials.filter((credential) => {
      if (!searchTerm.trim()) {
        return true;
      }
      const searchLower = searchTerm.toLowerCase();
      const definition = credentialDefinitionsMap.get(
        credential.credentialName,
      );

      return (
        credential.name.toLowerCase().includes(searchLower) ||
        (credential.credentialName &&
          credential.credentialName.toLowerCase().includes(searchLower)) ||
        (definition?.label &&
          definition.label.toLowerCase().includes(searchLower))
      );
    });

    return filtered.sort((a, b) => {
      const column = sortDescriptor.column;
      const direction = sortDescriptor.direction === "descending" ? -1 : 1;

      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof a];

      if (column === "updatedAt" || column === "createdAt") {
        return (
          (new Date(aValue as string).getTime() -
            new Date(bValue as string).getTime()) *
          direction
        );
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [credentials, credentialDefinitionsMap, sortDescriptor, searchTerm]);

  const handleDeleteCredential = (credentialId: string) => {
    const credential = credentials.find((c) => c.id === credentialId);
    setCredentialToDelete(credentialId);
    setCredentialToDeleteName(credential?.name ?? null);
    onOpen();
  };

  const handleEditCredential = (credentialId: string) => {
    setEditCredentialId(credentialId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditCredentialId(null);
    setIsEditModalOpen(false);
  };

  const handleBulkDelete = () => {
    if (selectedKeys === "all") {
      setCredentialToDelete(filteredAndSortedCredentials.map((c) => c.id));
    } else {
      setCredentialToDelete(Array.from(selectedKeys));
    }
    onOpen();
  };

  const confirmDeletion = async () => {
    if (typeof credentialToDelete === "string") {
      await deleteCredentialMutation.mutateAsync(credentialToDelete);
      setCredentialToDeleteName(null);
    } else if (Array.isArray(credentialToDelete)) {
      await bulkDeleteCredentialsMutation.mutateAsync(credentialToDelete);
      setSelectedKeys(new Set([]));
    }
    onClose();
  };

  const numSelected =
    selectedKeys === "all"
      ? filteredAndSortedCredentials.length
      : selectedKeys.size;

  return {
    credentials: filteredAndSortedCredentials,
    credentialDefinitionsMap,
    isLoading,
    numSelected,
    selectedKeys,
    setSelectedKeys,
    sortDescriptor,
    setSortDescriptor,
    searchTerm,
    setSearchTerm,
    handleBulkDelete,
    handleDeleteCredential,
    handleEditCredential,
    editCredentialId,
    isEditModalOpen,
    handleCloseEditModal,
    isOpen,
    confirmDeletion,
    credentialToDelete,
    credentialToDeleteName,
    isDeletionPending:
      bulkDeleteCredentialsMutation.isPending ||
      deleteCredentialMutation.isPending,
    deleteCredentialMutation,
    onClose,
  };
};
