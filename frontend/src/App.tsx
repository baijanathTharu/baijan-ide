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
    path: "auth",
    children: [
      {
        path: "sign-up",
        element: <SignUpPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
    ],
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
