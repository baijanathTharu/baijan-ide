import { useState } from "react";
import { OTPInput } from "../components/otp-input";
import { Button } from "../components/button";

export const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <form className="">
        <div className="flex flex-col gap-6 p-10 items-center bg-gray-50 shadow-2xl ">
          <h1 className="text-2xl font-semibold">Verify your email address</h1>
          <p className="text-sm font-medium text-slate-600">
            We have sent you an otp. Check your mail.
          </p>
          <div className="flex flex-col gap-4">
            <OTPInput otp={otp} setOtp={setOtp} />

            <Button color="primary" size="lg">
              Verify OTP
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
