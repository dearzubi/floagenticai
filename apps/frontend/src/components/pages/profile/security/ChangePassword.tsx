import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { useUserStore } from "../../../../stores/user.store.ts";
import {
  handleEnterKeyPressedInInputField,
  successToast,
} from "../../../../utils/ui.ts";
import PasswordInput from "../../../ui/input/PasswordInput.tsx";
import useChangePassword from "../../../../hooks/auth/use-change-password.ts";
import { FC, useState } from "react";

const ChangePassword: FC = () => {
  const user = useUserStore((state) => state.user);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const {
    isPasswordSet,
    isPasswordChangeInProgress,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    currentPasswordError,
    newPasswordError,
    confirmPasswordError,
    changePasswordError,
    resetErrorMessages,
    resetFields,
    changePassword,
  } = useChangePassword();

  const handlePasswordChange = async () => {
    const result = await changePassword();
    if (result.success) {
      setIsPasswordModalOpen(false);
      if (result.message) {
        successToast(result.message);
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Password</p>
          {isPasswordSet && typeof user?.passwordUpdatedAt === "number" ? (
            <p className="text-sm text-default-500">
              Last changed {dayjs(user?.passwordUpdatedAt).fromNow()}
            </p>
          ) : (
            <p className="text-sm text-default-500">Password is not set.</p>
          )}
        </div>
        <Button
          variant="flat"
          size="sm"
          className="focus:outline-none hover:border-transparent bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-violet-300/30 hover:border-violet-400/50 text-violet-700 dark:text-violet-300 transition-all duration-300"
          isDisabled={false}
          onPress={() => setIsPasswordModalOpen(true)}
        >
          {isPasswordSet ? "Change Password" : "Set Password"}
        </Button>
      </div>
      <Modal
        isOpen={isPasswordModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetErrorMessages();
            resetFields();
            setIsPasswordModalOpen(false);
          }
        }}
        placement="center"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isPasswordSet ? "Change Password" : "Set New Password"}
              </ModalHeader>
              <ModalBody>
                {!!changePasswordError && (
                  <Alert title={changePasswordError} color={"danger"} />
                )}
                {isPasswordSet && (
                  <PasswordInput
                    isRequired
                    name="currentPassword"
                    label="Password"
                    placeholder="Enter your current password"
                    variant="bordered"
                    startContent={
                      <Icon icon="lucide:lock" className="text-default-400" />
                    }
                    isDisabled={isPasswordChangeInProgress}
                    isInvalid={!!currentPasswordError}
                    errorMessage={currentPasswordError}
                    value={currentPassword}
                    onValueChange={setCurrentPassword}
                    onKeyDown={(e) =>
                      handleEnterKeyPressedInInputField(e, handlePasswordChange)
                    }
                  />
                )}

                <PasswordInput
                  isRequired
                  name="newPassword"
                  label="New Password"
                  placeholder="Enter your new password"
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="lucide:key"
                      className="text-default-400"
                      width={16}
                    />
                  }
                  isDisabled={isPasswordChangeInProgress}
                  isInvalid={!!newPasswordError}
                  errorMessage={newPasswordError}
                  value={newPassword}
                  onValueChange={setNewPassword}
                  onKeyDown={(e) =>
                    handleEnterKeyPressedInInputField(e, handlePasswordChange)
                  }
                />

                <PasswordInput
                  isRequired
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="lucide:check-circle"
                      className="text-default-400"
                      width={16}
                    />
                  }
                  isDisabled={isPasswordChangeInProgress}
                  isInvalid={!!confirmPasswordError}
                  errorMessage={confirmPasswordError}
                  value={confirmNewPassword}
                  onValueChange={setConfirmNewPassword}
                  onKeyDown={(e) =>
                    handleEnterKeyPressedInInputField(e, handlePasswordChange)
                  }
                />

                <p className="text-xs text-default-500">
                  Password must be at least 6 characters, including a number, an
                  uppercase, and a lowercase letter.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="focus:outline-none hover:border-transparent bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
                  variant="flat"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="focus:outline-none hover:border-transparent bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                  onPress={handlePasswordChange}
                  isLoading={isPasswordChangeInProgress}
                  isDisabled={isPasswordChangeInProgress}
                >
                  {isPasswordSet ? "Change Password" : "Set Password"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChangePassword;
