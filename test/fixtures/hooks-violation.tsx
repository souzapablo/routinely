import { useState } from "react";

// Calls a hook inside a condition, which the React hooks rules forbid.
export function Counter({ show }: { show: boolean }) {
  if (show) {
    const [count] = useState(0);
    return <p>{count}</p>;
  }
  return null;
}
