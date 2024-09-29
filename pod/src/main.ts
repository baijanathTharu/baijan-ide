import http from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { randomUUID } from "crypto";
import chokidar from "chokidar";
import { appendFile, appendFileSync, writeFile } from "fs";

import { initWS } from "./utils/socket";

const port = process.env.PORT || 4001;

async function initServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(compression());
  app.use(helmet());

  const io = initWS(server);

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

      res.json({
        message: "I will send files",
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
    io.emit("files:changed", {
      event,
      path,
    });
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
