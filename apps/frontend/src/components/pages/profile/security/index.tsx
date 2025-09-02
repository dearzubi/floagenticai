import { motion, Variants } from "framer-motion";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import ChangePassword from "./ChangePassword.tsx";
import MultiFactorAuth from "./multi-factor-auth";
import { FC } from "react";

const Index: FC<{
  itemVariants: Variants;
}> = ({ itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/70 shadow-xl">
        <CardHeader className="flex gap-3 border-b border-gray-200/30 dark:border-gray-600/30">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            Security
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <ChangePassword />
            <Divider />
            <MultiFactorAuth />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
export default Index;
