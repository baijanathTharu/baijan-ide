import "./App.css";
import { NextUIProvider } from "@nextui-org/react";

import { useSocket } from "./lib/socket";
import { VSCode } from "./components/editor";

function App() {
  const { isConnected } = useSocket();

  console.log("isconnected", isConnected);

  return (
    <NextUIProvider>
      <VSCode />
    </NextUIProvider>
  );
}

export default App;
