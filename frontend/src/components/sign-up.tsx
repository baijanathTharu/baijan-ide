"use client";
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";

type Inputs = {
  email: string;
  password: string;
};
export const SignUpPage = () => {
  const [isVisible, setIsvisible] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSubmission: SubmitHandler<Inputs> = (data) => {
    console.log(data.email, data.password);
  };

  const toggleVisibility = () => setIsvisible(!isVisible);
  return (
    <div className="w-full h-screen flex flex-row">
      <div className="relative w-[50%] bg-[url('/bg1.jpg')] bg-cover bg-no-repeat">
        <div className="w-full h-screen bg-black bg-opacity-60"></div>
        <div className="absolute  text-white top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] ] ">
          <h1 className="text-2xl">
            {" "}
            Unlock Your Coding Potential Start with Us
          </h1>
        </div>
      </div>
      <div className="w-[50%] flex flex-col  items-center justify-center bg-[#fcfcfc] gap-8 ">
        <h2 className="text-4xl text-bold">Create a account</h2>
        <form
          onSubmit={handleSubmit(handleSubmission)}
          className="w-2/3 flex flex-col gap-4 py-4"
        >
          <Input type="email" label="Email" size="lg" {...register("email")} />
          <Input
            type={isVisible ? "text" : "password"}
            label="Password"
            size="lg"
            {...register("password")}
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
                aria-label="toggle password visibility"
              >
                {isVisible ? (
                  <Eye className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
          />
          <Button color="primary" size="lg" type="submit">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};
