import { motion, Variants } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SocialAccounts from "./SocialAccounts.tsx";
import PersonalInformation from "./PersonalInformation.tsx";
import Index from "./security";
import { FC } from "react";
// import NotificationPreferences from "./NotificationPreferences.tsx";
dayjs.extend(relativeTime);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
} satisfies Variants;

const UserProfilePage: FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50/50 to-violet-50/30 dark:from-gray-900/50 dark:to-violet-900/20 min-h-screen">
      <motion.div
        className="space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <PersonalInformation itemVariants={itemVariants} />
        <SocialAccounts itemVariants={itemVariants} />
        <Index itemVariants={itemVariants} />
        {/*<NotificationPreferences itemVariants={itemVariants} />*/}
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
