import { KubeConfig, CoreV1Api, Exec, V1Status } from "@kubernetes/client-node";
import * as pty from "node-pty";

export const kc = new KubeConfig();
kc.loadFromDefault(); // Loads default kubeconfig (adjust if necessary)
export const k8sExec = new Exec(kc);

export async function execInPod({
  namespace,
  podName,
  containerName,
  command,
  cols,
  rows,
}: {
  namespace: string;
  podName: string;
  containerName: string;
  command: string[];
  cols: number;
  rows: number;
}): Promise<pty.IPty> {
  return new Promise((resolve, reject) => {
    // const ptyProcess = pty.spawn("/bin/bash", [], {
    //   name: "xterm-color",
    //   cols,
    //   rows,
    //   cwd: process.env.HOME,
    //   env: process.env,
    // });

    k8sExec.exec(
      namespace,
      podName,
      containerName,
      command,
      process.stdout,
      process.stderr,
      process.stdin,
      true, // tty
      (status: V1Status) => {
        if (status?.status === "Failure") {
          reject(new Error(status.message));
        } else {
          // resolve(ptyProcess);
          // resolve("done")
        }
      }
    );
  });
}
