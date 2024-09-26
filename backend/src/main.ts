import { config } from "dotenv";

config({
  path: ".env",
});

import http from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { randomUUID } from "crypto";
import { createProxyMiddleware } from "http-proxy-middleware";

import { initWS } from "./utils/socket";
import { logger } from "./utils/logger";
import { env } from "./utils/config";
import { kc } from "./utils/kubeconfig";
import { CoreV1Api } from "@kubernetes/client-node";

async function initServer() {
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

  app.use((req, res, next) => {
    req.requestId = randomUUID();
    const start = Date.now();

    logger.info(
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

      logger.info(
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

  const k8sApi = kc.makeApiClient(CoreV1Api);

  // In-memory storage for pod details
  let userWorkspaces: Record<string, any> = {}; // { userId: { podName: 'workspace-pod-abc', podIp: 'xxx.xxx.xxx.xxx' } }

  app.post("/workspace/create", async (req, res, next) => {
    const userId = req.query.userId as string;

    const persistentVolume = {
      apiVersion: "v1",
      kind: "PersistentVolume",
      metadata: {
        name: `pv-workspace-${userId}`,
      },
      spec: {
        capacity: {
          storage: "3Gi",
        },
        accessModes: ["ReadWriteOnce"],
        persistentVolumeReclaimPolicy: "Delete",
        storageClassName: "manual",
        hostPath: {
          path: `/run/desktop/mnt/host/c/Users/Baijan/ide/${userId}`,
          type: "DirectoryOrCreate",
        },
      },
    };

    // PersistentVolumeClaim spec
    const persistentVolumeClaim = {
      apiVersion: "v1",
      kind: "PersistentVolumeClaim",
      metadata: {
        name: `pvc-workspace-${userId}`,
      },
      spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: "manual",
        resources: {
          requests: {
            storage: "3Gi",
          },
        },
      },
    };

    // Pod spec with PVC mounted
    const podSpec = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: `workspace-pod-${userId}`,
        labels: { user: userId },
      },
      spec: {
        containers: [
          {
            name: "nodejs-container",
            image: "node:18-alpine",
            ports: [{ containerPort: 3000 }],
            command: ["sh", "-c", "while true; do sleep 30; done"],
            volumeMounts: [
              {
                name: "workspace-volume",
                mountPath: "/workspace",
              },
            ],
            environment: [
              {
                name: "PORT",
                value: "3000",
              },
              {
                name: "MAIN_SERVER_URL",
                value: "http://localhost:4001",
              },
            ],
          },
        ],
        volumes: [
          {
            name: "workspace-volume",
            hostPath: {
              path: `/var/lib/docker/volumes/ide/_data/${userId}`,
              type: "DirectoryOrCreate",
            },
          },
        ],
      },
    };

    const serviceSpec = {
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: `workspace-service-${userId}`,
      },
      spec: {
        selector: {
          user: userId, // This label matches the pod
        },
        ports: [
          {
            protocol: "TCP",
            port: 3000,
            targetPort: 3000,
          },
        ],
        type: "NodePort", // This exposes the service via a NodePort
      },
    };

    // try {
    //   const pvResponse = await k8sApi.createPersistentVolume(persistentVolume);

    //   if (pvResponse && pvResponse.body.metadata?.name) {
    //     console.log("PersistentVolume created:", pvResponse.body.metadata.name);
    //   }
    //   // Create the PersistentVolumeClaim first
    //   const pvcResponse = await k8sApi.createNamespacedPersistentVolumeClaim(
    //     "default", // Namespace where the PVC will be created
    //     persistentVolumeClaim
    //   );
    //   if (pvcResponse && pvcResponse.body.metadata?.name) {
    //     console.log("PVC created:", pvcResponse.body.metadata.name);
    //   }
    // } catch (err) {
    //   console.error("Error creating PVC or Pod:", err);
    //   res.status(500).json({ error: "Failed to create workspace" });
    //   return;
    // }

    try {
      // Create the Pod
      await k8sApi.createNamespacedPod("default", podSpec);

      // Create the Service
      const serviceResponse = await k8sApi.createNamespacedService(
        "default",
        serviceSpec
      );

      if (!serviceResponse.body.spec?.ports?.length) {
        res.status(500).json({ error: "Failed to create workspace" });
        return;
      }

      const nodePort = serviceResponse.body.spec.ports[0].nodePort;

      console.log("NodePort:", nodePort);

      // Store the NodePort so the frontend can proxy to it
      userWorkspaces[userId] = { nodePort };

      res.status(201).json({
        message: "Workspace created",
        nodePort: nodePort,
        minikubeIp: "minikube", // Or run `minikube ip` to get the correct IP
      });
    } catch (err) {
      console.error("Error creating pod or service:", err);
      res.status(500).json({ error: "Failed to create workspace" });
    }
  });

  /**
   * 2. Proxy frontend requests to the Kubernetes pod
   */
  app.use("/workspace/:userId", (req, res, next) => {
    const userId = req.params.userId;
    const workspace = userWorkspaces[userId];

    if (workspace && workspace.nodePort) {
      const minikubeIp = "192.168.49.2"; // Minikube host
      const nodePort = workspace.nodePort;

      const proxy = createProxyMiddleware({
        target: `http://${minikubeIp}:${nodePort}`,
        changeOrigin: true,
      });

      return proxy(req, res, next);
    } else {
      return res.status(404).json({ error: "Workspace not found" });
    }
  });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(
      error,
      `Caught error in the global error handler for requestId: ${req.requestId}`
    );
    res.sendStatus(500);
  });

  server.listen(env.PORT, () => {
    console.log(`[ ready ] http://localhost:${env.PORT}`);
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
