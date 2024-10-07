import { Button, Input } from "@nextui-org/react";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const LoginPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisible = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <main className="flex h-screen w-screen">
      <div className="h-full w-1/2 bg-red-500"></div>
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
          <span className="text-sm text-red-400">Forgot password?</span>
        </form>
      </div>
    </main>
  );
};
