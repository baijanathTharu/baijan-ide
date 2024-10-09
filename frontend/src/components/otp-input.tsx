"use client";

import {
  useRef,
  KeyboardEvent,
  ClipboardEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { Input } from "@nextui-org/react";

type TOTP = {
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
};

export const OTPInput = ({ otp, setOtp }: TOTP) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (index < 5 && element.value !== "") {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to the previous input field on backspace
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedArray = pastedData.slice(0, 6).split("");

    if (
      pastedArray.length === 6 &&
      pastedArray.every((char) => !isNaN(Number(char)))
    ) {
      setOtp(pastedArray);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {otp.map((data, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={data}
          ref={(el) => (inputRefs.current[index] = el)}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          classNames={{
            input: ["text-center"],
          }}
          aria-label={`Digit ${index + 1} of OTP`}
          color="primary"
        />
      ))}
    </div>
  );
};
