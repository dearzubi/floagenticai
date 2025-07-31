import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  Button,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { useWorkflowData } from "../../../../../hooks/workflow/workflow.data.hook.ts";
import Branding from "./Branding.tsx";
import SaveButton from "./SaveButton.tsx";
import Menu from "./menu";

type NavbarProps = {
  onMenuToggle: () => void;
  isSmallScreen: boolean;
};

const BuilderNavbar: FC<NavbarProps> = ({ onMenuToggle, isSmallScreen }) => {
  const {
    handleEditName,
    handleSaveWorkflow,
    setWorkflowName,
    isEditingName,
    setIsEditingName,
    workflowName,
    isPending,
    isFetching,
    workflowId,
  } = useWorkflowData();

  return (
    <HeroNavbar
      maxWidth="full"
      isBordered
      classNames={{
        wrapper: cn(
          "justify-start items-center",
          !isSmallScreen ? "pl-0" : "p-4",
        ),
        content: "!grow-0",
      }}
    >
      {!isSmallScreen && (
        <NavbarContent
          className={
            "min-w-16 max-w-16 hover:bg-transparent hover:border-transparent"
          }
        >
          <Button
            isIconOnly
            variant="light"
            onPress={onMenuToggle}
            aria-label="Toggle sidebar"
            className="w-full focus:outline-none hover:!bg-default-100 active:!bg-default-200 hover:border-transparent"
          >
            <Icon icon="lucide:menu" width={24} />
          </Button>
        </NavbarContent>
      )}

      <NavbarBrand className="flex-grow basis-0">
        <Branding
          workflowName={workflowName}
          isEditingName={isEditingName}
          handleEditName={handleEditName}
          setIsEditingName={setIsEditingName}
          setWorkflowName={setWorkflowName}
          isFetching={isFetching}
        />
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-2">
        <SaveButton
          isSmallScreen={isSmallScreen}
          isFetching={isFetching}
          isPending={isPending}
          handleSaveWorkflow={handleSaveWorkflow}
        />
        <Menu name={workflowName} id={workflowId} />
      </NavbarContent>
    </HeroNavbar>
  );
};

export default BuilderNavbar;
