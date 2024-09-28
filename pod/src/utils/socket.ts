import { appendFileSync } from "fs";
import { io } from "socket.io-client";

const url = process.env.MAIN_SERVER_URL || "";

appendFileSync("debug.log", `MAIN_SERVER_URL: ${url}\n`, "utf-8");

if (!url) {
  console.error("MAIN_SERVER_URL is not defined", url);
  throw new Error("MAIN_SERVER_URL is not defined");
}

export const socket = io(url);
