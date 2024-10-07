import { Button, Input, useDisclosure } from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ModalComponent } from "../components/modal";
import { OTPInput } from "../components/otp-input";
import { useTimer } from "../components/timer";

type TActiveSection = "initial" | "input_otp" | "reset_password";

const ForgotPasswordModal = ({
  activeSection,
  setActiveSection,
  isNewPasswordVisible,
  toggleNewPasswordVisible,
  isConfirmPasswordVisible,
  toggleConfirmPasswordVisible,
}: {
  activeSection: TActiveSection;
  setActiveSection: Dispatch<SetStateAction<TActiveSection>>;
  isNewPasswordVisible: boolean;
  toggleNewPasswordVisible: () => void;
  isConfirmPasswordVisible: boolean;
  toggleConfirmPasswordVisible: () => void;
}) => {
  const { startTimer, formattedTime } = useTimer({ initialTimeInSec: 300 });

  return activeSection === "initial" ? (
    <form>
      <div className="flex flex-col gap-4 pt-2 pb-6">
        <p className="text-sm font-medium">
          We'll email you an otp to reset your password.
        </p>
        <Input type="email" label="Email" size="md" />
        <Button
          color="primary"
          size="lg"
          onClick={() => {
            startTimer();
            setActiveSection("input_otp");
          }}
        >
          Send OTP
        </Button>
      </div>
    </form>
  ) : activeSection === "input_otp" ? (
    <form>
      <div className="flex flex-col gap-6 pt-2 pb-6">
        <p className="text-sm font-medium">
          We have sent you an otp. Check your mail.
        </p>
        <div className="flex flex-col gap-4">
          <OTPInput />
          <p className="text-sm">The otp expires in {formattedTime}</p>
          <Button
            color="primary"
            size="lg"
            onClick={() => setActiveSection("reset_password")}
          >
            Verify OTP
          </Button>
        </div>
      </div>
    </form>
  ) : (
    <form>
      <div className="flex flex-col gap-6 pt-2 pb-6">
        <div>
          <p className="text-sm font-medium">New password</p>
          <div className="relative">
            <Input
              type={isNewPasswordVisible ? "text" : "password"}
              label="Password"
              size="lg"
            />
            {isNewPasswordVisible ? (
              <EyeOffIcon
                className="absolute top-5 right-3 cursor-pointer"
                onClick={toggleNewPasswordVisible}
              />
            ) : (
              <EyeIcon
                className="absolute top-5 right-3 cursor-pointer"
                onClick={toggleNewPasswordVisible}
              />
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Confirm password</p>
          <div className="relative">
            <Input
              type={isConfirmPasswordVisible ? "text" : "password"}
              label="Password"
              size="lg"
            />
            {isConfirmPasswordVisible ? (
              <EyeOffIcon
                className="absolute top-5 right-3 cursor-pointer"
                onClick={toggleConfirmPasswordVisible}
              />
            ) : (
              <EyeIcon
                className="absolute top-5 right-3 cursor-pointer"
                onClick={toggleConfirmPasswordVisible}
              />
            )}
          </div>
        </div>
        <Button
          color="warning"
          className="text-white font-semibold uppercase"
          size="lg"
        >
          Change password
        </Button>
      </div>
    </form>
  );
};

const useForgotPasswordModal = () => {
  const [activeSection, setActiveSection] = useState<TActiveSection>("initial");

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const toggleNewPasswordVisible = () =>
    setIsNewPasswordVisible(!isNewPasswordVisible);
  const toggleConfirmPasswordVisible = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const openForgotPasswordModal = () => {
    onOpen();
    setActiveSection("initial");
  };

  const modalTitle = () => {
    if (activeSection === "initial") return "Forgot password";
    if (activeSection === "input_otp") return "Enter OTP";
    return "Change password";
  };

  const modalSize = () => {
    if (activeSection === "input_otp") return "md";
    return "lg";
  };

  return {
    openForgotPasswordModal,
    ForgotPasswordModalComponent: (
      <ModalComponent
        title={modalTitle()}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={modalSize()}
      >
        <ForgotPasswordModal
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isNewPasswordVisible={isNewPasswordVisible}
          toggleNewPasswordVisible={toggleNewPasswordVisible}
          isConfirmPasswordVisible={isConfirmPasswordVisible}
          toggleConfirmPasswordVisible={toggleConfirmPasswordVisible}
        />
      </ModalComponent>
    ),
  };
};

export const LoginPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisible = () => setIsPasswordVisible(!isPasswordVisible);

  const { ForgotPasswordModalComponent, openForgotPasswordModal } =
    useForgotPasswordModal();

  return (
    <main className="flex h-screen w-screen">
      <div className="h-screen w-1/2 relative">
        <h1 className="text-white font-bold absolute top-10 left-20 text-4xl">
          Baijan-IDE
        </h1>
        <img src="/stock.jpg" className="h-full w-full" />
      </div>
      <div className="h-full w-1/2 flex items-center justify-center">
        <form className="flex flex-col items-center gap-10 w-[500px] px-6">
          <h1 className="font-medium text-2xl">Log in to your account</h1>
          <div className="flex flex-col gap-4 w-full">
            <Input type="email" label="Email" size="lg" />
            <div className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                label="Password"
                size="lg"
              />
              {isPasswordVisible ? (
                <EyeOffIcon
                  className="absolute top-5 right-3 cursor-pointer"
                  onClick={togglePasswordVisible}
                />
              ) : (
                <EyeIcon
                  className="absolute top-5 right-3 cursor-pointer"
                  onClick={togglePasswordVisible}
                />
              )}
            </div>
            <Button color="primary" size="lg" className="text-lg">
              Log In
            </Button>
          </div>
          <span
            className="text-sm font-medium text-red-400 cursor-pointer hover:underline"
            onClick={openForgotPasswordModal}
          >
            Forgot password?
          </span>
          {ForgotPasswordModalComponent}
        </form>
      </div>
    </main>
  );
};
