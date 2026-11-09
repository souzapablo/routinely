import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "../Button/Button.tsx";
import { Heading } from "../Heading/Heading.tsx";
import styles from "./Drawer.module.css";

export interface DrawerProps {
  open: boolean;
  title: string;
  /** Asked for by Escape, the close button and a click on the backdrop. */
  onClose: () => void;
  /** Accessible name of the close button. */
  closeLabel: string;
  /** Pinned under the scrolling content, so it stays in view on phones. */
  footer?: ReactNode;
  /** Gets focus on close when the element that had it before opening is gone. */
  returnFocusFallback?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/** A modal panel on the right, on the native dialog element. */
export function Drawer({
  open,
  title,
  onClose,
  closeLabel,
  footer,
  returnFocusFallback,
  children,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (dialog.open) return;
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
    // The browser may already have shut the dialog itself (a repeated
    // Escape can skip the cancel event), so focus is returned here either way.
    const opener = openerRef.current;
    if (!opener) return;
    openerRef.current = null;
    const target = opener.isConnected ? opener : returnFocusFallback?.current;
    target?.focus();
  }, [open, returnFocusFallback]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // The open prop decides; the parent closes it through onClose.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The panel fills the dialog, so only a backdrop click lands on it.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <Heading level={2} size="section" id={titleId}>
            {title}
          </Heading>
          <Button variant="ghost" icon="x" iconOnly onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
