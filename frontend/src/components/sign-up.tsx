import { Input, Button } from "@nextui-org/react";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  email: string;
  password: string;
};
export const SignUp = () => {
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSubmission: SubmitHandler<Inputs> = (data) => {
    console.log(data.email, data.password);
  };
  return (
    <div className="w-full h-screen flex flex-row">
      <div className="relative w-[50%] bg-black">
        <div className="absolute  text-white top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] "></div>
      </div>
      <div className="w-[50%] flex flex-col  items-center justify-center bg-[#fcfcfc] gap-8 ">
        <h2 className="text-4xl text-bold">Create a Replit account</h2>
        <form
          onSubmit={handleSubmit(handleSubmission)}
          className="w-2/3 flex flex-col gap-4 py-4"
        >
          <Input isRequired type="email" label="Email" {...register("email")} />
          <Input
            isRequired
            type="password"
            label="Password"
            {...register("password")}
          />
          <Button color="primary" size="lg" type="submit">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};
