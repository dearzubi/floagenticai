import { FC } from "react";
import { Button as HeroButton, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "../../../../../../utils/ui.ts";

const Button: FC<{
  className?: string;
  onPress?: () => void;
  icon: string;
  iconColor?: string;
  tooltipText?: string;
}> = ({ className, onPress, icon, tooltipText }) => {
  return (
    <Tooltip content={tooltipText} closeDelay={200} placement={"top"}>
      <HeroButton
        isIconOnly
        variant="light"
        size="sm"
        className={cn(
          "h-6 w-6 min-w-6 text-gray-500 hover:text-primary-600 hover:bg-primary-100 hover:border-transparent focus:outline-none",
          className,
        )}
        onPress={onPress}
      >
        <Icon icon={icon} className="h-4 w-4" />
      </HeroButton>
    </Tooltip>
  );
};

export default Button;
