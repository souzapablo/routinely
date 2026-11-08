import type { ComponentProps } from "react";
import { Icon, type IconName } from "../Icon/Icon.tsx";
import styles from "./Button.module.css";

export interface ButtonProps extends Omit<
  ComponentProps<"button">,
  "className" | "style" | "children" | "aria-pressed" | "inert"
> {
  variant?: "default" | "primary" | "ghost" | "dashed" | "accent";
  size?: "md" | "sm";
  icon?: IconName;
  /** Square button with only the icon; the label becomes its accessible name. */
  iconOnly?: boolean;
  /** Hides the label on phones but keeps it as the accessible name. */
  collapseLabel?: boolean;
  /** Makes it a toggle button; `true` fills it with the accent color. */
  pressed?: boolean;
  /**
   * Drawn as usual but does nothing and is skipped by Tab, for a control
   * whose feature is not built yet. Unlike `disabled`, it is not faded.
   */
  inert?: boolean;
  children: string;
}

export function Button({
  variant = "default",
  size = "md",
  icon,
  iconOnly = false,
  collapseLabel = false,
  pressed,
  disabled = false,
  inert = false,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const className = [
    styles.button,
    variant !== "default" && styles[variant],
    size === "sm" && styles.sm,
    iconOnly && styles.iconOnly,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={className}
      disabled={disabled || inert}
      aria-pressed={pressed}
      aria-label={iconOnly ? children : undefined}
    >
      {icon && <Icon name={icon} />}
      {!iconOnly && (
        <span className={collapseLabel ? styles.collapse : undefined}>
          {children}
        </span>
      )}
    </button>
  );
}
