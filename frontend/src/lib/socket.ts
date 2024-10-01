import { useState, useEffect } from "react";
import { env } from "./config";
// import { io } from "socket.io-client";
// import WebSocket from "ws";
// import { WebSocket } from "http";

const URL = `${env.VITE_BACKEND_URL}/workspace/123`;
console.log("url", URL);

// export const socket = io(URL);

// export function useSocket() {
//   const [isConnected, setIsConnected] = useState(socket.connected);

//   useEffect(() => {
//     function onConnect() {
//       console.log("socket connected");
//       setIsConnected(true);
//     }

//     function onDisconnect() {
//       console.log("socket disconnected");
//       setIsConnected(false);
//     }

//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//     };
//   }, []);

//   return {
//     socket,
//     isConnected,
//   };
// }

const socket = new WebSocket("ws://localhost:4000/workspace/123");

export function useSocket(
  onMessage: (data: { type: string; payload: any }) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // function onConnect() {
    //   console.log("socket connected");
    //   setIsConnected(true);
    // }

    // function onDisconnect() {
    //   console.log("socket disconnected");
    //   setIsConnected(false);
    // }

    // socket.onopen(onConnect);
    // socket.on("close", onDisconnect);

    // return () => {
    //   socket.off("open", onConnect);
    //   socket.off("close", onDisconnect);
    // };

    function onOpen() {
      console.log("socket connected");
      setIsConnected(true);
    }

    function onClose() {
      console.log("socket disconnected");
      setIsConnected(false);
    }

    // function onMessage(event: any) {
    //   console.log("Message from server ", event.data);
    // }

    socket.addEventListener("open", onOpen);

    // Listen for messages
    socket.addEventListener("message", (d) => onMessage(JSON.parse(d.data)));

    socket.addEventListener("close", onClose);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("message", (d: any) =>
        onMessage(JSON.parse(d))
      );
      socket.removeEventListener("close", onClose);
    };
  }, []);

  return {
    socket,
    isConnected,
  };
}
