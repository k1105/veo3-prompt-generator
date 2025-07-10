import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {prompt, customApiKey} = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {error: "プロンプトが提供されていません"},
        {status: 400}
      );
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {error: "APIキーが設定されていません"},
        {status: 500}
      );
    }

    const conversionPrompt = `
以下の自由記述形式のプロンプトを、映画制作用の構造化されたフォーマットに変換してください。

入力プロンプト：
${prompt}

以下のJSON形式で回答してください：

{
  "title": "映画のタイトル",
  "concept": "映画のコンセプト・テーマ",
  "summary": "映画の概要・ストーリー",
  "visualStyle": {
    "style": "視覚スタイルの説明",

    "palette": "色調・パレットの説明",
    "lighting": "照明の説明",
    "cameraStyle": "カメラスタイルの説明"
  },
  "audioDesign": {
    "bgm": "BGMの説明",
    "sfx": "効果音の説明",
    "ambience": "環境音の説明",
    "dialogue": "対話・セリフの説明",
    "voiceover": "ナレーションの説明"
  },
  "characters": [
    {
      "name": "キャラクター名",
      "description": "キャラクターの説明",
      "performanceNote": "演技ノート"
    }
  ],
  "setting": {
    "location": "場所の説明",
    "timeOfDay": "時間帯の説明",
    "weather": "天気の説明",
    "backgroundElements": "背景要素の説明"
  },
  "time_axis": [
    {
      "id": "1",
      "startTime": 0.0,
      "endTime": 2.0,
      "action": "アクションの説明",
      "camera": "カメラワークの説明"
    },
    {
      "id": "2",
      "startTime": 2.0,
      "endTime": 4.0,
      "action": "アクションの説明",
      "camera": "カメラワークの説明"
    },
    {
      "id": "3",
      "startTime": 4.0,
      "endTime": 6.0,
      "action": "アクションの説明",
      "camera": "カメラワークの説明"
    },
    {
      "id": "4",
      "startTime": 6.0,
      "endTime": 8.0,
      "action": "アクションの説明",
      "camera": "カメラワークの説明"
    }
  ]
}

重要：
1. 日本語で回答
2. 映画制作の専門用語を使用
3. 入力プロンプトの内容を適切に各項目に振り分ける
4. タイムラインは8秒間の4セグメントに分割
5. 視覚・音響、空間レイアウト、タイムラインの一貫性を保つ
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: conversionPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    // JSONの抽出
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("有効なJSONが見つかりませんでした");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Convert prompt error:", error);
    return NextResponse.json(
      {error: "プロンプト変換中にエラーが発生しました"},
      {status: 500}
    );
  }
}
