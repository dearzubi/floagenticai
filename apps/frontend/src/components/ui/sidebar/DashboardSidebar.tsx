import { FC, useMemo } from "react";
import { Button, Divider, Avatar, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/ui.ts";
import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../../../lib/firebase";
import { FileRouteTypes } from "../../../routeTree.gen.ts";
import { useUserStore } from "../../../stores/user.store.ts";

type SidebarProps = {
  isCollapsed: boolean;
};

type NavItem = {
  id: string;
  label: string;
  icon: string;
  isActive?: boolean;
  to: FileRouteTypes["to"];
  activeHighlightRoutes: FileRouteTypes["to"][];
};

let navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "lucide:layout-dashboard",
    isActive: true,
    to: "/dashboard",
    activeHighlightRoutes: ["/dashboard"],
  },
  {
    id: "workflows",
    label: "My Workflows",
    icon: "lucide:git-branch",
    to: "/workflows",
    activeHighlightRoutes: ["/workflows", "/builder"],
  },
  {
    id: "credentials",
    label: "My Credentials",
    icon: "mdi:shield-key-outline",
    to: "/credentials",
    activeHighlightRoutes: ["/credentials"],
  },
  // { id: "agents", label: "Agent Hub", icon: "lucide:bot", to: "" },
  // { id: "analytics", label: "Analytics", icon: "lucide:bar-chart-2", to: "" },
  // { id: "settings", label: "Settings", icon: "lucide:settings", to: "" },
];

const DashboardSidebar: FC<SidebarProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  navItems = useMemo(() => {
    return navItems.map((item) =>
      item.to
        ? {
            ...item,
            isActive:
              location.pathname.startsWith(item.to) ||
              item.activeHighlightRoutes.some((path) =>
                location.pathname.startsWith(path),
              ),
          }
        : item,
    );
  }, [location.pathname]);

  const handleSignOut = async () => {
    setUser(null);
    signOut(firebaseAuth).finally(() => {
      navigate({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    });
  };

  return (
    <motion.aside
      className={cn(
        "h-full bg-content1 border-r border-divider flex flex-col z-20",
        isCollapsed ? "w-16" : "w-64",
      )}
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 256, // 16 * 4 = 64px, 16 * 16 = 256px
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Tooltip
              key={item.id}
              className="capitalize"
              color={"primary"}
              content={item.label}
              placement={"right"}
              hidden={!isCollapsed}
              showArrow={true}
              closeDelay={200}
            >
              <Link to={item.to}>
                <div
                  className={cn(
                    "sidebar-link group",
                    item.isActive ? "active" : "",
                    isCollapsed ? "justify-center" : "justify-start",
                  )}
                >
                  <Icon icon={item.icon} width={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            </Tooltip>
          ))}
        </nav>
      </div>

      <Divider />

      <div className={cn("p-4", isCollapsed ? "items-center" : "")}>
        {!isCollapsed ? (
          <>
            <Link to={"/profile"}>
              <div
                className={cn(
                  "flex items-center gap-3 mb-4 p-2 rounded-lg transition-colors",
                  "hover:bg-default-100",
                  location.pathname === "/profile"
                    ? "bg-primary/10 dark:bg-primary/20 shadow-sm ring-1 ring-primary/20"
                    : "",
                )}
              >
                <Avatar
                  src={user?.photoURL ?? ""}
                  className={cn(
                    "flex-shrink-0 shadow",
                    location.pathname === "/profile"
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "",
                  )}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      location.pathname === "/profile" && "text-primary",
                    )}
                  >
                    {user?.displayName ?? "User"}
                  </p>
                  <p className="text-xs text-default-500 truncate">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </Link>

            <Button
              variant="flat"
              color="danger"
              startContent={<Icon icon="lucide:log-out" width={16} />}
              className="w-full justify-start"
              size="sm"
              onPress={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link to={"/profile"}>
              <Avatar
                src={user?.photoURL ?? ""}
                className={cn(
                  "flex-shrink-0",
                  location.pathname === "/profile"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg"
                    : "",
                )}
                size="sm"
              />
            </Link>
            <Tooltip
              className="capitalize"
              color={"danger"}
              content={"Sign Out"}
              placement={"right"}
              hidden={!isCollapsed}
              showArrow={true}
              closeDelay={200}
            >
              <Button
                isIconOnly
                variant="flat"
                color="danger"
                size="sm"
                title="Sign Out"
                onPress={handleSignOut}
              >
                <Icon icon="lucide:log-out" width={16} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
