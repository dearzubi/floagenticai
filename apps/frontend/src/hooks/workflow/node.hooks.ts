import { useListAllNodes } from "./api/node.api.hooks.ts";
import { useMemo, useState, DragEvent, MouseEvent } from "react";
import { AllNodesListAPIResponse } from "../../apis/workflow/schemas.ts";
import { NodeSerialised, WorkflowBuilderUINodeData } from "common";

export type GroupedNodes = {
  [category: string]: AllNodesListAPIResponse;
};

const groupNodesByCategory = (nodes: AllNodesListAPIResponse): GroupedNodes => {
  return nodes.reduce((acc, node) => {
    const { category } = node;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as GroupedNodes);
};

/**
 * Use the workflow nodes list from API.
 * Also handles the search term filtering and grouping based on node's category.
 * @param isOpen - Indicates whether the list view is visible (opened) or not.
 */
export const useNodesList = ({ isOpen }: { isOpen: boolean }) => {
  const { data: nodes = [], isLoading } = useListAllNodes(isOpen);
  const [searchTerm, setSearchTerm] = useState("");

  const groupedNodes = useMemo(() => {
    if (!nodes) {
      return {};
    }
    return groupNodesByCategory(nodes);
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) {
      return groupedNodes;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return Object.keys(groupedNodes).reduce((acc, category) => {
      const filtered = groupedNodes[category].filter(
        (node) =>
          node.name.toLowerCase().includes(lowercasedFilter) ||
          node.label.toLowerCase().includes(lowercasedFilter) ||
          node.description.toLowerCase().includes(lowercasedFilter) ||
          node.category.toLowerCase().includes(lowercasedFilter),
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    }, {} as GroupedNodes);
  }, [searchTerm, groupedNodes]);

  return {
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredNodes,
  };
};

export const useNodeDragFromList = ({ onClose }: { onClose: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event: DragEvent, node: NodeSerialised) => {
    const nodeInfo = JSON.stringify({ node });
    event.dataTransfer.setData("application/reactflow", nodeInfo);
    event.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    // Close sidebar after a short delay to allow the drop to complete
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    // Only close if clicking directly on the backdrop and not dragging
    if (event.target === event.currentTarget && !isDragging) {
      onClose();
    }
  };

  return {
    isDragging,
    onDragStart,
    onDragEnd,
    handleBackdropClick,
  };
};

/**
 * Use a version selector to switch between various node versions.
 * @param nodeVersions - List of node versions of a node.
 * @param initialSelectedVersion - Initial selected version number to use
 */
export const useNodeVersionSelector = ({
  nodeVersions,
  initialSelectedVersionNumber,
  defaultVersionNumber,
}: {
  nodeVersions: WorkflowBuilderUINodeData["versions"];
  initialSelectedVersionNumber?: number;
  defaultVersionNumber?: number;
}) => {
  const versionListSorted = nodeVersions
    .sort((a, b) => a.version - b.version)
    .map((version) => {
      return {
        key: String(version.version),
        label: `V${version.version}`,
      };
    });

  const getInitialVersion = () => {
    if (versionListSorted.length === 0) {
      return "";
    }

    if (initialSelectedVersionNumber !== undefined) {
      const initialVersionExists = versionListSorted.some(
        (v) => Number(v.key) === initialSelectedVersionNumber,
      );
      if (initialVersionExists) {
        return String(initialSelectedVersionNumber);
      }
    }

    if (defaultVersionNumber !== undefined) {
      const defaultVersionExists = versionListSorted.some(
        (v) => Number(v.key) === defaultVersionNumber,
      );
      if (defaultVersionExists) {
        return String(defaultVersionNumber);
      }
    }

    // Fall back to highest version (last in sorted array)
    return versionListSorted[versionListSorted.length - 1].key;
  };

  const [selectedVersionNumber, setSelectedVersionNumber] =
    useState(getInitialVersion());

  const selectedVersion = nodeVersions.find(
    (version) => version.version === Number(selectedVersionNumber),
  );

  return {
    versionListSorted,
    selectedVersion,
    selectedVersionNumber,
    setSelectedVersionNumber,
  };
};
