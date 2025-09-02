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
  {
    id: "mcp-servers",
    label: "MCP Servers",
    icon: "lucide:server",
    to: "/mcp-servers",
    activeHighlightRoutes: ["/mcp-servers"],
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
        "h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200/60 dark:border-gray-600/70 flex flex-col z-20 shadow-lg",
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group",
                    item.isActive
                      ? "border-l-4 border-l-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isCollapsed ? "justify-center" : "justify-start",
                  )}
                >
                  <Icon
                    icon={item.icon}
                    width={20}
                    className={cn(
                      "transition-colors duration-300",
                      item.isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
                    )}
                  />
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "font-medium transition-colors duration-300",
                        item.isActive
                          ? "text-cyan-700 dark:text-cyan-300"
                          : "text-gray-600 dark:text-gray-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300",
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            </Tooltip>
          ))}
        </nav>
      </div>

      <Divider className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-600/50 dark:to-gray-700/50" />

      <div className={cn("p-4", isCollapsed ? "items-center" : "")}>
        {!isCollapsed ? (
          <>
            <Link to={"/profile"}>
              <div
                className={cn(
                  "flex items-center gap-3 mb-4 p-3 rounded-xl transition-all duration-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  location.pathname === "/profile"
                    ? "border-l-3 border-l-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10"
                    : "",
                )}
              >
                <Avatar
                  src={user?.photoURL ?? ""}
                  className={cn(
                    "flex-shrink-0",
                    location.pathname === "/profile"
                      ? "ring-2 ring-cyan-500"
                      : "ring-1 ring-gray-200 dark:ring-gray-600",
                  )}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      location.pathname === "/profile"
                        ? "text-cyan-700 dark:text-cyan-300"
                        : "text-gray-800 dark:text-gray-200",
                    )}
                  >
                    {user?.displayName ?? "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </Link>

            <Button
              variant="flat"
              startContent={<Icon icon="lucide:log-out" width={16} />}
              className="w-full justify-start bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
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
                    ? "ring-2 ring-cyan-500"
                    : "ring-1 ring-gray-200 dark:ring-gray-600 hover:ring-2 hover:ring-cyan-400 transition-all duration-300",
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
                size="sm"
                title="Sign Out"
                className="bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
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
