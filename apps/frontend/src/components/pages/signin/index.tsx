import { Card, CardBody, Divider, Alert } from "@heroui/react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileRouteTypes } from "../../../routeTree.gen.ts";
import { FC, useState } from "react";
import PasswordSignIn from "./PasswordSignIn.tsx";
import SocialSignIn from "./SocialSignIn.tsx";

const SignInPage: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const route = getRouteApi("/_landing/signin");
  const routeSearch = route.useSearch();

  const redirectTo =
    (routeSearch.redirect as FileRouteTypes["to"] | undefined) ?? "/dashboard";

  return (
    <div className="h-full bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mt-6">Welcome back</h1>
          <p className="text-default-500 mt-2">
            Sign in to your account to continue
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

                <PasswordSignIn
                  redirectTo={redirectTo}
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
                redirectTo={redirectTo}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-6">
          <p className="text-default-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;
