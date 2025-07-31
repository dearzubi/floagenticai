import { FC, PropsWithChildren, useEffect, useState } from "react";
import BuilderNavbar from "../ui/workflow/builder/navbar";
import DashboardSidebar from "../ui/sidebar/DashboardSidebar.tsx";
import { motion } from "framer-motion";
import { useWindowDimensions } from "../../hooks/use-window-dimensions.ts";

const BuilderLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const toggleCollapse = () => {
    if (!isSmallScreen) {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarCollapsed(true);
    }
  }, [isSmallScreen]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <BuilderNavbar
        onMenuToggle={toggleCollapse}
        isSmallScreen={isSmallScreen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <DashboardSidebar isCollapsed={isSidebarCollapsed} />

        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default BuilderLayout;
