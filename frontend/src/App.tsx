import "./App.css";
import { NextUIProvider } from "@nextui-org/react";

import { useSocket } from "./lib/socket";

function App() {
  const { isConnected } = useSocket();

  console.log("isconnected", isConnected);

  return (
    <NextUIProvider>
      <h1 className="text-3xl font-bold text-red-400 underline">
        Hello world!
      </h1>
    </NextUIProvider>
  );
}

export default App;
