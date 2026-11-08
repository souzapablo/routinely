import styles from "./App.module.css";
import { LanguageSwitch } from "./LanguageSwitch.tsx";
import { StatusPage } from "./StatusPage.tsx";

export function App() {
  return (
    <div className={styles.app}>
      <LanguageSwitch />
      <StatusPage />
    </div>
  );
}
