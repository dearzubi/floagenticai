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
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
        }}
      >
        <HeroUITab
          key="available"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:package" className="w-4 h-4" />
              <span>Available Servers</span>
            </div>
          }
          className="focus:outline-none hover:border-transparent p-2 bg-transparent"
        />
        <HeroUITab
          key="installed"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:check-circle" className="w-4 h-4" />
              <span>Installed Servers</span>
              {installedServers !== 0 && (
                <Chip size="sm" variant="flat" color="primary">
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
