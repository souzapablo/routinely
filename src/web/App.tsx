import { Navigate, Route, Routes } from "react-router";
import { TopBar } from "./app/TopBar.tsx";
import { PlannerPage } from "./planner/PlannerPage.tsx";
import { StatusPage } from "./StatusPage.tsx";
import styles from "./App.module.css";

export function App() {
  return (
    <div className={styles.app}>
      <TopBar />
      <Routes>
        <Route path="/" element={<PlannerPage />} />
        <Route
          path="/status"
          element={
            <div className={styles.status}>
              <StatusPage />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
