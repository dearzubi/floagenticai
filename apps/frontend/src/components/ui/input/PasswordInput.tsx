import { Icon } from "@iconify/react";
import { Input, type InputProps } from "@heroui/react";
import { FC, useState } from "react";

const PasswordInput: FC<InputProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  return (
    <Input
      name="password"
      label="Password"
      type={isPasswordVisible ? "text" : "password"}
      placeholder={"Enter your password"}
      endContent={
        <button
          className="focus:outline-none hover:border-transparent"
          type="button"
          onClick={togglePasswordVisibility}
        >
          {isPasswordVisible ? (
            <Icon
              icon="lucide:eye-off"
              className="pointer-events-none text-default-400"
            />
          ) : (
            <Icon
              icon="lucide:eye"
              className="pointer-events-none text-default-400"
            />
          )}
        </button>
      }
      {...props}
    />
  );
};

export default PasswordInput;
