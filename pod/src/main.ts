import http from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { randomUUID } from "crypto";
import chokidar from "chokidar";
import { appendFile, appendFileSync, writeFile } from "fs";

import { WebSocketServer } from "ws";

import { initWS } from "./utils/socket";
import { IPty } from "node-pty";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const port = process.env.PORT || 4001;

let ptyProcess: IPty | undefined;

import("node-pty").then((pty) => {
  ptyProcess = pty.spawn("/bin/bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: "/home/baijan/personal/projects/baijan-ide/pod",
    env: process.env,
  });
});

type FileTreeItem =
  | {
      id: string;
      name: string;
      type: "folder";
      children: FileTreeItem[];
    }
  | {
      id: string;
      name: string;
      type: "file";
      path: string;
    };

async function recursiveBuildTree(dir: string) {
  let fileTree: Record<string, any> = {};

  const files = await readdir(dir);

  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      fileTree[file] = await recursiveBuildTree(filePath);
    } else {
      fileTree[file] = filePath;
    }
  }

  return fileTree;
}

function convertTreeToArray(tree: any, parentId = ""): FileTreeItem[] {
  return Object.entries(tree).map(([key, value]) => {
    const isFolder = typeof value === "object" && !Array.isArray(value);
    const id = parentId ? `${parentId}/${key}` : key;

    if (isFolder) {
      return {
        id,
        name: key,
        type: "folder",
        children: convertTreeToArray(value, id),
      } as FileTreeItem;
    } else {
      return {
        id,
        name: key,
        type: "file",
        path: value,
      } as FileTreeItem;
    }
  });
}

async function initServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(compression());
  app.use(helmet());

  // const io = initWS(server);

  // websocket
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      const parsedData = JSON.parse(data.toString()) as {
        type: string;
        payload: any;
      };
      const type = parsedData.type;
      const payload = parsedData.payload;
      console.log("parsedData", parsedData);

      if (ptyProcess) {
        if (type === "pod:terminal_input") {
          console.log("pod:terminal_ready received", payload);
          ptyProcess.write(`${parsedData.payload}\n`);
        }

        ptyProcess.onData((d) => {
          console.log("ptyProcess data received", d);

          console.log("pod:terminal_output emitted", d);

          ws.send(
            JSON.stringify({
              type: "pod:terminal_output",
              payload: d.toString(),
            })
          );
        });
      }
    });

    ws.send(
      JSON.stringify({
        type: "ping",
        payload: "pong",
      })
    );
  });
  // websocket

  app.use(
    cors({
      origin(requestOrigin, callback) {
        // fix this
        callback(null, true);
      },
    })
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use((req, res, next) => {
    req.requestId = randomUUID();
    const start = Date.now();

    console.log(
      {
        requestId: req.requestId,
        url: req.url,
        body: req.body,
        method: req.method,
        status: res.statusCode,
      },
      "Request started:"
    );

    res.on("finish", () => {
      const duration = Date.now() - start;

      console.log(
        {
          requestId: req.requestId,
          url: req.url,
          body: req.body,
          method: req.method,
          status: res.statusCode,
          duration: `${duration}ms`,
        },
        "Request finished:"
      );
    });

    next();
  });

  app.get("/ping", async (req, res, next) => {
    res.status(200).send("BACKEND is running...");
  });

  app.get("/files", async (req, res, next) => {
    try {
      appendFileSync(
        "debug.log",
        `files req.requestId: ${req.requestId}\n`,
        "utf-8"
      );

      // create a file tree by reading the users directory

      const dir = join(process.cwd(), "users");
      console.log("cwd", process.cwd());

      const tree = await recursiveBuildTree(dir);

      const result = convertTreeToArray(tree);

      res.json({
        files: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(
      error,
      `Caught error in the global error handler for requestId: ${req.requestId}`
    );
    res.sendStatus(500);
  });

  const watcher = chokidar.watch("users", {
    ignored: /(^|[\/\\])\..|node_modules/, // Ignore dotfiles and node_modules
    persistent: true,
  });

  watcher.on("all", (event, path) => {
    console.log(`File changed ${event}: ${path}`);
    // io.emit("files:changed", {
    //   event,
    //   path,
    // });
  });

  server.listen(port, () => {
    console.log(`[ ready ] http://localhost${port}`);
  });

  async function shutDown() {
    console.debug("SIGTERM signal received: closing HTTP server");

    server.close(async () => {
      console.debug("HTTP server closed");

      process.exit(0);
    });

    setTimeout(() => {
      console.log("forcefully shutting down");
      process.exit(1);
    }, 10_000);
  }

  process.on("SIGTERM", shutDown);
  process.on("SIGINT", shutDown);
}

initServer().catch((e) => {
  console.error("failed to start the server", e);
});
