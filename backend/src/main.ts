import { config } from "dotenv";

config({
  path: ".env",
});

import http from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { initWS } from "./utils/socket";

async function initServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  const app = express();
  const server = http.createServer(app);

  const io = initWS(server);

  app.use(compression());
  app.use(helmet());

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

  app.get("/ping", (req, res) => {
    res.status(200).send("BACKEND is running...");
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error({ requestId: req.requestId, error });
    res.sendStatus(500).json({
      message: "Internal server error",
    });
  });

  server.listen(port, () => {
    console.log(`[ ready ] http://localhost:${port}`);
  });
}

initServer().catch((e) => {
  console.error("failed to start the server", e);
});
