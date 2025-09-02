import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, Variants } from "framer-motion";
import useSocialAccountLinking from "../../../hooks/auth/use-social-account-linking.ts";
import { FC } from "react";
import { SocialAccountProviderIds } from "../../../types";
import { errorToast, successToast } from "../../../utils/ui.ts";

const SocialAccounts: FC<{
  itemVariants: Variants;
}> = ({ itemVariants }) => {
  const {
    socialAccounts,
    linkSocialAccount,
    unlinkSocialAccount,
    inProgressSocialAccountLink,
  } = useSocialAccountLinking();

  const handleResult = (result: { success: boolean; message?: string }) => {
    if (result.message) {
      if (result.success) {
        successToast(result.message);
      } else {
        errorToast(result.message);
      }
    }
  };

  const handleSocialAccountLinking = async (
    providerId: SocialAccountProviderIds,
  ) => {
    handleResult(await linkSocialAccount(providerId));
  };
  const handleSocialAccountUnlinking = async (
    providerId: SocialAccountProviderIds,
  ) => {
    handleResult(await unlinkSocialAccount(providerId));
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200/60 dark:border-gray-600/70 shadow-xl">
        <CardHeader className="flex gap-3 border-b border-gray-200/30 dark:border-gray-600/30">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            Linked Social Accounts
          </h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col space-y-4">
            {socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col xs:flex-row xs:items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Icon icon={account.icon} width={24} />
                  </div>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    {account.connected && account.email && (
                      <p className="text-sm text-default-500">
                        {account.email}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className={`text-xs px-1 py-1 min-w-28 rounded-full cursor-pointer focus:outline-none hover:border-transparent transition-all duration-300 ${
                    account.connected
                      ? "bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-300/30 hover:border-red-400/50 text-red-700 dark:text-red-300"
                      : "bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-violet-300/30 hover:border-violet-400/50 text-violet-700 dark:text-violet-300"
                  }`}
                  startContent={
                    account.connected ? (
                      <Icon icon={"lucide:link-2-off"} width={18} />
                    ) : (
                      <Icon icon={"lucide:link-2"} width={18} />
                    )
                  }
                  onPress={
                    account.connected
                      ? () => handleSocialAccountUnlinking(account.id)
                      : () => handleSocialAccountLinking(account.id)
                  }
                  isDisabled={inProgressSocialAccountLink !== null}
                  isLoading={inProgressSocialAccountLink === account.id}
                >
                  {account.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default SocialAccounts;
