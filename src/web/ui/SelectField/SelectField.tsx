import { useId } from "react";
import fieldStyles from "../TextField/TextField.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

/** A labelled choice from a short list, drawn as the browser's own select. */
export function SelectField({
  label,
  options,
  value,
  onChange,
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className={fieldStyles.field}>
      <label className={fieldStyles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={fieldStyles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
