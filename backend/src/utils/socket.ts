import { Server } from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { logger } from "./logger";
import { exec } from "./kubeconfig";

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

    socket.on("join", (data) => {
      console.log(`User ${data.userId} joined`);
      // Handle additional logic here
    });

    socket.on("command", (data) => {
      const { userId, command } = data;
      const podName = `workspace-pod-${userId}`; // Assume pod is already created
      const namespace = "default";

      console.log({
        userId,
        command,
      });

      // Execute the command in the Kubernetes pod
      exec.exec(
        namespace,
        podName,
        "nodejs-container", // The name of the container inside the pod
        command,
        (stdout) => {
          console.log("Command output:", stdout);
          // Send command output back to the user's socket
          socket.emit("output", stdout);
        },
        (stderr) => {
          console.error("Command error:", stderr);
          socket.emit("output", stderr); // Send error output
        },
        socket, // Pass the socket for interactive sessions
        true /* tty */
      );
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "client disconnected");
    });
  });

  return io;
}
