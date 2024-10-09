import "./App.css";
import { NextUIProvider } from "@nextui-org/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { VSCode } from "./components/editor";
import { SignUpPage } from "./pages/sign-up";
import { LoginPage } from "./pages/login";
import { VerifyEmail } from "./pages/verifyEmail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const client = new QueryClient();

  return (
    <NextUIProvider>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </NextUIProvider>
  );
}

export default App;
