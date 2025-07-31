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
          color="primary"
          size="sm"
          className={"focus:outline-none hover:border-transparent"}
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
                  className="focus:outline-none hover:border-transparent"
                  variant="flat"
                  color="danger"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="focus:outline-none hover:border-transparent"
                  color="primary"
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
