"use client";
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Inputs = {
  email: string;
  password: string;
};
export const SignUpPage = () => {
  const [isVisible, setIsvisible] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSubmission: SubmitHandler<Inputs> = (data) => {
    console.log(data.email, data.password);
    navigate("/auth/verifyEmail");
  };

  const toggleVisibility = () => setIsvisible(!isVisible);
  return (
    <div className="w-full h-screen flex flex-row">
      <div className="relative w-1/2 bg-[url('/bg1.jpg')] bg-cover bg-no-repeat">
        <div className="w-full h-screen bg-black bg-opacity-60">
          <h1 className="text-white font-bold absolute top-5 left-10 text-2xl">
            HardEnjoyer-IDE
          </h1>
        </div>
      </div>
      <div className="w-1/2 flex flex-col  items-center justify-center bg-[#fcfcfc] gap-5 ">
        <h2 className="text-3xl text-bold">Create a account</h2>
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
        <p className="text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
