import pino from "pino";
import { env } from "./config";

export const logger = pino({
  level: env.PINO_LOG_LEVEL || "info",
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }
    : null),
});
