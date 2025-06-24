"use client";

import styles from "../page.module.css";
import {ToneOption} from "../types";

type FormFieldProps = {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  type?: "text" | "textarea" | "select" | "checkbox";
  rows?: number;
  options?: ToneOption[];
};

export default function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rows = 1,
  options = [],
}: FormFieldProps) {
  if (type === "checkbox") {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, optionValue]);
      } else {
        onChange(selectedValues.filter((v) => v !== optionValue));
      }
    };

    return (
      <div className={styles.inputGroup}>
        <label>{label}:</label>
        <div className={styles.checkboxGrid}>
          {options.map((option) => (
            <label key={option.value} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={(e) =>
                  handleCheckboxChange(option.value, e.target.checked)
                }
              />
              <span className={styles.checkboxLabel}>
                <span className={styles.checkboxTitle}>{option.label}</span>
                <span className={styles.checkboxJapanese}>
                  {option.japanese}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className={styles.inputGroup}>
        <label htmlFor={id}>{label}:</label>
        <select
          id={id}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">選択してください</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.japanese}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id}>{label}:</label>
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
