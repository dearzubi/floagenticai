import { FC } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { FileRouteTypes } from "../../../routeTree.gen.ts";
import { motion } from "framer-motion";
import { Alert, Button, Card, CardBody, InputOtp } from "@heroui/react";
import useMultiFactorAuth from "../../../hooks/auth/use-multi-factor-auth.ts";
import { handleEnterKeyPressedInInputField } from "../../../utils/ui.ts";

const MultiFactorVerification: FC = () => {
  const route = getRouteApi("/_landing/multi-factor-verification");
  const routeSearch = route.useSearch();

  const redirectTo =
    (routeSearch.redirect as FileRouteTypes["to"] | undefined) ?? "/dashboard";

  const {
    verificationCode,
    setVerificationCode,
    verifyMFASignInCode,
    mfaError,
    isVerifyingCode,
    verificationCodeError,
    resetErrorMessages,
  } = useMultiFactorAuth();

  const handleMFAVerification = async () => {
    await verifyMFASignInCode(true, {
      redirectTo,
    });
  };

  return (
    <div className="h-full bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mt-6">Two-factor Authentication</h1>
          <p className="text-default-500 mt-2">
            Enter OTP from your authenticator app
          </p>
        </div>

        <Card>
          <CardBody className="p-6">
            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center justify-center gap-4 w-fit">
                {!!mfaError && (
                  <Alert color={"danger"} title={mfaError} variant={"flat"} />
                )}

                <InputOtp
                  length={6}
                  size="lg"
                  classNames={{
                    segment: "h-14 w-14",
                  }}
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
                    handleEnterKeyPressedInInputField(e, handleMFAVerification)
                  }
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full focus:outline-none hover:border-transparent"
                  size="lg"
                  onPress={handleMFAVerification}
                  isLoading={isVerifyingCode}
                  isDisabled={isVerifyingCode}
                >
                  {isVerifyingCode ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-6">
          <p className="text-default-500">
            Switch account?{" "}
            <Link to="/signin" className="text-primary-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MultiFactorVerification;
