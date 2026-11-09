import { VisuallyHidden } from "../Button/VisuallyHidden.tsx";
import styles from "./CoverButton.module.css";

export interface CoverButtonProps {
  /** The accessible name; nothing is drawn. */
  label: string;
  onClick: () => void;
}

/**
 * An invisible button stretched over its positioned parent, so the whole
 * parent acts as one control without wrapping other controls in a button.
 */
export function CoverButton({ label, onClick }: CoverButtonProps) {
  return (
    <button type="button" className={styles.cover} onClick={onClick}>
      <VisuallyHidden>{label}</VisuallyHidden>
    </button>
  );
}
