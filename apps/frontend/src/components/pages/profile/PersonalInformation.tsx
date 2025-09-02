import { motion, Variants } from "framer-motion";
import { Avatar, Button, Card, CardBody, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useUserStore } from "../../../stores/user.store.ts";
import { firebaseAuth } from "../../../lib/firebase";
import { updateProfile } from "firebase/auth";
import {
  errorToast,
  handleEnterKeyPressedInInputField,
  successToast,
} from "../../../utils/ui.ts";
import { FC, useState } from "react";

const PersonalInformation: FC<{
  itemVariants: Variants;
}> = ({ itemVariants }) => {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const [name, setName] = useState(user?.displayName ?? "");
  const [email] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaveNameInProgress, setSaveNameInProgress] = useState(false);

  const handleEditName = async () => {
    setSaveNameInProgress(true);

    if (!firebaseAuth.currentUser) {
      return;
    }

    try {
      await updateProfile(firebaseAuth.currentUser, {
        displayName: name,
      }).catch((error) => {
        if (
          typeof error.message === "string" &&
          error.message.includes(
            "Cannot assign to read only property 'displayName'",
          )
        ) {
          // Ignore this error, see issue https://github.com/coolpengwing/floagentic.ai/issues/2
        } else {
          throw error;
        }
      });

      setUser({
        ...firebaseAuth.currentUser,
        displayName: name,
      });
      successToast("Name successfully updated.");
    } catch (error) {
      console.error(error);
      errorToast(
        "Failed to update name. Please try again later or contact support.",
      );
    } finally {
      setSaveNameInProgress(false);
      setIsEditing(false);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-visible bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/70 shadow-xl">
        <CardBody className="space-y-6">
          <div className="flex flex-col items-center md:flex-row gap-6">
            <div className="relative">
              <Avatar
                src={user?.photoURL ?? ""}
                className="w-24 h-24 shadow-xl ring-4 ring-violet-500/20 dark:ring-violet-400/30"
              />
              {/*{isEditing && (*/}
              {/*  <Button*/}
              {/*    isIconOnly*/}
              {/*    color="primary"*/}
              {/*    size="sm"*/}
              {/*    className="absolute bottom-0 right-0"*/}
              {/*    aria-label="Change profile picture"*/}
              {/*  >*/}
              {/*    <Icon icon="lucide:camera" width={16} />*/}
              {/*  </Button>*/}
              {/*)}*/}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-2">
                <Input
                  label="Full Name"
                  value={name}
                  onValueChange={setName}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  className="flex-1"
                  onKeyDown={(e) =>
                    handleEnterKeyPressedInInputField(e, handleEditName)
                  }
                />
                {!isEditing ? (
                  <Button
                    isIconOnly
                    className="focus:outline-none hover:border-transparent bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-violet-300/30 hover:border-violet-400/50 text-violet-700 dark:text-violet-300 transition-all duration-300"
                    variant="flat"
                    onPress={() => setIsEditing(true)}
                    aria-label="Edit name"
                  >
                    <Icon icon="lucide:pencil" width={18} />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      className="bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
                      variant="flat"
                      onPress={() => setIsEditing(false)}
                      aria-label="Cancel editing"
                    >
                      <Icon icon="lucide:x" width={18} />
                    </Button>
                    <Button
                      isIconOnly
                      className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-300/30 hover:border-emerald-400/50 text-emerald-700 dark:text-emerald-300 transition-all duration-300"
                      variant="flat"
                      onPress={handleEditName}
                      isLoading={isSaveNameInProgress}
                      aria-label="Save name"
                    >
                      <Icon icon="lucide:check" width={18} />
                    </Button>
                  </div>
                )}
              </div>

              <Input
                label="Email Address"
                value={email}
                type="email"
                isReadOnly
                variant="flat"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PersonalInformation;
