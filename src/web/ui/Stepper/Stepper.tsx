import groupStyles from "../FieldGroup/FieldGroup.module.css";
import { Button } from "../Button/Button.tsx";
import styles from "./Stepper.module.css";

export interface StepperProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  /** The accessible name of the − button, such as "Fewer times". */
  decrementLabel: string;
  /** The accessible name of the + button, such as "More times". */
  incrementLabel: string;
}

/** A whole number changed one step at a time with − and +, between `min` and `max`. */
export function Stepper({
  label,
  min,
  max,
  value,
  onChange,
  decrementLabel,
  incrementLabel,
}: StepperProps) {
  return (
    <fieldset className={groupStyles.group}>
      <legend className={groupStyles.legend}>{label}</legend>
      <div className={styles.stepper}>
        <Button
          variant="ghost"
          icon="minus"
          iconOnly
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          {decrementLabel}
        </Button>
        <output className={styles.value} aria-live="polite">
          {value}
        </output>
        <Button
          variant="ghost"
          icon="plus"
          iconOnly
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          {incrementLabel}
        </Button>
      </div>
    </fieldset>
  );
}
