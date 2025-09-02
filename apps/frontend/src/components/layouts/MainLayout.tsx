import { FC, PropsWithChildren } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Button,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { useTheme } from "@heroui/use-theme";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useUserStore } from "../../stores/user.store.ts";

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { theme, setTheme: _setTheme } = useTheme();
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  const _themeIcon = theme === "dark" ? "lucide:sun" : "lucide:moon";

  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col h-screen bg-background">
      <HeroNavbar maxWidth="xl" isBordered>
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
          {user ? (
            <Button
              className="focus:outline-none hover:border-transparent"
              color="primary"
              size="sm"
              variant="solid"
              onPress={() => navigate({ to: "/dashboard" })}
            >
              Dashboard
            </Button>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/signin"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-md"
              >
                Sign in
              </Link>

              <Button
                className="focus:outline-none hover:border-transparent"
                color="primary"
                size="sm"
                variant="solid"
                onPress={() => navigate({ to: "/signup" })}
              >
                Sign up
              </Button>

              {/* only removed temp */}
              {/*<Button*/}
              {/*  isIconOnly*/}
              {/*  variant="light"*/}
              {/*  size="sm"*/}
              {/*  onPress={() => setTheme(theme === "dark" ? "light" : "dark")}*/}
              {/*  aria-label="Toggle theme"*/}
              {/*  className="border-transparent hover:border-transparent focus:border-transparent active:border-transparent focus:outline-none focus:ring-0"*/}
              {/*>*/}
              {/*  <Icon icon={themeIcon} className="h-5 w-5" />*/}
              {/*</Button>*/}
            </div>
          )}
        </NavbarContent>
      </HeroNavbar>

      <div className="flex flex-1 overflow-hidden">
        <motion.main
          className={`flex-1 overflow-auto ${!isHomePage ? "p-4 md:p-6" : ""}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {isHomePage ? (
            children
          ) : (
            <div className="max-w-7xl mx-auto">{children}</div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout;
