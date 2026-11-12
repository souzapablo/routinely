import { useRef } from "react";
import { Navigate, Route, Routes } from "react-router";
import { ItemDrawer } from "./week/ItemDrawer.tsx";
import { WeekProvider, useWeek } from "./week/WeekProvider.tsx";
import { TopBar } from "./app/TopBar.tsx";
import { PlannerPage } from "./planner/PlannerPage.tsx";
import { StatusPage } from "./StatusPage.tsx";
import { Toast } from "./ui/Toast/Toast.tsx";
import styles from "./App.module.css";

function WeekToast() {
  const { toast, dismissToast } = useWeek();
  return (
    <Toast
      message={toast?.text ?? null}
      id={toast?.id ?? 0}
      onDone={dismissToast}
    />
  );
}

export function App() {
  // Takes focus when the drawer closes and its opener is gone, such as the
  // block of an anchor that was just deleted.
  const addButton = useRef<HTMLButtonElement>(null);

  return (
    <WeekProvider>
      <div className={styles.app}>
        <TopBar addButtonRef={addButton} />
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
      <ItemDrawer returnFocusFallback={addButton} />
      <WeekToast />
    </WeekProvider>
  );
}
