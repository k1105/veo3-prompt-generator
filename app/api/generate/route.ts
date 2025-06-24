import {NextRequest, NextResponse} from "next/server";

// JSONを安全に抽出・解析する関数
function extractAndParseJSON(text: string) {
  console.log("Original generated text:", text);

  // 1. まず、```json ... ``` ブロックを探す
  let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    console.log("Found JSON block");
    return cleanAndParseJSON(jsonMatch[1]);
  }

  // 2. ``` ... ``` ブロックを探す（json指定なし）
  jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    console.log("Found code block");
    return cleanAndParseJSON(jsonMatch[1]);
  }

  // 3. { で始まり } で終わる部分を探す
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    console.log("Found JSON-like content");
    return cleanAndParseJSON(braceMatch[0]);
  }

  // 4. 最後の手段として、テキスト全体を試す
  console.log("Trying entire text");
  return cleanAndParseJSON(text);
}

function cleanAndParseJSON(jsonText: string) {
  console.log("Raw JSON text:", jsonText);

  // 基本的なクリーンアップ
  const cleaned = jsonText
    .trim()
    // 制御文字を除去（文字列内は保持）
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    // 複数のスペースを単一に
    .replace(/[ ]{2,}/g, " ")
    // 文字列内の改行をエスケープ
    .replace(/(?<="[^"]*)\n(?=[^"]*")/g, "\\n")
    .replace(/(?<="[^"]*)\r(?=[^"]*")/g, "\\r")
    .replace(/(?<="[^"]*)\t(?=[^"]*")/g, "\\t");

  console.log("Cleaned JSON text:", cleaned);

  try {
    const parsed = JSON.parse(cleaned);
    console.log("Successfully parsed JSON");
    return parsed;
  } catch (error) {
    console.error("First parse attempt failed:", error);

    // より積極的なクリーンアップ
    const safer = cleaned
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, '"')
      .replace(/[ ]{2,}/g, " ")
      .trim();

    console.log("Safer JSON text:", safer);

    try {
      const parsed = JSON.parse(safer);
      console.log("Successfully parsed JSON with safer cleanup");
      return parsed;
    } catch (secondError) {
      console.error("Second parse attempt failed:", secondError);
      throw new Error(
        `JSON parsing failed: ${
          secondError instanceof Error ? secondError.message : "Unknown error"
        }`
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const {prompt} = await request.json();

    if (!prompt) {
      return NextResponse.json({error: "プロンプトが必要です"}, {status: 400});
    }

    // Gemini API キーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {error: "Gemini API キーが設定されていません"},
        {status: 500}
      );
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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

    const generatedText = data.candidates[0].content.parts[0].text;

    const parsedData = extractAndParseJSON(generatedText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("API error:", error);

    // JSON解析エラーの場合は特別なメッセージを返す
    if (
      error instanceof Error &&
      error.message.includes("JSON parsing failed")
    ) {
      return NextResponse.json(
        {
          error:
            "生成されたコンテンツの解析に失敗しました。AIの応答形式に問題がある可能性があります。",
        },
        {status: 500}
      );
    }

    return NextResponse.json(
      {error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
