import { useEffect, useRef } from "react";
import { Text } from "../Text/Text.tsx";
import styles from "./Toast.module.css";

/** How long a toast stays up. */
export const TOAST_MS = 3400;

export interface ToastProps {
  /** `null` leaves the region empty and nothing on screen. */
  message: string | null;
  /** A new id restarts the timer, even when the text is the same. */
  id: number;
  /** Called once the toast has been up for `TOAST_MS`. */
  onDone: () => void;
}

/**
 * A short note at the bottom centre of the screen. The live region stays
 * on the page while empty, so the next message is announced.
 */
export function Toast({ message, id, onDone }: ToastProps) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const showing = message !== null;
  useEffect(() => {
    if (!showing) return;
    const timer = setTimeout(() => onDoneRef.current(), TOAST_MS);
    return () => clearTimeout(timer);
  }, [id, showing]);

  return (
    <div role="status" aria-live="polite" className={styles.region}>
      {showing && (
        <div className={styles.toast}>
          <Text as="span" size="sm" weight="medium">
            {message}
          </Text>
        </div>
      )}
    </div>
  );
}
