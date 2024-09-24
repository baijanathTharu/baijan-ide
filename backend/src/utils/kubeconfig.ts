import { KubeConfig, CoreV1Api, Exec } from "@kubernetes/client-node";

export const kc = new KubeConfig();
kc.loadFromDefault(); // Loads default kubeconfig (adjust if necessary)
export const exec = new Exec(kc);
