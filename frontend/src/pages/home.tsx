import { useEffect } from "react";

export function HomePage() {
  useEffect(() => {
    fetch("http://localhost:4000/protected", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((d) => console.log("protected route data", d))
      .catch((e) => console.error("protected route error", e));
  }, []);

  return <div>I am homepage</div>;
}
