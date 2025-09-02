import { FC } from "react";
import { motion } from "framer-motion";
import { Chip, Tab as HeroUITab, Tabs as HeroUITabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { itemVariants } from "../../ui/mcp/animation.ts";
import { TabNames } from "../../ui/mcp/types.ts";

const Tabs: FC<{
  activeTab: string;
  setActiveTab: (tab: TabNames) => void;
  installedServers: number;
  setCurrentPage: (page: number) => void;
}> = ({ activeTab, setActiveTab, installedServers, setCurrentPage }) => {
  return (
    <motion.div variants={itemVariants}>
      <HeroUITabs
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          setActiveTab(key as TabNames);
          setCurrentPage(1);
        }}
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            "gap-8 w-full relative rounded-none p-0 border-b border-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800",
          cursor:
            "w-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg",
          tab: "max-w-fit px-0 h-12 text-default-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300",
        }}
      >
        <HeroUITab
          key="available"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:package" className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">Available Servers</span>
            </div>
          }
          className="focus:outline-none hover:border-transparent p-2 bg-transparent"
        />
        <HeroUITab
          key="installed"
          title={
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:check-circle"
                className="w-4 h-4 text-emerald-500"
              />
              <span className="font-medium">Installed Servers</span>
              {installedServers !== 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/30"
                >
                  {installedServers}
                </Chip>
              )}
            </div>
          }
          className="focus:outline-none hover:border-transparent p-2 bg-transparent"
        />
      </HeroUITabs>
    </motion.div>
  );
};

export default Tabs;
