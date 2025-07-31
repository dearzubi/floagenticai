import { motion, Variants } from "framer-motion";
import { Card, CardBody, CardHeader, Divider, Switch } from "@heroui/react";
import { FC } from "react";

const NotificationPreferences: FC<{
  itemVariants: Variants;
}> = ({ itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="flex gap-3">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-default-500">
                  Receive updates about your workflows
                </p>
              </div>
              <Switch defaultSelected isDisabled={false} size="sm" />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Workflow Completion Alerts</p>
                <p className="text-sm text-default-500">
                  Get notified when your workflows complete
                </p>
              </div>
              <Switch defaultSelected isDisabled={false} size="sm" />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Communications</p>
                <p className="text-sm text-default-500">
                  Receive product updates and offers
                </p>
              </div>
              <Switch isDisabled={false} size="sm" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default NotificationPreferences;
