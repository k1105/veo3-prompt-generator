import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {field, currentValue, direction, context, customApiKey} =
      await request.json();

    if (!field || currentValue === undefined) {
      return NextResponse.json(
        {error: "フィールド名と現在の値が必要です"},
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

    // フィールドに応じたプロンプトを生成
    const fieldPrompts: {[key: string]: string} = {
      title: "映像シーンのタイトル",
      synopsis: "映像シーンの概要・シノプシス",
      "visual.tone": "映像のトーン・雰囲気",
      "visual.palette": "映像のカラーパレット",
      "visual.keyFX": "映像の主要なエフェクト",
      "visual.camera": "カメラワーク",
      "visual.lighting": "ライティング",
      "aural.bgm": "背景音楽",
      "aural.sfx": "効果音",
      "aural.ambience": "環境音・アンビエンス",
      "spatial_layout.main": "メインの空間レイアウト",
      "spatial_layout.foreground": "前景の空間レイアウト",
      "spatial_layout.midground": "中景の空間レイアウト",
      "spatial_layout.background": "背景の空間レイアウト",
      segmentAction: "タイムラインセグメントのアクション・動作",
    };

    const fieldDescription = fieldPrompts[field] || "映像シーンの要素";
    const directionText = direction ? `\n\n方向性の指示: ${direction}` : "";
    const contextText = context ? `\n\nコンテキスト: ${context}` : "";

    const prompt = `あなたは映像制作に特化したAIアシスタントです。以下の${fieldDescription}を、映像生成AIが解釈しやすく、より魅力的な映像を生成するためのテキストにブラッシュアップしてください。

現在の値: "${currentValue}"${directionText}${contextText}

以下の条件を満たしてください：
1. 映像生成AIが理解しやすい具体的で視覚的な表現を使用
2. 映像の質感、色合い、動き、感情を明確に表現
3. 現在の内容を活かしながら、より魅力的で印象的な表現に改善
4. 簡潔で分かりやすい文章にする
5. 映像制作の専門用語を適切に使用

改善されたテキストのみを返してください。JSON形式や説明は不要です。`;

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
            maxOutputTokens: 512,
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

    const updatedText = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({updatedValue: updatedText});
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {error: "サーバーエラーが発生しました"},
      {status: 500}
    );
  }
}
