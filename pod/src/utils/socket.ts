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
    console.log({ socketId: socket.id }, "a user connected");

    import("node-pty").then((pty) => {
      const ptyProcess = pty.spawn("/bin/bash", [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: "/home",
        env: process.env,
      });

      ptyProcess.write("echo Hello World\r");

      socket.on("connect", () => {
        console.log("connected");
      });

      socket.on("pod:terminal_ready", (data) => {
        console.log("pod:terminal_ready received", data);
        ptyProcess.write(data);
      });

      socket.on("pod:terminal_input", (data) => {
        console.log("pod:terminal_input received", data);
        ptyProcess.write(`${data}\n`);
      });

      ptyProcess.onData((data) => {
        console.log("ptyProcess data received", data);
        console.log("pod:terminal_output emitted", data);

        socket.emit("pod:terminal_output", data);
      });

      socket.on("disconnect", () => {
        ptyProcess.kill();
        console.log("socket disconnected");
      });
    });
  });

  return io;
}
