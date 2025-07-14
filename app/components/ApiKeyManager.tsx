"use client";

import {Icon} from "@iconify/react";
import styles from "./ApiKeyManager.module.css";

interface ApiKeyManagerProps {
  onOpen: () => void;
  currentApiKey?: string;
}

export default function ApiKeyManager({
  onOpen,
  currentApiKey,
}: ApiKeyManagerProps) {
  return (
    <button
      className={styles.settingsButton}
      onClick={onOpen}
      data-has-key={!!currentApiKey}
      title={currentApiKey ? "APIキー変更" : "APIキー設定"}
    >
      <Icon icon="mdi:cog" />
    </button>
  );
}
