import { FC, useState } from "react";
import { Card, CardBody, Divider, Alert } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import PasswordSignUp from "./PasswordSignUp.tsx";
import SocialSignIn from "../signin/SocialSignIn.tsx";

export const SignUpPage: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>();

  return (
    <div className="h-full bg-background flex items-center justify-center p-2">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mt-6">Create an account</h1>
          <p className="text-default-500 mt-2">
            Start building AI workflows in minutes
          </p>
        </div>

        <Card>
          <CardBody className="p-6 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="space-y-6">
              <div className="space-y-4">
                {!!errorMessage && (
                  <Alert
                    color={"danger"}
                    title={errorMessage}
                    variant={"flat"}
                  />
                )}
                {!!successMessage && (
                  <Alert
                    color={"success"}
                    title={successMessage}
                    variant={"flat"}
                  />
                )}

                <PasswordSignUp
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                />
              </div>
              <div className="flex items-center gap-2">
                <Divider className="flex-1" />
                <span className="text-xs text-default-500">OR</span>
                <Divider className="flex-1" />
              </div>
              <SocialSignIn
                redirectTo={"/dashboard"}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-6">
          <p className="text-default-500">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
