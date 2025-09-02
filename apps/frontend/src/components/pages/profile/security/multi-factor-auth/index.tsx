import {
  Alert,
  Button,
  Divider,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  Spinner,
  Switch,
  Link as LinkComponent,
} from "@heroui/react";
import React, { FC, useEffect, useState } from "react";
import { useUserStore } from "../../../../../stores/user.store.ts";
import {
  errorToast,
  handleEnterKeyPressedInInputField,
  successToast,
} from "../../../../../utils/ui.ts";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import SocialAccountIdentityVerification from "./SocialAccountIdentityVerification.tsx";
import useIsPasswordSet from "../../../../../hooks/auth/use-is-password-set.ts";
import PasswordAccountIdentityVerification from "./PasswordAccountIdentityVerification.tsx";
import useConnectedSocialAccounts from "../../../../../hooks/auth/use-connected-social-accounts.ts";
import useMultiFactorAuth from "../../../../../hooks/auth/use-multi-factor-auth.ts";

// Time threshold before requiring re-authentication
const REAUTH_THRESHOLD_MS = 3 * 60 * 1000;

const MultiFactorAuth: FC = () => {
  const user = useUserStore((state) => state.user);

  const timeSinceLastSignIn = dayjs().diff(
    dayjs.unix(user?.lastLoginAt ?? 0),
    "milliseconds",
  );
  const [isMFAModalOpen, setIsMFAModalOpen] = useState(false);

  const [step, setStep] = useState<"auth" | "setup" | "disable">("auth");
  const [isMFAEnabled, setIsMFAEnabled] = useState(!!user?.mfaEnrollmentId);

  useEffect(() => {
    if (
      timeSinceLastSignIn < REAUTH_THRESHOLD_MS &&
      isMFAModalOpen &&
      step === "auth" &&
      !isMFAEnabled
    ) {
      setStep("setup");
    }
  }, [user, timeSinceLastSignIn, isMFAModalOpen, step, isMFAEnabled]);

  const {
    mfaError,
    verificationCodeError,
    isGeneratingMFAKey,
    isVerifyingCode,
    qrCode,
    mfaSecretKey,
    mfaCodeLength,
    verificationCode,
    setVerificationCode,
    generateMFASecretKey,
    verifyMFASetupCode,
    verifyMFASignInCode,
    resetErrorMessages,
    disableMFA,
  } = useMultiFactorAuth();

  const isPasswordSet = useIsPasswordSet();
  const connectedSocialAccounts = useConnectedSocialAccounts();

  const handleMFAToggle = async (_isSelected: boolean) => {
    if (
      (!isPasswordSet || !user?.emailVerified) &&
      connectedSocialAccounts.length === 0
    ) {
      errorToast(
        "Please set up password, verify your email, or link a social account first.",
      );
      return;
    }

    setIsMFAModalOpen(true);
  };

  const handleMFAVerification = async () => {
    const result = await verifyMFASetupCode();
    if (result) {
      setIsMFAModalOpen(false);
      setIsMFAEnabled(true);
      successToast("Two-factor authentication enabled successfully");
    }
  };

  const handleMFADisable = async () => {
    if (user?.mfaEnrollmentId) {
      const resultVerification = await verifyMFASignInCode(false);
      if (resultVerification) {
        disableMFA(user?.mfaEnrollmentId).then((result) => {
          if (result.message && !result.success) {
            errorToast(result.message);
          } else {
            setIsMFAEnabled(false);
            setIsMFAModalOpen(false);
            successToast("Two-factor authentication disabled successfully");
          }
        });
      }
    }
  };

  const resetForm = () => {
    setVerificationCode("");
    setStep("auth");
  };

  useEffect(() => {
    if (isMFAModalOpen && step === "setup") {
      generateMFASecretKey();
    }
  }, [step, isMFAModalOpen]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-default-500">
            Add an extra layer of security using an authenticator app
          </p>
        </div>
        <Switch
          className="focus:outline-none hover:border-transparent"
          size="sm"
          isSelected={isMFAEnabled}
          onValueChange={handleMFAToggle}
        />
      </div>

      <Modal
        isDismissable={false}
        isOpen={isMFAModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            resetErrorMessages();
            setIsMFAModalOpen(false);
          }
        }}
        placement="center"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {step === "auth" && "Verify Identity"}
                {step === "setup" && "Set Up Two-Factor Authentication"}
                {step === "disable" && "Verify Two-Factor Authentication"}
              </ModalHeader>
              <ModalBody>
                {step === "auth" && (
                  <>
                    {connectedSocialAccounts.length > 0 && (
                      <SocialAccountIdentityVerification
                        connectedSocialAccounts={connectedSocialAccounts}
                        setStep={setStep}
                      />
                    )}
                    {connectedSocialAccounts.length > 0 &&
                      isPasswordSet &&
                      user?.emailVerified && (
                        <div className="flex items-center gap-2">
                          <Divider className="flex-1" />
                          <span className="text-xs text-default-500">OR</span>
                          <Divider className="flex-1" />
                        </div>
                      )}
                    {isPasswordSet && user?.emailVerified && (
                      <PasswordAccountIdentityVerification setStep={setStep} />
                    )}
                  </>
                )}
                {step === "setup" && !isMFAEnabled && (
                  <>
                    {mfaError && <Alert title={mfaError} color={"danger"} />}
                    {qrCode && !isGeneratingMFAKey ? (
                      <div className="space-y-4">
                        <div className={"w-full flex justify-center "}>
                          <QRCodeSVG value={qrCode} />
                        </div>
                        <div className={"w-full text-center"}>
                          <p className="text-sm text-center">
                            Scan the above QR code with your authenticator app.
                          </p>
                          <LinkComponent
                            isExternal={true}
                            showAnchorIcon
                            isBlock={true}
                            href={
                              "https://www.microsoft.com/en-gb/security/mobile-authenticator-app"
                            }
                            className={"text-xs"}
                          >
                            Recommendation: Microsoft Authenticator
                          </LinkComponent>
                        </div>

                        <div className="flex items-center gap-2">
                          <Divider className="flex-1" />
                          <span className="text-xs text-default-500">OR</span>
                          <Divider className="flex-1" />
                        </div>
                        <div className={"flex flex-col gap-2 "}>
                          <p className="text-sm text-center">
                            Add the following secret key to your authenticator
                            app.
                          </p>
                          <Snippet symbol={""} color="default">
                            {mfaSecretKey}
                          </Snippet>
                        </div>

                        <div className="flex items-center gap-2">
                          <Divider className="flex-1" />
                          <span className="text-xs text-default-500">
                            After setting up the app
                          </span>
                          <Divider className="flex-1" />
                        </div>

                        <div className={"w-full flex justify-center"}>
                          <InputOtp
                            length={mfaCodeLength}
                            description="Enter OTP from your authenticator app"
                            onValueChange={(code) => {
                              if (verificationCodeError) {
                                resetErrorMessages();
                              }
                              setVerificationCode(code);
                            }}
                            value={verificationCode}
                            isInvalid={!!verificationCodeError}
                            errorMessage={verificationCodeError}
                            isDisabled={isVerifyingCode}
                            onKeyDown={(e) =>
                              handleEnterKeyPressedInInputField(
                                e,
                                handleMFAVerification,
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <Spinner size="lg" color="primary" />
                    )}
                  </>
                )}
                {step === "disable" && isMFAEnabled && (
                  <div className={"w-full flex justify-center"}>
                    <InputOtp
                      size="lg"
                      length={mfaCodeLength}
                      description="Enter OTP from your authenticator app"
                      onValueChange={(code) => {
                        if (verificationCodeError) {
                          resetErrorMessages();
                        }
                        setVerificationCode(code);
                      }}
                      value={verificationCode}
                      isInvalid={!!verificationCodeError}
                      errorMessage={verificationCodeError}
                      isDisabled={isVerifyingCode}
                      onKeyDown={(e) =>
                        handleEnterKeyPressedInInputField(e, handleMFADisable)
                      }
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  className="focus:outline-none hover:border-transparent bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300 transition-all duration-300"
                  variant="flat"
                  onPress={onClose}
                >
                  Cancel
                </Button>

                {(step === "setup" || step === "disable") && (
                  <Button
                    className="focus:outline-none hover:border-transparent bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                    onPress={
                      step === "setup"
                        ? handleMFAVerification
                        : handleMFADisable
                    }
                    isLoading={isVerifyingCode}
                    isDisabled={
                      isGeneratingMFAKey ||
                      isVerifyingCode ||
                      isGeneratingMFAKey ||
                      !verificationCode ||
                      verificationCode.length !== mfaCodeLength
                    }
                  >
                    {step === "setup" ? "Set Up" : "Verify"}
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MultiFactorAuth;
