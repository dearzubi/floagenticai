import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { FC } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal.tsx";
import EditCredentialModal from "./EditCredentialModal.tsx";
import type { useCredentialsList } from "../../../hooks/credential/credentials.list.hook.ts";
import { getIconUrl } from "../../../utils/misc.ts";

const CredentialList: FC<{
  credentialsList: ReturnType<typeof useCredentialsList>;
}> = ({ credentialsList }) => {
  return (
    <>
      <div className="mb-6">
        <Input
          isClearable
          classNames={{
            base: "max-w-full sm:max-w-[30%]",
            inputWrapper:
              "border-1 border-default-200 bg-background hover:border-default-300 focus-within:outline-none transition-colors",
            input: "text-small",
            clearButton:
              "text-default-400 hover:text-default-600 border-none focus:outline-none bg-transparent",
          }}
          placeholder="Search credentials by name"
          size="md"
          startContent={
            <Icon
              icon="lucide:search"
              className="text-default-400 pointer-events-none flex-shrink-0"
              width={18}
              height={18}
            />
          }
          value={credentialsList.searchTerm}
          onValueChange={credentialsList.setSearchTerm}
          variant="bordered"
        />
      </div>

      <Table
        aria-label="Credentials list"
        selectionMode="multiple"
        selectedKeys={credentialsList.selectedKeys}
        onSelectionChange={(keys) =>
          credentialsList.setSelectedKeys(keys as "all" | Set<string>)
        }
        sortDescriptor={credentialsList.sortDescriptor}
        onSortChange={credentialsList.setSortDescriptor}
        isHeaderSticky
        classNames={{
          wrapper:
            "max-h-[calc(100vh-320px)] border border-default-200 shadow-none",
          thead: "[&>tr]:first:shadow-none",
          tbody: "[&>tr>td:nth-child(2)]:cursor-pointer",
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
            key="credentialName"
            allowsSorting
            className="text-default-900 hover:!text-default-900"
          >
            Type
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
          items={credentialsList.credentials}
          isLoading={credentialsList.isLoading}
          loadingContent={<Spinner label="Loading credentials..." />}
          emptyContent={
            <div className="text-center p-8">
              <Icon
                icon={
                  credentialsList.searchTerm
                    ? "lucide:search-x"
                    : "lucide:key-round"
                }
                className="mx-auto h-12 w-12 text-default-400"
              />
              <h3 className="mt-2 text-sm font-semibold text-default-900">
                {credentialsList.searchTerm
                  ? "No credentials found"
                  : "No credentials found"}
              </h3>
              <p className="mt-1 text-sm text-default-500">
                {credentialsList.searchTerm
                  ? `No credentials match "${credentialsList.searchTerm}". Try adjusting your search.`
                  : "Get started by creating a new credential."}
              </p>
              {credentialsList.searchTerm && (
                <Button
                  size="sm"
                  variant="flat"
                  className="mt-3 focus:outline-none hover:border-transparent"
                  onPress={() => credentialsList.setSearchTerm("")}
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
              <TableCell>
                <span className="text-default-900 font-medium">
                  {item.name}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {(() => {
                    const definition =
                      credentialsList.credentialDefinitionsMap.get(
                        item.credentialName,
                      );
                    return (
                      <>
                        {definition?.icon ? (
                          <Avatar
                            src={getIconUrl(definition.icon)}
                            alt={definition.label || item.credentialName}
                            size="sm"
                            className="w-6 h-6"
                            classNames={{
                              base: "bg-transparent",
                              img: "object-contain",
                            }}
                          />
                        ) : (
                          <Avatar
                            size="sm"
                            className="w-6 h-6 bg-default-100"
                            fallback={
                              <Icon
                                icon="lucide:key-round"
                                className="text-default-400"
                                width={16}
                                height={16}
                              />
                            }
                          />
                        )}
                        <span className="text-default-700">
                          {definition?.label || item.credentialName}
                        </span>
                      </>
                    );
                  })()}
                </div>
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
                        isDisabled={credentialsList.isDeletionPending}
                      >
                        <Icon
                          icon="lucide:more-vertical"
                          className="text-default-500"
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Credential Actions">
                      <DropdownItem
                        key="edit"
                        onPress={() =>
                          credentialsList.handleEditCredential(item.id)
                        }
                        startContent={
                          <Icon icon="lucide:edit" width={16} height={16} />
                        }
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onPress={() =>
                          credentialsList.handleDeleteCredential(item.id)
                        }
                        color="danger"
                        className="text-danger"
                        startContent={
                          <Icon icon="lucide:trash-2" width={16} height={16} />
                        }
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

      {credentialsList.editCredentialId && (
        <EditCredentialModal
          credentialId={credentialsList.editCredentialId}
          isOpen={credentialsList.isEditModalOpen}
          onClose={credentialsList.handleCloseEditModal}
        />
      )}

      <DeleteConfirmationModal
        confirmDeletion={credentialsList.confirmDeletion}
        credentialToDelete={
          Array.isArray(credentialsList.credentialToDelete)
            ? credentialsList.credentialToDelete
            : credentialsList.credentialToDeleteName
        }
        isPending={credentialsList.isDeletionPending}
        onClose={credentialsList.onClose}
        isOpen={credentialsList.isOpen}
      />
    </>
  );
};

export default CredentialList;
