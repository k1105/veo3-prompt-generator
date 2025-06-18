"use client";

import {useState} from "react";
import styles from "../page.module.css";

type AutoGeneratorProps = {
  title: string;
  synopsis: string;
  onGenerate: (data: {
    visual_audio: {
      visual: {
        tone: string;
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
    spatial_layout: {
      main: string;
      foreground: string;
      midground: string;
      background: string;
    };
    time_axis: Array<{
      id: string;
      startTime: number;
      endTime: number;
      action: string;
    }>;
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
      const prompt = `
以下の映画シーンの基本情報を基に、視覚・音響と空間レイアウトの詳細を生成してください。また、8秒間を4つのセグメントに分けたタイムラインも作成してください。

タイトル: ${title || "未設定"}
シノプシス: ${synopsis || "未設定"}

以下の形式でJSONで回答してください：

{
  "visual_audio": {
    "visual": {
      "tone": "視覚的なトーン（例：neo-feudal cool）",
      "palette": "カラーパレット（例：indigo, obsidian, neon-turquoise, silver）",
      "keyFX": "主要な視覚効果（例：plasma calligraphy glyphs）",
      "camera": "カメラワーク（例：slow push-in → whip-pan）",
      "lighting": "照明（例：lantern rim-lights, ground fog）"
    },
    "aural": {
      "bgm": "背景音楽（例：hybrid taiko × sub-bass groove, 100 BPM）",
      "sfx": "効果音（例：parchment flutter, sword draw）",
      "ambience": "環境音（例：distant cicadas, cool night air）"
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

日本語で回答し、映画制作の専門的な用語を使用してください。タイムラインのセグメントは論理的に流れるようにし、8秒間全体をカバーするようにしてください。
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
