import {NextRequest, NextResponse} from "next/server";

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
            temperature: 0.7,
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

    const generatedText = data.candidates[0].content.parts[0].text;

    // JSONを抽出（```json と ``` で囲まれている場合）
    let jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // JSONブロックがない場合は、テキスト全体をJSONとして解析
      jsonMatch = [null, generatedText];
    }

    try {
      const parsedData = JSON.parse(jsonMatch[1]);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        {error: "生成されたコンテンツの解析に失敗しました"},
        {status: 500}
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
