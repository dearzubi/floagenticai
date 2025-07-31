import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

type NavbarProps = {
  onMenuToggle: () => void;
  isSmallScreen: boolean;
};

const DashboardNavbar: FC<NavbarProps> = ({ onMenuToggle, isSmallScreen }) => {
  return (
    <HeroNavbar
      maxWidth="full"
      isBordered
      classNames={{
        wrapper: cn("justify-start", !isSmallScreen ? "pl-0" : "p-4"),
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
            aria-label="Toggle menu"
            className={
              "w-full focus:outline-none hover:!bg-transparent hover:border-transparent"
            }
          >
            <Icon icon="lucide:menu" width={24} />
          </Button>
        </NavbarContent>
      )}

      <NavbarBrand>
        <Link to={"/"}>
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 text-white p-1 rounded-md">
              <Icon icon="lucide:workflow" width={24} />
            </div>
            <span className="font-semibold text-lg text-primary-500">
              FloAgenticAI
            </span>
          </div>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              className="text-default-500"
              aria-label="Notifications"
            >
              <Icon icon="lucide:bell" width={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Notifications">
            <DropdownItem key="new">New notifications</DropdownItem>
            <DropdownItem key="empty">No new notifications</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/*<Dropdown placement="bottom-end">*/}
        {/*  <DropdownTrigger>*/}
        {/*    <Avatar*/}
        {/*      isBordered*/}
        {/*      as="button"*/}
        {/*      className="transition-transform"*/}
        {/*      src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"*/}
        {/*      size="sm"*/}
        {/*    />*/}
        {/*  </DropdownTrigger>*/}
        {/*  <DropdownMenu aria-label="User Actions" variant="flat">*/}
        {/*    <DropdownItem key="profile" className="h-14 gap-2">*/}
        {/*      <p className="font-semibold">Signed in as</p>*/}
        {/*      <p className="font-semibold">alex@example.com</p>*/}
        {/*    </DropdownItem>*/}
        {/*    <DropdownItem key="settings">My Profile</DropdownItem>*/}
        {/*    <DropdownItem key="team_settings">Team Settings</DropdownItem>*/}
        {/*    <DropdownItem key="analytics">Analytics</DropdownItem>*/}
        {/*    <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>*/}
        {/*    <DropdownItem key="logout" color="danger">*/}
        {/*      Log Out*/}
        {/*    </DropdownItem>*/}
        {/*  </DropdownMenu>*/}
        {/*</Dropdown>*/}
      </NavbarContent>
    </HeroNavbar>
  );
};

export default DashboardNavbar;
