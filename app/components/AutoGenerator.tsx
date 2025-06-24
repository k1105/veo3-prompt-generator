"use client";

import {useState} from "react";
import styles from "../page.module.css";
import {SpatialLayout, TimeSegment, TONE_OPTIONS} from "../types";

type AutoGeneratorProps = {
  title: string;
  synopsis: string;
  onGenerate: (data: {
    visual_audio: {
      visual: {
        tone: string[];
        palette: string;
        keyFX: string;
        camera: string;
        lighting: string;
      };
      aural: {
        bgm: string;
        sfx: string;
        ambience: string;
      };
    };
    spatial_layout: SpatialLayout;
    time_axis: TimeSegment[];
  }) => void;
};

export default function AutoGenerator({
  title,
  synopsis,
  onGenerate,
}: AutoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async () => {
    if (!title.trim() && !synopsis.trim()) {
      setError("タイトルまたはシノプシスを入力してください");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const availableTones = TONE_OPTIONS.map(
        (option) => `"${option.value}"`
      ).join(", ");

      const prompt = `
以下の映画シーンの基本情報を基に、視覚・音響と空間レイアウトの詳細を生成してください。また、8秒間を4つのセグメントに分けたタイムラインも作成してください。
**Try to think of the most creative, impressive and delightful prompts. Think about scenes which are satisfying to watch.**

タイトル: ${title || "未設定"}
シノプシス: ${synopsis || "未設定"}

以下の形式でJSONで回答してください：

{
  "visual_audio": {
    "visual": {
      "tone": ["選択されたトーンの配列（以下の値から1-3個選択）"],
      "palette": "カラーパレット（例：インディゴ、オブシディアン、ネオンティール、シルバー）",
      "keyFX": "主要な視覚効果（例：プラズマ書道グリフ）",
      "camera": "カメラワーク（例：スローピューシュイン → ウィップパン）",
      "lighting": "照明（例：ランタンリムライト、グラウンドフォグ）"
    },
    "aural": {
      "bgm": "背景音楽（例：ハイブリッド太鼓 × サブベースグルーヴ、100 BPM）",
      "sfx": "効果音（例：羊皮紙のひらめき、刀の抜刀音）",
      "ambience": "環境音（例：遠くのセミの声、涼しい夜の空気）"
    }
  },
  "spatial_layout": {
    "main": "メイン被写体の詳細な説明",
    "foreground": "前景の要素",
    "midground": "中景の要素",
    "background": "背景の要素"
  },
  "time_axis": [
    {
      "id": "1",
      "startTime": 0.0,
      "endTime": 2.0,
      "action": "この時間帯の詳細なアクション説明"
    },
    {
      "id": "2",
      "startTime": 2.0,
      "endTime": 4.0,
      "action": "この時間帯の詳細なアクション説明"
    },
    {
      "id": "3",
      "startTime": 4.0,
      "endTime": 6.0,
      "action": "この時間帯の詳細なアクション説明"
    },
    {
      "id": "4",
      "startTime": 6.0,
      "endTime": 8.0,
      "action": "この時間帯の詳細なアクション説明"
    }
  ]
}

重要：
1. toneフィールドには以下の値から1-3個を選択して配列として指定してください。これらの値以外は使用しないでください：
[${availableTones}]

2. すべてのフィールド（palette、keyFX、camera、lighting、bgm、sfx、ambience、spatial_layout、time_axis）で日本語を使用してください。英語は使用しないでください。

3. 映画制作の専門的な用語を使用し、タイムラインのセグメントは論理的に流れるようにし、8秒間全体をカバーするようにしてください。
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
    <div className={styles.autoGenerator}>
      <button
        type="button"
        onClick={generateContent}
        disabled={isGenerating}
        className={styles.generateButton}
      >
        {isGenerating ? "生成中..." : "Generate"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
