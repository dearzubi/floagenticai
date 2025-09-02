import { FC, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCredentialsList } from "../../../hooks/credential/credentials.list.hook.ts";
import CredentialList from "../../ui/credential/CredentialsList.tsx";
import NewCredentialModal from "../../ui/credential/NewCredentialModal.tsx";

dayjs.extend(relativeTime);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const Credentials: FC = () => {
  const credentialsList = useCredentialsList();
  const [openNewCredentialModal, setOpenNewCredentialModal] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-50/50 to-amber-50/30 dark:from-gray-900/50 dark:to-orange-900/20 min-h-screen">
      <motion.div
        className="p-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="mb-4 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              My Credentials
            </h1>
            <p className="text-default-600 text-lg">
              Your secret keys and tokens, safe and sound 🔐
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {credentialsList.numSelected > 0 && (
              <Button
                className="focus:outline-none hover:border-transparent rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                variant="solid"
                onPress={credentialsList.handleBulkDelete}
                startContent={
                  <Icon icon="lucide:trash-2" width="20" height="20" />
                }
                isLoading={credentialsList.isDeletionPending}
                isDisabled={credentialsList.isDeletionPending}
              >
                Delete ({credentialsList.numSelected})
              </Button>
            )}
            <Button
              className="focus:outline-none hover:border-transparent rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              startContent={<Icon icon="lucide:plus" width="24" height="24" />}
              onPress={() => {
                setOpenNewCredentialModal(true);
              }}
            >
              New Credential
            </Button>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <CredentialList credentialsList={credentialsList} />
        </motion.div>
        {openNewCredentialModal && (
          <NewCredentialModal
            openNewCredentialModal={openNewCredentialModal}
            setOpenNewCredentialModal={setOpenNewCredentialModal}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Credentials;
