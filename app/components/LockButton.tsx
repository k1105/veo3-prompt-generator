"use client";

import {Icon} from "@iconify/react";
import styles from "../page.module.css";

type LockButtonProps = {
  locked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function LockButton({
  locked,
  onToggle,
  disabled = false,
}: LockButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${styles.lockButton} ${
        locked ? styles.locked : styles.unlocked
      }`}
      title={locked ? "アンロック" : "ロック"}
      disabled={disabled}
    >
      {locked ? (
        <Icon icon="material-symbols:lock" />
      ) : (
        <Icon icon="material-symbols:lock-open-outline" />
      )}
    </button>
  );
}
