type TEnv = {
  SMTP_USER: string;
  SMTP_PASSWORD: string;
};

export const env = {
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};
