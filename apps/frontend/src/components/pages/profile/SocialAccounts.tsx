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
      <Card>
        <CardHeader className="flex gap-3">
          <h2 className="text-lg font-semibold">Linked Social Accounts</h2>
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
                  className={`text-xs px-1 py-1 min-w-28 rounded-full cursor-pointer focus:outline-none hover:border-transparent ${
                    account.connected
                      ? "bg-danger-100 text-danger-700"
                      : "bg-primary-100 text-primary-700"
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
