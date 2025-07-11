"use client";

import {useState} from "react";
import styles from "../page.module.css";
import {FormData, LockState} from "../types";
import ChatInterface from "./ChatInterface";

type FloatingGeneratorProps = {
  formData: FormData;
  lockState: LockState;
  onGenerate: (data: FormData) => void;
  apiKey?: string;
};

export default function FloatingGenerator({
  formData,
  lockState,
  onGenerate,
  apiKey,
}: FloatingGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const generateContent = async () => {
    // ロックされていない項目があるかチェック
    const hasUnlockedFields =
      !lockState.title ||
      !lockState.concept ||
      !lockState.summary ||
      !lockState.visualStyle.style ||
      !lockState.visualStyle.palette ||
      !lockState.visualStyle.lighting ||
      !lockState.audioDesign.bgm ||
      !lockState.audioDesign.sfx ||
      !lockState.audioDesign.ambience ||
      !lockState.audioDesign.dialogue ||
      !lockState.audioDesign.voiceover ||
      !lockState.characters ||
      !lockState.setting.location ||
      !lockState.setting.timeOfDay ||
      !lockState.setting.weather ||
      !lockState.setting.backgroundElements ||
      !lockState.time_axis;

    if (!hasUnlockedFields) {
      setError(
        "すべての項目がロックされています。アンロックしてから再試行してください。"
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // ロックされた項目の情報を収集
      const lockedInfo = {
        title: lockState.title ? formData.title : null,
        concept: lockState.concept ? formData.concept : null,
        summary: lockState.summary ? formData.summary : null,
        visualStyle: {
          style: lockState.visualStyle.style
            ? formData.visualStyle.style
            : null,
          palette: lockState.visualStyle.palette
            ? formData.visualStyle.palette
            : null,
          lighting: lockState.visualStyle.lighting
            ? formData.visualStyle.lighting
            : null,
        },
        audioDesign: {
          bgm: lockState.audioDesign.bgm ? formData.audioDesign.bgm : null,
          sfx: lockState.audioDesign.sfx ? formData.audioDesign.sfx : null,
          ambience: lockState.audioDesign.ambience
            ? formData.audioDesign.ambience
            : null,
          dialogue: lockState.audioDesign.dialogue
            ? formData.audioDesign.dialogue
            : null,
          voiceover: lockState.audioDesign.voiceover
            ? formData.audioDesign.voiceover
            : null,
        },
        characters: lockState.characters ? formData.characters : null,
        setting: {
          location: lockState.setting.location
            ? formData.setting.location
            : null,
          timeOfDay: lockState.setting.timeOfDay
            ? formData.setting.timeOfDay
            : null,
          weather: lockState.setting.weather ? formData.setting.weather : null,
          backgroundElements: lockState.setting.backgroundElements
            ? formData.setting.backgroundElements
            : null,
        },
        time_axis: lockState.time_axis ? formData.time_axis : null,
      };

      const instructionText = instructions.trim()
        ? `\n\n特別な指示：${instructions}`
        : "";

      const prompt = `
ロックされていない項目のみを生成してください。ロックされた項目は変更せず、一貫性のある内容を生成してください。${instructionText}

現在の設定：
タイトル: ${lockedInfo.title || "未設定"}
コンセプト: ${lockedInfo.concept || "未設定"}
サマリー: ${lockedInfo.summary || "未設定"}

視覚スタイル: ${lockedInfo.visualStyle.style ? "設定済み" : "未設定"}
音響デザイン: ${lockedInfo.audioDesign.bgm ? "設定済み" : "未設定"}
キャラクター: ${lockedInfo.characters ? "設定済み" : "未設定"}
設定: ${lockedInfo.setting.location ? "設定済み" : "未設定"}
タイムライン: ${lockedInfo.time_axis ? "設定済み" : "未設定"}

以下のJSON形式で回答してください：

{
  "title": "${lockedInfo.title || "生成されたタイトル"}",
  "concept": "${lockedInfo.concept || "生成されたコンセプト"}",
  "summary": "${lockedInfo.summary || "生成されたサマリー"}",
  "visualStyle": {
    "style": "${lockedInfo.visualStyle.style || "生成されたスタイル"}",
    "palette": "${lockedInfo.visualStyle.palette || "生成されたパレット"}",
    "lighting": "${lockedInfo.visualStyle.lighting || "生成された照明"}",
  },
  "audioDesign": {
    "bgm": "${lockedInfo.audioDesign.bgm || "生成されたBGM"}",
    "sfx": "${lockedInfo.audioDesign.sfx || "生成された効果音"}",
    "ambience": "${lockedInfo.audioDesign.ambience || "生成された環境音"}",
    "dialogue": "${lockedInfo.audioDesign.dialogue || "生成された対話"}",
    "voiceover": "${
      lockedInfo.audioDesign.voiceover || "生成されたナレーション"
    }"
  },
  "characters": ${
    lockedInfo.characters
      ? JSON.stringify(lockedInfo.characters)
      : `[
    {"name": "生成されたキャラクター1", "description": "生成された説明1"},
    {"name": "生成されたキャラクター2", "description": "生成された説明2"}
  ]`
  },
  "setting": {
    "location": "${lockedInfo.setting.location || "生成された場所"}",
    "timeOfDay": "${lockedInfo.setting.timeOfDay || "生成された時間帯"}",
    "weather": "${lockedInfo.setting.weather || "生成された天気"}",
    "backgroundElements": "${
      lockedInfo.setting.backgroundElements || "生成された背景要素"
    }"
  },
  "time_axis": ${
    lockedInfo.time_axis
      ? JSON.stringify(lockedInfo.time_axis)
      : `[
    {"id": "1", "startTime": 0.0, "endTime": 2.0, "action": "生成されたアクション1", "camera": "生成されたカメラワーク1"},
    {"id": "2", "startTime": 2.0, "endTime": 4.0, "action": "生成されたアクション2", "camera": "生成されたカメラワーク2"},
    {"id": "3", "startTime": 4.0, "endTime": 6.0, "action": "生成されたアクション3", "camera": "生成されたカメラワーク3"},
    {"id": "4", "startTime": 6.0, "endTime": 8.0, "action": "生成されたアクション4", "camera": "生成されたカメラワーク4"}
  ]`
  }
}

重要：
1. 日本語で回答
2. ロックされた項目は変更しない
3. 映画制作の専門用語を使用
4. 一貫性のある内容を生成
`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          customApiKey: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("生成に失敗しました");
      }

      const data = await response.json();

      // デバッグ用：生成されたデータをコンソールに出力
      console.log("Generated data:", data);
      console.log("Lock state:", lockState);

      onGenerate(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "生成中にエラーが発生しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className={styles.floatingGenerator}>
        {showInstructions && (
          <div className={styles.floatingInstructions}>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="例：全体的に明るいトーンにして、ポップなプロットに書き換えて..."
              className={styles.instructionsTextarea}
              rows={3}
            />
            <div className={styles.instructionsButtons}>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className={styles.closeInstructionsButton}
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => setInstructions("")}
                className={styles.clearInstructionsButton}
              >
                クリア
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsChatMinimized(!isChatMinimized)}
          className={styles.chatToggleButton}
        >
          {isChatMinimized ? "💬" : "_"}
        </button>
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className={styles.toggleInstructionsButton}
        >
          {showInstructions ? "指示を隠す" : "指示を表示"}
        </button>
        <button
          type="button"
          onClick={generateContent}
          disabled={isGenerating}
          className={styles.floatingGenerateButton}
        >
          {isGenerating ? "生成中..." : "Fill / Update Fields"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {/* チャットインターフェース */}
      {!isChatMinimized && (
        <ChatInterface
          formData={formData}
          onUpdateFormData={(updater: (prev: FormData) => FormData) => {
            const updatedData = updater(formData);
            onGenerate(updatedData);
          }}
          apiKey={apiKey}
          onMinimize={() => setIsChatMinimized(true)}
          onGenerateContent={generateContent}
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
      )}
    </>
  );
}
