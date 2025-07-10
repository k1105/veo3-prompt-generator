"use client";

import {useState} from "react";
import styles from "../page.module.css";
import {ToneOption} from "../types";
import LockButton from "./LockButton";
import UpdateButton from "./UpdateButton";
import DirectionInput from "./DirectionInput";

type FormFieldProps = {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  type?: "text" | "textarea" | "select" | "checkbox";
  rows?: number;
  options?: ToneOption[];
  locked?: boolean;
  onLockToggle?: () => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  fieldKey?: string;
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
  locked = false,
  onLockToggle,
  onUpdate,
  fieldKey,
}: FormFieldProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDirectionInput, setShowDirectionInput] = useState(false);

  const handleUpdate = async (direction: string) => {
    if (!onUpdate || !fieldKey) return;

    setIsUpdating(true);
    try {
      await onUpdate(fieldKey, direction);
      setShowDirectionInput(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateClick = () => {
    if (showDirectionInput) {
      handleUpdate("");
    } else {
      setShowDirectionInput(true);
    }
  };

  const handleCancelDirection = () => {
    setShowDirectionInput(false);
  };

  if (type === "checkbox") {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (locked) return;
      if (checked) {
        onChange([...selectedValues, optionValue]);
      } else {
        onChange(selectedValues.filter((v) => v !== optionValue));
      }
    };

    return (
      <div className={styles.inputGroup}>
        <div className={styles.fieldHeader}>
          <label>{label}:</label>
          <div className={styles.fieldButtons}>
            {onLockToggle && (
              <LockButton locked={locked} onToggle={onLockToggle} />
            )}
            {onUpdate && (
              <UpdateButton
                isUpdating={isUpdating}
                onClick={handleUpdateClick}
              />
            )}
          </div>
        </div>
        {showDirectionInput && onUpdate && (
          <DirectionInput
            onSubmit={handleUpdate}
            onCancel={handleCancelDirection}
            isUpdating={isUpdating}
          />
        )}
        <div
          className={`${styles.checkboxGrid} ${locked ? styles.disabled : ""}`}
        >
          {options.map((option) => (
            <label key={option.value} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={(e) =>
                  handleCheckboxChange(option.value, e.target.checked)
                }
                disabled={locked}
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
        <div className={styles.fieldHeader}>
          <label htmlFor={id}>{label}:</label>
          <div className={styles.fieldButtons}>
            {onLockToggle && (
              <LockButton locked={locked} onToggle={onLockToggle} />
            )}
            {onUpdate && (
              <UpdateButton
                isUpdating={isUpdating}
                onClick={handleUpdateClick}
              />
            )}
          </div>
        </div>
        {showDirectionInput && onUpdate && (
          <DirectionInput
            onSubmit={handleUpdate}
            onCancel={handleCancelDirection}
            isUpdating={isUpdating}
          />
        )}
        <select
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
          className={locked ? styles.disabled : ""}
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
      <div className={styles.fieldHeader}>
        <label htmlFor={id}>{label}:</label>
        <div className={styles.fieldButtons}>
          {onLockToggle && (
            <LockButton locked={locked} onToggle={onLockToggle} />
          )}
          {onUpdate && (
            <UpdateButton isUpdating={isUpdating} onClick={handleUpdateClick} />
          )}
        </div>
      </div>
      {showDirectionInput && onUpdate && (
        <DirectionInput
          onSubmit={handleUpdate}
          onCancel={handleCancelDirection}
          isUpdating={isUpdating}
        />
      )}
      {type === "textarea" ? (
        <textarea
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={locked}
          className={locked ? styles.disabled : ""}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={locked}
          className={locked ? styles.disabled : ""}
        />
      )}
    </div>
  );
}
