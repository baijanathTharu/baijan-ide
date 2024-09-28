import { Server } from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { logger } from "./logger";
import { k8sExec } from "./kubeconfig";
import { V1Status } from "@kubernetes/client-node";
import { PassThrough } from "stream";

export type IOClient = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

function cleanOutput(output: string) {
  // Regex to match ANSI escape sequences
  const ansiRegex = /\x1B\[[0-?9;]*[mK]/g;
  return output.replace(ansiRegex, ""); // Remove ANSI escape sequences
}

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

    socket.on("terminal:ready", (data) => {
      console.log(`terminal ready for`, data);
      // Handle additional logic here

      const { userId } = data;
      const podName = `workspace-pod-${userId}`; // Assume pod is already created
      const namespace = "default";

      // const fullCommand = `cd ~ && ${command}`; // Change directory to home before executing the command

      // stdin.write(fullCommand); // Write command to stdin

      console.log({
        userId,
      });

      const stdout = new PassThrough(); // Use PassThrough for stdout
      const stdin = new PassThrough(); // Use PassThrough for stdin

      stdout.on("data", (chunk) => {
        socket.emit("terminal:output", cleanOutput(chunk.toString()));
      });

      socket.on("terminal:input", (command: string) => {
        stdin.write(command);
      });

      // execInPod({
      //   namespace,
      //   podName,
      //   containerName: "nodejs-container",
      //   command: ["/bin/sh", "-c", command],
      //   cols: 80,
      //   rows: 30,
      // }).then((ptyProcess) => {
      //   // Send terminal output to the frontend
      //   ptyProcess.onData((data: string) => {
      //     socket.emit("terminal:output", data);
      //   });

      //   // Listen for input from the frontend
      //   socket.on("terminal:input", (command: string) => {
      //     console.log("terminal:input", command);
      //     ptyProcess.write(command);
      //   });

      //   // Handle terminal resize
      //   socket.on("resize", (size: { cols: number; rows: number }) => {
      //     ptyProcess.resize(size.cols, size.rows);
      //   });

      //   // Clean up on disconnect
      //   socket.on("disconnect", () => {
      //     logger.info({ socketId: socket.id }, "client disconnected");
      //     ptyProcess.kill();
      //     console.log("User disconnected");
      //   });

      // Kubernetes exec call
      k8sExec.exec(
        namespace, // namespace
        podName, // pod name
        "nodejs-container", // container name
        ["/bin/sh"], // command
        stdout, // stdout
        null, // stderr
        stdin, // stdin
        true, // tty enabled
        (status: V1Status) => {
          if (status && status.status === "Failure") {
            console.log("Exec failed:", status.message);
          }
        }
      );
    });

    socket.on("files:changed", (data) => {
      console.log("event: files:changed", data);
    });
  });

  return io;
}
