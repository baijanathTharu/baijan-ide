import "./App.css";
import { NextUIProvider } from "@nextui-org/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { VSCode } from "./components/editor";
import { SignUpPage } from "./pages/sign-up";
import { LoginPage } from "./pages/login";
import { VerifyEmail } from "./pages/verifyEmail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <VSCode />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/verifyEmail",
    element: <VerifyEmail />,
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
