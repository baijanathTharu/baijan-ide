import { Server } from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { logger } from "./logger";

import socketIOClient from "socket.io-client";

const client = socketIOClient("http://localhost:4001");

client.on("connect", () => {
  logger.info({ socketId: client.id }, "a pod user connected");
});

export type IOClient = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export function initWS(
  httpServer: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >
) {
  const io = new Server(httpServer, {
    cors: {
      // fix this
      origin(requestOrigin, callback) {
        callback(null, true);
      },
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "a user connected");

    socket.on("client:terminal_ready", (data) => {
      console.log("client:terminal_ready received", data);
      console.log("pod:terminal_ready emitted", data);
      client.emit("pod:terminal_ready", "console.log('Hello World!');");
    });

    socket.on("client:terminal_input", (data) => {
      console.log("client:terminal_input received", data);
      console.log("pod:terminal_input emitted", data);
      client.emit("pod:terminal_input", data);
    });

    client.on("pod:terminal_output", (data) => {
      console.log("pod:terminal_output received", data);
      console.log("client:terminal_output emitted", data);
      socket.emit("client:terminal_output", data);
    });
  });

  return io;
}
