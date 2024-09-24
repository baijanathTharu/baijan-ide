import "./App.css";
import { useSocket } from "./lib/socket";

function App() {
  const { isConnected } = useSocket();

  console.log("isconnected", isConnected);

  return (
    <div className="App">
      <h1>Hello Vite + React!</h1>
    </div>
  );
}

export default App;
