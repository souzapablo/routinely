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
