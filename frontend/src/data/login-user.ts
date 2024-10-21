export type TRegisterInput = {
  email: string;
  password: string;
};

export type TRegisterOutput = {
  message: string;
};

export type TRegisterError = {
  message: string;
};

export const loginUser = async (body: TRegisterInput) => {
  const response = await fetch("http://localhost:4000/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};
