"use client";

import styles from "../page.module.css";
import {FormData, LockState} from "../types";
import ChatInterface from "./ChatInterface";

type ChatContainerProps = {
  formData: FormData;
  lockState: LockState;
  onGenerate: (data: FormData) => void;
  apiKey?: string;
};

export default function ChatContainer({
  formData,
  onGenerate,
  apiKey,
}: Omit<ChatContainerProps, "lockState">) {
  return (
    <div className={styles.floatingGenerator}>
      {/* チャットインターフェース - 常に表示 */}
      <ChatInterface
        formData={formData}
        onUpdateFormData={(updater: (prev: FormData) => FormData) => {
          const updatedData = updater(formData);
          onGenerate(updatedData);
        }}
        apiKey={apiKey}
        onGenerateContent={async () => {
          // GenerateButtonのgenerateContent関数を呼び出す
          const generateButton = document.querySelector(
            "[data-generate-button]"
          ) as HTMLElement;
          if (generateButton) {
            generateButton.click();
          }
        }}
        onTranslate={async (content: string, type: string) => {
          try {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content,
                type,
                customApiKey: apiKey,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              onGenerate(data);
            }
          } catch (error) {
            console.error("Translation error:", error);
          }
        }}
        onGenerateImage={async (segmentId: string) => {
          // 画像生成機能は現在のセグメントに対して実行
          console.log("Generate image for segment:", segmentId);
        }}
      />
    </div>
  );
}
