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
      <Card>
        <CardHeader className="flex gap-3">
          <h2 className="text-lg font-semibold">Security</h2>
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
