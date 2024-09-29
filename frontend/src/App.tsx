import "./App.css";
import { NextUIProvider } from "@nextui-org/react";

import { VSCode } from "./components/editor";

function App() {
  return (
    <NextUIProvider>
      <VSCode />
    </NextUIProvider>
  );
}

export default App;
