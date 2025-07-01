"use client";

import {useState} from "react";
import styles from "./ReferenceButton.module.css";
import {Scene} from "../types";

interface ReferenceButtonProps {
  currentSceneId: string;
  scenes: Scene[];
  fieldPath: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  isReferenced: boolean;
  referenceInfo?: {
    sourceSceneName: string;
    referencedAt: string;
  };
}

export default function ReferenceButton({
  currentSceneId,
  scenes,
  fieldPath,
  onReference,
  isReferenced,
  referenceInfo,
}: ReferenceButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // 現在のシーン以外のシーンを取得
  const availableScenes = scenes.filter((scene) => scene.id !== currentSceneId);

  const handleReference = (sourceSceneId: string) => {
    onReference(sourceSceneId, fieldPath);
    setShowDropdown(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.referenceContainer}>
      {isReferenced && referenceInfo && (
        <div className={styles.referenceInfo}>
          <span className={styles.referenceLabel}>引用元:</span>
          <span className={styles.referenceSource}>
            {referenceInfo.sourceSceneName}
          </span>
          <span className={styles.referenceDate}>
            {formatDate(referenceInfo.referencedAt)}
          </span>
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`${styles.referenceButton} ${
            isReferenced ? styles.referenced : ""
          }`}
          title={isReferenced ? "引用元を変更" : "他のシーンから引用"}
        >
          {isReferenced ? "引用変更" : "引用"}
        </button>

        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>引用元を選択</div>
            {availableScenes.length === 0 ? (
              <div className={styles.noScenes}>他のシーンがありません</div>
            ) : (
              availableScenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  className={styles.sceneOption}
                  onClick={() => handleReference(scene.id)}
                >
                  {scene.name}
                </button>
              ))
            )}
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowDropdown(false)}
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
