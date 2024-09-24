import { useState, useEffect } from "react";
import { env } from "./config";
import { io } from "socket.io-client";

const URL = env.VITE_BACKEND_URL;

export const socket = io(URL);

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return {
    socket,
    isConnected,
  };
}
