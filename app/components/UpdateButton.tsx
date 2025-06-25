"use client";

import {Icon} from "@iconify/react";
import styles from "../page.module.css";

type UpdateButtonProps = {
  isUpdating: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export default function UpdateButton({
  isUpdating,
  onClick,
  disabled = false,
}: UpdateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.updateButton} ${isUpdating ? styles.updating : ""}`}
      disabled={disabled || isUpdating}
      title="AIでアップデート"
    >
      {isUpdating ? (
        <Icon icon="material-symbols:sync-outline" />
      ) : (
        <Icon icon="iconoir:sparks-solid" />
      )}
    </button>
  );
}
