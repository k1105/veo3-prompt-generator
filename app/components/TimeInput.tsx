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
};

export default function TimeInput({
  label,
  value,
  onIncrement,
  onDecrement,
  disabled = {},
  title = {},
}: TimeInputProps) {
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={`time-${label}`}>{label}:</label>
      <div className={styles.timeCounter}>
        <button
          type="button"
          className={styles.timeButton}
          onClick={onDecrement}
          disabled={disabled.decrement}
          title={title.decrement}
        >
          −
        </button>
        <span className={styles.timeDisplay}>{formatTimeForInput(value)}</span>
        <button
          type="button"
          className={styles.timeButton}
          onClick={onIncrement}
          disabled={disabled.increment}
          title={title.increment}
        >
          +
        </button>
      </div>
    </div>
  );
}
