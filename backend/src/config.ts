type TEnv = {
  USER: string;
  PASS: string;
};

export const env = {
  USER: process.env.USER,
  PASS: process.env.PASS,
};
