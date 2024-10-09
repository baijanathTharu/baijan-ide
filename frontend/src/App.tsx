import "./App.css";
import { NextUIProvider } from "@nextui-org/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { VSCode } from "./components/editor";
import { SignUp } from "./components/sign-up";
import { LoginPage } from "./pages/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <VSCode />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
]);

function App() {
  return (
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  );
}

export default App;
