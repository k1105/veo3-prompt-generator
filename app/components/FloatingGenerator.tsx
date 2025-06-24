"use client";

import {useState} from "react";
import styles from "../page.module.css";
import {FormData, LockState, TONE_OPTIONS} from "../types";

type FloatingGeneratorProps = {
  formData: FormData;
  lockState: LockState;
  onGenerate: (data: Partial<FormData>) => void;
};

export default function FloatingGenerator({
  formData,
  lockState,
  onGenerate,
}: FloatingGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async () => {
    // ロックされていない項目があるかチェック
    const hasUnlockedFields =
      !lockState.title ||
      !lockState.synopsis ||
      !lockState.visual_audio.visual.tone ||
      !lockState.visual_audio.visual.palette ||
      !lockState.visual_audio.visual.keyFX ||
      !lockState.visual_audio.visual.camera ||
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
      const availableTones = TONE_OPTIONS.map(
        (option) => `"${option.value}"`
      ).join(", ");

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
            camera: lockState.visual_audio.visual.camera
              ? formData.visual_audio.visual.camera
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

      const prompt = `
以下の映画シーンの情報を基に、ロックされていない項目のみを生成してください。ロックされた項目は変更せず、それらの情報を踏まえてアンロックされた項目を補完してください。
**Try to think of the most creative, impressive and delightful prompts. Think about scenes which are satisfying to watch.**

## 現在の設定（ロックされた項目）：
タイトル: ${lockedInfo.title || "未設定"}
シノプシス: ${lockedInfo.synopsis || "未設定"}

視覚・音響設定:
- トーン: ${
        lockedInfo.visual_audio.visual.tone
          ? JSON.stringify(lockedInfo.visual_audio.visual.tone)
          : "未設定"
      }
- パレット: ${lockedInfo.visual_audio.visual.palette || "未設定"}
- 主要効果: ${lockedInfo.visual_audio.visual.keyFX || "未設定"}
- カメラ: ${lockedInfo.visual_audio.visual.camera || "未設定"}
- 照明: ${lockedInfo.visual_audio.visual.lighting || "未設定"}
- BGM: ${lockedInfo.visual_audio.aural.bgm || "未設定"}
- 効果音: ${lockedInfo.visual_audio.aural.sfx || "未設定"}
- 環境音: ${lockedInfo.visual_audio.aural.ambience || "未設定"}

空間レイアウト:
- メイン: ${lockedInfo.spatial_layout.main || "未設定"}
- 前景: ${lockedInfo.spatial_layout.foreground || "未設定"}
- 中景: ${lockedInfo.spatial_layout.midground || "未設定"}
- 背景: ${lockedInfo.spatial_layout.background || "未設定"}

タイムライン: ${lockedInfo.time_axis ? "設定済み" : "未設定"}

以下の形式でJSONで回答してください。ロックされた項目は既存の値をそのまま使用し、アンロックされた項目のみを生成してください：

{
  "title": "${lockedInfo.title || "生成されたタイトル"}",
  "synopsis": "${lockedInfo.synopsis || "生成されたシノプシス"}",
  "visual_audio": {
    "visual": {
      "tone": ${
        lockedInfo.visual_audio.visual.tone
          ? JSON.stringify(lockedInfo.visual_audio.visual.tone)
          : '["生成されたトーン"]'
      },
      "palette": "${
        lockedInfo.visual_audio.visual.palette || "生成されたパレット"
      }",
      "keyFX": "${
        lockedInfo.visual_audio.visual.keyFX || "生成された主要効果"
      }",
      "camera": "${
        lockedInfo.visual_audio.visual.camera || "生成されたカメラワーク"
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
    {
      "id": "1",
      "startTime": 0.0,
      "endTime": 2.0,
      "action": "生成されたアクション1"
    },
    {
      "id": "2",
      "startTime": 2.0,
      "endTime": 4.0,
      "action": "生成されたアクション2"
    },
    {
      "id": "3",
      "startTime": 4.0,
      "endTime": 6.0,
      "action": "生成されたアクション3"
    },
    {
      "id": "4",
      "startTime": 6.0,
      "endTime": 8.0,
      "action": "生成されたアクション4"
    }
  ]`
  }
}

重要：
1. toneフィールドには以下の値から1-3個を選択して配列として指定してください。これらの値以外は使用しないでください：
[${availableTones}]

2. すべてのフィールドで日本語を使用してください。英語は使用しないでください。

3. ロックされた項目の値は変更せず、そのまま使用してください。

4. アンロックされた項目は、ロックされた項目の情報を踏まえて一貫性のある内容を生成してください。

5. 映画制作の専門的な用語を使用し、タイムラインのセグメントは論理的に流れるようにし、8秒間全体をカバーするようにしてください。

6. タイトルとシノプシスがアンロックされている場合は、シノプシスの内容に基づいて適切なタイトルを生成してください。
`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({prompt}),
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
      <button
        type="button"
        onClick={generateContent}
        disabled={isGenerating}
        className={styles.floatingGenerateButton}
      >
        {isGenerating ? "生成中..." : "Fill Unlocked Fields"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
