// Skeleton-only rules; they move into the design system in T17/T18.
import "./styles.css";
import { LanguageSwitch } from "./LanguageSwitch.tsx";
import { StatusPage } from "./StatusPage.tsx";

export function App() {
  return (
    <div className="app">
      <LanguageSwitch />
      <StatusPage />
    </div>
  );
}
