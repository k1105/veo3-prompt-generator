"use client";

import styles from "../page.module.css";

type TimeInputProps = {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: {
    increment?: boolean;
    decrement?: boolean;
  };
  title?: {
    increment?: string;
    decrement?: string;
  };
  locked?: boolean;
  onLockToggle?: () => void;
};

export default function TimeInput({
  label,
  value,
  onIncrement,
  onDecrement,
  disabled = {},
  title = {},
  locked = false,
  onLockToggle,
}: TimeInputProps) {
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  return (
    <div className={styles.inputGroup}>
      <div className={styles.fieldHeader}>
        <label htmlFor={`time-${label}`}>{label}:</label>
        {onLockToggle && (
          <button
            type="button"
            onClick={onLockToggle}
            className={`${styles.lockButton} ${
              locked ? styles.locked : styles.unlocked
            }`}
            title={locked ? "アンロック" : "ロック"}
          >
            {locked ? "🔒" : "🔓"}
          </button>
        )}
      </div>
      <div className={`${styles.timeCounter} ${locked ? styles.disabled : ""}`}>
        <button
          type="button"
          className={styles.timeButton}
          onClick={onDecrement}
          disabled={disabled.decrement || locked}
          title={locked ? "Time is locked" : title.decrement}
        >
          −
        </button>
        <span className={styles.timeDisplay}>{formatTimeForInput(value)}</span>
        <button
          type="button"
          className={styles.timeButton}
          onClick={onIncrement}
          disabled={disabled.increment || locked}
          title={locked ? "Time is locked" : title.increment}
        >
          +
        </button>
      </div>
    </div>
  );
}
