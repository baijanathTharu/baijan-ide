import { io } from "socket.io-client";

const url = process.env.MAIN_SERVER_URL || "";

if (!url) {
  console.error("MAIN_SERVER_URL is not defined", url);
  throw new Error("MAIN_SERVER_URL is not defined");
}

export const socket = io(url);
