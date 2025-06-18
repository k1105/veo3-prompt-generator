import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {content, type} = await request.json();

    if (!content) {
      return NextResponse.json(
        {error: "翻訳するコンテンツが必要です"},
        {status: 400}
      );
    }

    // Gemini API キーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {error: "Gemini API キーが設定されていません"},
        {status: 500}
      );
    }

    let prompt = "";

    if (type === "yaml") {
      // YAML生成用の構造化翻訳
      prompt = `
以下の日本語の映画シーン記述を英語に翻訳してください。映画制作の専門用語を使用し、自然な英語で翻訳してください。

${content}

以下のJSON形式で回答してください：
{
  "title": "英語のタイトル",
  "synopsis": "英語のシノプシス",
  "visual": {
    "tone": "英語のトーン",
    "palette": "英語のパレット",
    "keyFX": "英語のキーFX",
    "camera": "英語のカメラワーク",
    "lighting": "英語の照明"
  },
  "aural": {
    "bgm": "英語のBGM",
    "sfx": "英語のSFX",
    "ambience": "英語の環境音"
  },
  "spatial": {
    "main": "英語のメイン",
    "foreground": "英語の前景",
    "midground": "英語の中景",
    "background": "英語の背景"
  },
  "time_axis": [
    {
      "action": "英語のアクション1"
    },
    {
      "action": "英語のアクション2"
    },
    {
      "action": "英語のアクション3"
    },
    {
      "action": "英語のアクション4"
    }
  ]
}
`;
    } else {
      // 一般的な翻訳
      prompt = `
以下の日本語の映画シーン記述を英語に翻訳してください。映画制作の専門用語を使用し、自然な英語で翻訳してください。

${content}

英語で回答してください。
`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        {error: "Gemini API からの応答が無効です"},
        {status: response.status}
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      return NextResponse.json(
        {error: "Gemini API からの応答形式が無効です"},
        {status: 500}
      );
    }

    const translatedText = data.candidates[0].content.parts[0].text;

    if (type === "yaml") {
      // JSONを抽出（```json と ``` で囲まれている場合）
      let jsonMatch = translatedText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        // JSONブロックがない場合は、テキスト全体をJSONとして解析
        jsonMatch = [null, translatedText];
      }

      try {
        const parsedData = JSON.parse(jsonMatch[1]);
        return NextResponse.json(parsedData);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return NextResponse.json(
          {error: "翻訳されたコンテンツの解析に失敗しました"},
          {status: 500}
        );
      }
    } else {
      return NextResponse.json({translated: translatedText});
    }
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      {error: "翻訳中にエラーが発生しました"},
      {status: 500}
    );
  }
}
