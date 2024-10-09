import { Input, useDisclosure } from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ModalComponent } from "../components/modal";
import { OTPInput } from "../components/otp-input";
import { useTimer } from "../components/timer";
import { Button } from "../components/button";

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
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleNewPasswordVisible}
                  aria-label="toggle password visibility"
                >
                  {isNewPasswordVisible ? (
                    <EyeOffIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  ) : (
                    <EyeIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  )}
                </button>
              }
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Confirm password</p>
          <div className="relative">
            <Input
              type={isConfirmPasswordVisible ? "text" : "password"}
              label="Password"
              size="lg"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleConfirmPasswordVisible}
                  aria-label="toggle password visibility"
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOffIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  ) : (
                    <EyeIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  )}
                </button>
              }
            />
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
            <Input color="default" type="email" label="Email" size="lg" />
            <Input
              color="default"
              type={isPasswordVisible ? "text" : "password"}
              label="Password"
              size="lg"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordVisible}
                  aria-label="toggle password visibility"
                >
                  {isPasswordVisible ? (
                    <EyeOffIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  ) : (
                    <EyeIcon className="text-2xl text-default-400 pointer-events-none mb-1" />
                  )}
                </button>
              }
            />
            <a href="/" className="w-full">
              <Button
                color="primary"
                size="lg"
                variant="solid"
                className="text-lg w-full"
              >
                Log In
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-between w-full text-sm">
            <p>
              New User?{" "}
              <a className="text-red-400 hover:underline" href="/auth/sign-up">
                Sign up
              </a>
            </p>
            <span
              className="text-red-400 cursor-pointer hover:underline"
              onClick={openForgotPasswordModal}
            >
              Forgot password?
            </span>
          </div>
          {ForgotPasswordModalComponent}
        </form>
      </div>
    </main>
  );
};
