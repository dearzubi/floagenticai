import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  Button,
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
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-1 rounded-md shadow-lg">
              <Icon icon="lucide:workflow" width={24} />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              FloAgenticAI
            </span>
          </div>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        {/* Notification bell - commented out until functionality is implemented */}
        {/*<Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              className="text-default-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-300"
              aria-label="Notifications"
            >
              <Icon icon="lucide:bell" width={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Notifications"
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/60 dark:border-gray-600/70 shadow-2xl"
          >
            <DropdownItem
              key="new"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              New notifications
            </DropdownItem>
            <DropdownItem
              key="empty"
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              No new notifications
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>*/}

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
