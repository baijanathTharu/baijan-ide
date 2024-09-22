import { Server } from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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
    console.log("a user connected", socket.id);

    socket.on("disconnect", () => {
      console.log("client disconnected", socket.id);
    });
  });

  return io;
}
