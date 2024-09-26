import { config } from "dotenv";

config({
  path: ".env",
});

export const env = {
  PORT: Number(process.env.PORT) || 4001,
  PINO_LOG_LEVEL: process.env.PINO_LOG_LEVEL || "debug",
  NODE_ENV: process.env.NODE_ENV || "prod",
} as const;