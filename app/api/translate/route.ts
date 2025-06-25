import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {content, type, customApiKey} = await request.json();

    if (!content) {
      return NextResponse.json(
        {error: "翻訳するコンテンツが必要です"},
        {status: 400}
      );
    }

    // カスタムAPIキーまたは環境変数からAPIキーを取得
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {error: "API キーが設定されていません"},
        {status: 500}
      );
    }

    let prompt = "";

    if (type === "yaml") {
      // YAML生成用の構造化翻訳（最適化版）
      prompt = `
日本語を英語に翻訳してください。映画制作の専門用語を使用してください。

${content}

JSON形式で回答：
{
  "title": "英語タイトル",
  "synopsis": "英語シノプシス",
  "visual": {
    "tone": "英語トーン",
    "palette": "英語パレット",
    "keyFX": "英語キーFX",
    "camera": "英語カメラ",
    "lighting": "英語照明"
  },
  "aural": {
    "bgm": "英語BGM",
    "sfx": "英語SFX",
    "ambience": "英語環境音"
  },
  "spatial": {
    "main": "英語メイン",
    "foreground": "英語前景",
    "midground": "英語中景",
    "background": "英語背景"
  },
  "time_axis": [
    {"action": "英語アクション1"},
    {"action": "英語アクション2"},
    {"action": "英語アクション3"},
    {"action": "英語アクション4"}
  ]
}
`;
    } else {
      // 一般的な翻訳（最適化版）
      prompt = `
日本語を英語に翻訳してください。映画制作の専門用語を使用してください。

${content}
`;
    }

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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024, // トークン数を削減
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
      // JSONを安全に抽出・解析
      try {
        // 1. まず、```json ... ``` ブロックを探す
        let jsonMatch = translatedText.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
          // 2. ``` ... ``` ブロックを探す（json指定なし）
          jsonMatch = translatedText.match(/```\s*([\s\S]*?)\s*```/);
        }
        if (!jsonMatch) {
          // 3. { で始まり } で終わる部分を探す
          jsonMatch = translatedText.match(/\{[\s\S]*\}/);
        }
        if (!jsonMatch) {
          // 4. 最後の手段として、テキスト全体を試す
          jsonMatch = [null, translatedText];
        }

        // JSONテキストをクリーンアップ
        let jsonText = jsonMatch[1] || jsonMatch[0];
        jsonText = jsonText
          .trim()
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 制御文字を除去
          .replace(/[ ]{2,}/g, " ") // 複数のスペースを単一に
          .replace(/(?<="[^"]*)\n(?=[^"]*")/g, "\\n") // 文字列内の改行をエスケープ
          .replace(/(?<="[^"]*)\r(?=[^"]*")/g, "\\r")
          .replace(/(?<="[^"]*)\t(?=[^"]*")/g, "\\t");

        const parsedData = JSON.parse(jsonText);
        return NextResponse.json(parsedData);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Failed to parse translated text:", translatedText);

        // より安全なJSONクリーンアップを試行
        try {
          const saferJsonText = translatedText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            .replace(/\\n/g, " ")
            .replace(/\\r/g, " ")
            .replace(/\\t/g, " ")
            .replace(/\\\\/g, "\\")
            .replace(/\\"/g, '"')
            .replace(/[ ]{2,}/g, " ")
            .trim();

          const parsedData = JSON.parse(saferJsonText);
          return NextResponse.json(parsedData);
        } catch (secondParseError) {
          console.error("Second JSON parse error:", secondParseError);
          return NextResponse.json(
            {error: "翻訳されたコンテンツの解析に失敗しました"},
            {status: 500}
          );
        }
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
