import { config } from "dotenv";

config();

export const env = {
  PORT: process.env.PORT || 4001,
  MAIN_SERVER_URL: process.env.MAIN_SERVER_URL || "",
} as const;
