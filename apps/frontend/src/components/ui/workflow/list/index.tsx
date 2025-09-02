import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { FC } from "react";
import DeleteConfirmationModal from "../DeleteConfirmationModal.tsx";
import type { useWorkflowsList } from "../../../../hooks/workflow/workflows.list.hook.ts";
import { useNavigate } from "@tanstack/react-router";

const WorkflowList: FC<{
  workflowsList: ReturnType<typeof useWorkflowsList>;
}> = ({ workflowsList }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6">
        <Input
          isClearable
          classNames={{
            base: "max-w-full sm:max-w-[35%]",
            inputWrapper:
              "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-gray-700/30 hover:border-purple-300 focus-within:border-purple-400/100 shadow-md transition-all duration-300 ",
            input: "text-small ",
            clearButton:
              "text-default-400 hover:text-default-600 border-none focus:outline-none bg-transparent",
          }}
          placeholder="Search workflows by name..."
          size="md"
          startContent={
            <Icon
              icon="lucide:search"
              className="text-default-400 pointer-events-none flex-shrink-0"
              width={18}
              height={18}
            />
          }
          value={workflowsList.searchTerm}
          onValueChange={workflowsList.setSearchTerm}
          variant="bordered"
        />
      </div>

      <Table
        aria-label="Workflows list"
        selectionMode="multiple"
        selectedKeys={workflowsList.selectedKeys}
        onSelectionChange={(keys) =>
          workflowsList.setSelectedKeys(keys as "all" | Set<string>)
        }
        sortDescriptor={workflowsList.sortDescriptor}
        onSortChange={workflowsList.setSortDescriptor}
        isHeaderSticky
        classNames={{
          wrapper:
            "max-h-[calc(100vh-320px)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 shadow-lg rounded-2xl",
          thead: "[&>tr]:first:shadow-none",
          tbody:
            "[&>tr>td:nth-child(2)]:cursor-pointer [&>tr>td:nth-child(2):hover>span]:underline",
        }}
      >
        <TableHeader className="shadow-none">
          <TableColumn
            key="name"
            allowsSorting
            className="text-default-900 hover:!text-default-900"
          >
            Name
          </TableColumn>
          <TableColumn
            key="isActive"
            allowsSorting
            className="text-default-900 hover:!text-default-900"
          >
            Active
          </TableColumn>
          <TableColumn
            key="updatedAt"
            allowsSorting
            className="text-default-900 hover:!text-default-900"
          >
            Last Updated
          </TableColumn>
          <TableColumn
            key="actions"
            align="end"
            className="text-default-900 hover:!text-default-900"
          >
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody
          items={workflowsList.workflows}
          isLoading={workflowsList.isLoading}
          loadingContent={<Spinner label="Loading workflows..." />}
          emptyContent={
            <div className="text-center p-8">
              <Icon
                icon={
                  workflowsList.searchTerm
                    ? "lucide:search-x"
                    : "lucide:folder-search"
                }
                className="mx-auto h-12 w-12 text-default-400"
              />
              <h3 className="mt-2 text-sm font-semibold text-default-900">
                {workflowsList.searchTerm
                  ? "No workflows found"
                  : "No workflows found"}
              </h3>
              <p className="mt-1 text-sm text-default-500">
                {workflowsList.searchTerm
                  ? `No workflows match "${workflowsList.searchTerm}". Try adjusting your search.`
                  : "Get started by creating a new workflow."}
              </p>
              {workflowsList.searchTerm && (
                <Button
                  size="sm"
                  variant="flat"
                  className="mt-3 focus:outline-none hover:border-transparent bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-300/30 hover:border-purple-400/50 transition-all duration-300"
                  onPress={() => workflowsList.setSearchTerm("")}
                  startContent={<Icon icon="lucide:x" width={16} height={16} />}
                >
                  Clear search
                </Button>
              )}
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate({ to: `/builder/${item.id}` });
                }}
              >
                <span className="hover:underline text-default-900">
                  {item.name}
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  isDisabled={workflowsList.upsertWorkflowMutation.isPending}
                  size="sm"
                  isSelected={item.isActive ?? false}
                  onValueChange={(isSelected) =>
                    workflowsList.handleToggleActive(item, isSelected)
                  }
                  aria-label={`Activate workflow ${item.name}`}
                  classNames={{
                    base: "data-[checked=true]:bg-primary",
                  }}
                />
              </TableCell>
              <TableCell>{dayjs(item.updatedAt).fromNow()}</TableCell>
              <TableCell>
                <div className="relative flex justify-end items-center gap-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="border-none focus:outline-none"
                        isDisabled={
                          workflowsList.upsertWorkflowMutation.isPending
                        }
                      >
                        <Icon
                          icon="lucide:more-vertical"
                          className="text-default-500"
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Workflow Actions">
                      <DropdownItem
                        key="edit"
                        onPress={() => navigate({ to: `/builder/${item.id}` })}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onPress={() =>
                          workflowsList.handleDeleteWorkflow(item.id)
                        }
                        color="danger"
                        className="text-danger"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DeleteConfirmationModal
        confirmDeletion={workflowsList.confirmDeletion}
        workflowToDelete={
          Array.isArray(workflowsList.workflowToDelete)
            ? workflowsList.workflowToDelete
            : workflowsList.workflowToDeleteName
        }
        isPending={workflowsList.isDeletionPending}
        onClose={workflowsList.onClose}
        isOpen={workflowsList.isOpen}
      />
    </>
  );
};

export default WorkflowList;
