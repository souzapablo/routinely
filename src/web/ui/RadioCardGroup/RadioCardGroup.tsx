import { useId } from "react";
import groupStyles from "../FieldGroup/FieldGroup.module.css";
import { Icon, type IconName } from "../Icon/Icon.tsx";
import styles from "./RadioCardGroup.module.css";

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description: string;
  icon?: IconName;
}

export interface RadioCardGroupProps<T extends string> {
  legend: string;
  options: readonly RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** One choice out of a few, each drawn as a card with a title and a description. */
export function RadioCardGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: RadioCardGroupProps<T>) {
  const id = useId();
  return (
    <fieldset className={groupStyles.group}>
      <legend className={groupStyles.legend}>{legend}</legend>
      <div className={styles.cards}>
        {options.map((option) => {
          const inputId = `${id}-${option.value}`;
          return (
            <div key={option.value} className={styles.card}>
              <input
                id={inputId}
                className={styles.input}
                type="radio"
                name={id}
                value={option.value}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
                aria-labelledby={`${inputId}-title`}
                aria-describedby={`${inputId}-description`}
              />
              <label className={styles.label} htmlFor={inputId}>
                <span id={`${inputId}-title`} className={styles.title}>
                  {option.icon && <Icon name={option.icon} />}
                  {option.title}
                </span>
                <span
                  id={`${inputId}-description`}
                  className={styles.description}
                >
                  {option.description}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
