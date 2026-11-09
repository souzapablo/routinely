import { Icon } from "../Icon/Icon.tsx";
import { Text } from "../Text/Text.tsx";
import styles from "./MessageLine.module.css";

export interface MessageLineProps {
  /** Left out or empty, the line is blank but stays on the page. */
  message?: string;
  /**
   * `calm` is a muted note with an info icon, for a rule the form asks the
   * user to follow. `error` is red, kept for a real failure.
   */
  tone?: "calm" | "error";
}

/**
 * A message under a form. The live region is always rendered, so a screen
 * reader announces a message when it appears or changes.
 */
export function MessageLine({ message, tone = "calm" }: MessageLineProps) {
  const className = [styles.line, tone === "error" && styles.error]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="status" aria-live="polite" className={className}>
      {message && (
        <>
          {tone === "calm" && <Icon name="info" />}
          <Text as="span" size="sm">
            {message}
          </Text>
        </>
      )}
    </div>
  );
}
