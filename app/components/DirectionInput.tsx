"use client";

import {useState} from "react";
import styles from "../page.module.css";

type DirectionInputProps = {
  onSubmit: (direction: string) => Promise<void>;
  onCancel: () => void;
  isUpdating: boolean;
};

export default function DirectionInput({
  onSubmit,
  onCancel,
  isUpdating,
}: DirectionInputProps) {
  const [direction, setDirection] = useState("");

  const handleSubmit = async () => {
    await onSubmit(direction);
    setDirection("");
  };

  const handleCancel = () => {
    setDirection("");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={styles.directionInput}>
      <input
        type="text"
        placeholder="方向性の指示（オプション）"
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isUpdating}
        className={styles.directionSubmit}
      >
        {isUpdating ? "更新中..." : "更新"}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className={styles.directionCancel}
      >
        キャンセル
      </button>
    </div>
  );
}
