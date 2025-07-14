"use client";

import {useState, useEffect} from "react";
import styles from "./ApiKeyModal.module.css";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onApiKeySet,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(false);

  // モーダルが開くたびに状態をリセット
  useEffect(() => {
    if (isOpen) {
      setApiKey("");
      setValidationMessage("");
      setIsValid(false);
      setIsValidating(false);
    }
  }, [isOpen]);

  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setValidationMessage("APIキーを入力してください");
      setIsValid(false);
      return;
    }

    // Gemini APIキーの基本的な形式チェック（AIzaで始まる）
    if (!key.startsWith("AIza")) {
      setValidationMessage("無効なGemini APIキー形式です");
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setValidationMessage("");

    try {
      // 実際のAPIキー検証（Gemini APIを使用）
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${key}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setValidationMessage("✅ Gemini APIキーが有効です");
        setIsValid(true);
      } else {
        setValidationMessage("❌ Gemini APIキーが無効です");
        setIsValid(false);
      }
    } catch {
      setValidationMessage("❌ Gemini APIキーの検証に失敗しました");
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSetApiKey = () => {
    if (isValid) {
      onApiKeySet(apiKey);
      onClose();
      setApiKey("");
      setValidationMessage("");
      setIsValid(false);
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setValidationMessage("");
    setIsValid(false);
  };

  const handleClose = () => {
    onClose();
    setApiKey("");
    setValidationMessage("");
    setIsValid(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>APIキー設定</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.inputGroup}>
            <label htmlFor="apiKey">Gemini APIキー</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="AIza..."
              className={styles.apiKeyInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <button
            className={styles.validateButton}
            onClick={() => validateApiKey(apiKey)}
            disabled={isValidating || !apiKey.trim()}
          >
            {isValidating ? "検証中..." : "検証"}
          </button>

          {validationMessage && (
            <div
              className={`${styles.message} ${
                isValid ? styles.success : styles.error
              }`}
            >
              {validationMessage}
            </div>
          )}

          <div className={styles.note}>
            <strong>注意事項:</strong>
            <ul>
              <li>入力されたAPIキーはシステムに保存されません</li>
              <li>ページをリロードすると設定はリセットされます</li>
              <li>
                APIキーはメモリ上でのみ保持され、セキュリティを重視しています
              </li>
              <li>使用量はGoogle Geminiの料金体系に従います</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.setButton}
              onClick={handleSetApiKey}
              disabled={!isValid}
            >
              セット
            </button>
            <button className={styles.cancelButton} onClick={handleClose}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
