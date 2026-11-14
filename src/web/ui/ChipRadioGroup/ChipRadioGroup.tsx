import { useId, type CSSProperties } from "react";
import groupStyles from "../FieldGroup/FieldGroup.module.css";
import { categoryTones } from "../Swatch/Swatch.tsx";
import styles from "./ChipRadioGroup.module.css";

export type ChipTone = keyof typeof categoryTones;

export interface ChipRadioOption<T extends string> {
  value: T;
  label: string;
  tone: ChipTone;
}

export interface ChipRadioGroupProps<T extends string> {
  legend: string;
  options: readonly ChipRadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function toneStyle(tone: ChipTone): CSSProperties {
  const colors = categoryTones[tone];
  return {
    "--tone-bg": `var(${colors.bg})`,
    "--tone-ink": `var(${colors.ink})`,
    "--tone-line": `var(${colors.line})`,
  } as CSSProperties;
}

/** One choice out of a few, each drawn as a round chip in its own color. */
export function ChipRadioGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: ChipRadioGroupProps<T>) {
  const id = useId();
  return (
    <fieldset className={groupStyles.group}>
      <legend className={groupStyles.legend}>{legend}</legend>
      <div className={styles.chips}>
        {options.map((option) => {
          const inputId = `${id}-${option.value}`;
          return (
            <div key={option.value} className={styles.chip}>
              <input
                id={inputId}
                className={styles.input}
                type="radio"
                name={id}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
              />
              <label
                className={styles.label}
                htmlFor={inputId}
                style={toneStyle(option.tone)}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
