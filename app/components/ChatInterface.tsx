"use client";

import {useState, useRef, useEffect} from "react";
import {ChatMessage, FormData} from "../types";
import styles from "../page.module.css";

interface ChatInterfaceProps {
  formData: FormData;
  onUpdateFormData: (updater: (prev: FormData) => FormData) => void;
  apiKey?: string;
  onGenerateContent?: () => Promise<void>;
  onTranslate?: (content: string, type: string) => Promise<void>;
  onGenerateImage?: (segmentId: string) => Promise<void>;
}

export default function ChatInterface({
  formData,
  onUpdateFormData,
  apiKey,
  onGenerateContent,
  onTranslate,
  onGenerateImage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateNotification, setUpdateNotification] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // null値を空文字列に変換する関数
  const sanitizeFields = (updatedFields: Partial<FormData>) => {
    const sanitizeValue = (value: unknown): unknown => {
      if (value === null || value === undefined) {
        return "";
      }
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
        );
      }
      return value;
    };

    return sanitizeValue(updatedFields) as Partial<FormData>;
  };

  // JSONブロックを除去して自然な対話のみを抽出する関数
  const extractNaturalResponse = (text: string): string => {
    // ```json ... ``` ブロックを除去
    let cleanedText = text.replace(/```json\s*[\s\S]*?```/g, "");
    // ``` ... ``` ブロックを除去（json指定なし）
    cleanedText = cleanedText.replace(/```\s*[\s\S]*?```/g, "");
    // 前後の空白を除去
    cleanedText = cleanedText.trim();
    return cleanedText;
  };

  // time_axisの8秒制限をバリデーションする関数
  const validateTimeAxis = (
    timeAxis: unknown[]
  ): {
    id: string;
    startTime: number;
    endTime: number;
    action: string;
    camera: string;
  }[] => {
    if (!Array.isArray(timeAxis)) {
      console.warn("time_axis is not an array, returning empty array");
      return [];
    }

    const validatedTimeAxis = timeAxis.filter((segment) => {
      // 基本的な構造チェック
      if (!segment || typeof segment !== "object") {
        console.warn("Invalid segment structure:", segment);
        return false;
      }

      const {startTime, endTime, action, camera} = segment as {
        startTime: unknown;
        endTime: unknown;
        action: unknown;
        camera: unknown;
      };

      // 必須フィールドのチェック
      if (typeof startTime !== "number" || typeof endTime !== "number") {
        console.warn("Invalid time values:", {startTime, endTime});
        return false;
      }

      // 時間の妥当性チェック
      if (startTime < 0 || endTime > 8.0 || startTime >= endTime) {
        console.warn("Invalid time range:", {startTime, endTime});
        return false;
      }

      // アクションとカメラのチェック
      if (typeof action !== "string" || typeof camera !== "string") {
        console.warn("Invalid action or camera:", {action, camera});
        return false;
      }

      return true;
    }) as {
      id: string;
      startTime: number;
      endTime: number;
      action: string;
      camera: string;
    }[];

    // 合計時間が8秒を超える場合の調整
    const totalDuration = validatedTimeAxis.reduce((total, segment) => {
      return total + (segment.endTime - segment.startTime);
    }, 0);

    if (totalDuration > 8.0) {
      console.warn("Total duration exceeds 8 seconds:", totalDuration);

      // 各セグメントの時間を比例的に縮小
      const scaleFactor = 8.0 / totalDuration;
      let currentTime = 0.0;

      validatedTimeAxis.forEach((segment, index) => {
        const originalDuration = segment.endTime - segment.startTime;
        const newDuration = originalDuration * scaleFactor;

        segment.startTime = currentTime;
        segment.endTime = currentTime + newDuration;
        segment.id = (index + 1).toString();

        currentTime = segment.endTime;
      });

      console.log("Adjusted time_axis to fit 8 seconds:", validatedTimeAxis);
    }

    return validatedTimeAxis;
  };

  // 操作を実行する関数
  const executeAction = async (
    action: string,
    actionParams?: Record<string, unknown>
  ) => {
    try {
      switch (action) {
        case "update_fields":
          if (actionParams?.updatedFields) {
            const validatedFields = sanitizeFields(
              actionParams.updatedFields as Partial<FormData>
            );
            // 部分更新: 既存値を維持し、指定された項目のみ上書き
            onUpdateFormData((prev: FormData) => ({
              ...prev,
              ...validatedFields,
              visualStyle: {
                ...prev.visualStyle,
                ...(validatedFields.visualStyle || {}),
              },
              audioDesign: {
                ...prev.audioDesign,
                ...(validatedFields.audioDesign || {}),
              },
              setting: {
                ...prev.setting,
                ...(validatedFields.setting || {}),
              },
              characters: validatedFields.characters ?? prev.characters ?? [],
              time_axis: validateTimeAxis(
                validatedFields.time_axis ?? prev.time_axis ?? []
              ),
            }));
            const updatedFieldsList = Object.keys(validatedFields).join(", ");
            setUpdateNotification(`${updatedFieldsList}を更新しました`);
            setTimeout(() => setUpdateNotification(null), 3000);
          }
          break;

        case "generate_content":
          if (onGenerateContent) {
            await onGenerateContent();
            setUpdateNotification("コンテンツを生成しました");
            setTimeout(() => setUpdateNotification(null), 3000);
          }
          break;

        case "translate":
          if (onTranslate && actionParams?.content && actionParams?.type) {
            await onTranslate(
              actionParams.content as string,
              actionParams.type as string
            );
            setUpdateNotification("翻訳を実行しました");
            setTimeout(() => setUpdateNotification(null), 3000);
          }
          break;

        case "generate_image":
          if (onGenerateImage && actionParams?.segmentId) {
            await onGenerateImage(actionParams.segmentId as string);
            setUpdateNotification("画像を生成しました");
            setTimeout(() => setUpdateNotification(null), 3000);
          }
          break;

        case "none":
        default:
          // 操作不要
          break;
      }
    } catch (error) {
      console.error("Action execution error:", error);
      setError("操作の実行中にエラーが発生しました");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // ユーザーメッセージを追加
    addMessage({
      type: "user",
      content: userMessage,
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          formData,
          chatHistory: messages,
          customApiKey: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("チャットに失敗しました");
      }

      const data = await response.json();

      // アシスタントメッセージを追加
      addMessage({
        type: "assistant",
        content: extractNaturalResponse(data.message),
        metadata: {
          updatedFields: data.updatedFields,
          suggestions: data.suggestions,
        },
      });

      // 操作を実行
      if (data.action && data.action !== "none") {
        console.log(
          "Executing action:",
          data.action,
          "with params:",
          data.actionParams
        );
        try {
          await executeAction(data.action, data.actionParams);
        } catch (error) {
          console.error("Action execution failed:", error);
          setError(
            "操作の実行に失敗しました。プロパティ名が正しく指定されているか確認してください。"
          );
        }
      }

      // 従来の更新フィールド処理（後方互換性のため）
      if (data.updatedFields) {
        console.log("Processing updatedFields:", data.updatedFields);
        try {
          const validatedFields = sanitizeFields(data.updatedFields);
          // 部分更新: 既存値を維持し、指定された項目のみ上書き
          onUpdateFormData((prev: FormData) => ({
            ...prev,
            ...validatedFields,
            visualStyle: {
              ...prev.visualStyle,
              ...(validatedFields.visualStyle || {}),
            },
            audioDesign: {
              ...prev.audioDesign,
              ...(validatedFields.audioDesign || {}),
            },
            setting: {
              ...prev.setting,
              ...(validatedFields.setting || {}),
            },
            characters: validatedFields.characters ?? prev.characters ?? [],
            time_axis: validateTimeAxis(
              validatedFields.time_axis ?? prev.time_axis ?? []
            ),
          }));
          const updatedFieldsList = Object.keys(validatedFields).join(", ");
          setUpdateNotification(`${updatedFieldsList}を更新しました`);
          setTimeout(() => setUpdateNotification(null), 3000);
        } catch (error) {
          console.error("Field update failed:", error);
          setError(
            "フィールドの更新に失敗しました。プロパティ名が正しく指定されているか確認してください。"
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      addMessage({
        type: "assistant",
        content:
          "申し訳ございません。エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderButtons}>
          <button
            type="button"
            onClick={() => setMessages([])}
            className={styles.clearChatButton}
          >
            クリア
          </button>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <p>動画制作のプロンプト生成をお手伝いします。</p>
            <p>以下のような指示を送ってください：</p>
            <ul>
              <li>「タイトルをより魅力的に変更して」</li>
              <li>「視覚スタイルをより明るくして」</li>
              <li>「キャラクターを追加して」</li>
              <li>「全体的にポップなトーンに変更して」</li>
              <li>「BGMをエレガントなクラシックに変更して」</li>
              <li>「設定を都市の夜景に変更して」</li>
              <li>「未設定の項目を生成して」</li>
              <li>「このプロンプトを構造化データに変換して」</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.chatMessage} ${
              message.type === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.messageType}>
                {message.type === "user" ? "あなた" : "AI"}
              </span>
              <span className={styles.messageTime}>
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
            {message.metadata?.suggestions && (
              <div className={styles.suggestions}>
                <p>提案：</p>
                <div className={styles.suggestionButtons}>
                  {message.metadata.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setInputMessage(suggestion)}
                      className={styles.suggestionButton}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
            <div className={styles.messageHeader}>
              <span className={styles.messageType}>AI</span>
            </div>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        {updateNotification && (
          <div className={styles.updateNotification}>{updateNotification}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力してください..."
          className={styles.messageInput}
          rows={3}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className={styles.sendButton}
        >
          送信
        </button>
      </div>
    </div>
  );
}
