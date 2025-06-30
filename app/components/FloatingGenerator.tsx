"use client";

import {useState} from "react";
import styles from "../page.module.css";
import {FormData, LockState, TONE_OPTIONS} from "../types";

type FloatingGeneratorProps = {
  formData: FormData;
  lockState: LockState;
  onGenerate: (data: Partial<FormData>) => void;
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

  const generateContent = async () => {
    // ロックされていない項目があるかチェック
    const hasUnlockedFields =
      !lockState.title ||
      !lockState.synopsis ||
      !lockState.visual_audio.visual.tone ||
      !lockState.visual_audio.visual.palette ||
      !lockState.visual_audio.visual.keyFX ||
      !lockState.visual_audio.visual.lighting ||
      !lockState.visual_audio.aural.bgm ||
      !lockState.visual_audio.aural.sfx ||
      !lockState.visual_audio.aural.ambience ||
      !lockState.spatial_layout.main ||
      !lockState.spatial_layout.foreground ||
      !lockState.spatial_layout.midground ||
      !lockState.spatial_layout.background ||
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
        synopsis: lockState.synopsis ? formData.synopsis : null,
        visual_audio: {
          visual: {
            tone: lockState.visual_audio.visual.tone
              ? formData.visual_audio.visual.tone
              : null,
            palette: lockState.visual_audio.visual.palette
              ? formData.visual_audio.visual.palette
              : null,
            keyFX: lockState.visual_audio.visual.keyFX
              ? formData.visual_audio.visual.keyFX
              : null,
            lighting: lockState.visual_audio.visual.lighting
              ? formData.visual_audio.visual.lighting
              : null,
          },
          aural: {
            bgm: lockState.visual_audio.aural.bgm
              ? formData.visual_audio.aural.bgm
              : null,
            sfx: lockState.visual_audio.aural.sfx
              ? formData.visual_audio.aural.sfx
              : null,
            ambience: lockState.visual_audio.aural.ambience
              ? formData.visual_audio.aural.ambience
              : null,
          },
        },
        spatial_layout: {
          main: lockState.spatial_layout.main
            ? formData.spatial_layout.main
            : null,
          foreground: lockState.spatial_layout.foreground
            ? formData.spatial_layout.foreground
            : null,
          midground: lockState.spatial_layout.midground
            ? formData.spatial_layout.midground
            : null,
          background: lockState.spatial_layout.background
            ? formData.spatial_layout.background
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
シノプシス: ${lockedInfo.synopsis || "未設定"}

視覚・音響: ${lockedInfo.visual_audio.visual.tone ? "設定済み" : "未設定"}
空間レイアウト: ${lockedInfo.spatial_layout.main ? "設定済み" : "未設定"}
タイムライン: ${lockedInfo.time_axis ? "設定済み" : "未設定"}

以下のJSON形式で回答してください：

{
  "title": "${lockedInfo.title || "生成されたタイトル"}",
  "synopsis": "${lockedInfo.synopsis || "生成されたシノプシス"}",
  "visual_audio": {
    "visual": {
      "tone": ${
        lockedInfo.visual_audio.visual.tone
          ? JSON.stringify(lockedInfo.visual_audio.visual.tone)
          : '["cinematic film of", "anime style"]'
      },
      "palette": "${
        lockedInfo.visual_audio.visual.palette || "生成されたパレット"
      }",
      "keyFX": "${
        lockedInfo.visual_audio.visual.keyFX || "生成された主要効果"
      }",
      "lighting": "${
        lockedInfo.visual_audio.visual.lighting || "生成された照明"
      }"
    },
    "aural": {
      "bgm": "${lockedInfo.visual_audio.aural.bgm || "生成されたBGM"}",
      "sfx": "${lockedInfo.visual_audio.aural.sfx || "生成された効果音"}",
      "ambience": "${
        lockedInfo.visual_audio.aural.ambience || "生成された環境音"
      }"
    }
  },
  "spatial_layout": {
    "main": "${lockedInfo.spatial_layout.main || "生成されたメイン被写体"}",
    "foreground": "${lockedInfo.spatial_layout.foreground || "生成された前景"}",
    "midground": "${lockedInfo.spatial_layout.midground || "生成された中景"}",
    "background": "${lockedInfo.spatial_layout.background || "生成された背景"}"
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

      // toneフィールドの検証とフィルタリング
      if (
        data.visual_audio &&
        data.visual_audio.visual &&
        data.visual_audio.visual.tone
      ) {
        const validToneValues = TONE_OPTIONS.map((option) => option.value);
        const originalTone = data.visual_audio.visual.tone;

        // 配列でない場合は配列に変換
        const toneArray = Array.isArray(originalTone)
          ? originalTone
          : [originalTone];

        // 有効な値のみをフィルタリング
        const filteredTone = toneArray.filter((tone) =>
          validToneValues.includes(tone)
        );

        // フィルタリングされたデータで更新
        data.visual_audio.visual.tone = filteredTone;

        // 無効な値があった場合はコンソールに警告
        if (filteredTone.length !== toneArray.length) {
          console.warn(
            "Invalid tone values filtered out:",
            toneArray.filter((tone) => !validToneValues.includes(tone))
          );
        }
      }

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
  );
}
