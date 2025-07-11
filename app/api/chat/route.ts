import {NextRequest, NextResponse} from "next/server";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {FormData, ChatMessage} from "../../types";

interface ChatRequest {
  message: string;
  formData: FormData;
  chatHistory: ChatMessage[];
  customApiKey?: string;
}

interface ChatResponse {
  message: string;
  updatedFields?: Partial<FormData>;
  suggestions?: string[];
  action?:
    | "update_fields"
    | "generate_content"
    | "convert_prompt"
    | "translate"
    | "generate_image"
    | "none";
  actionParams?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const {message, formData, chatHistory, customApiKey} = body;

    // APIキーの取得
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {error: "APIキーが設定されていません"},
        {status: 400}
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    // システムプロンプトの構築
    const systemPrompt = `
あなたは動画制作のプロンプト生成アシスタントです。
ユーザーの要求を分析し、以下の利用可能な操作から適切なものを選択してください：

**利用可能な操作：**

1. **update_fields** - FormDataの特定フィールドを更新
   - 対象フィールド（英語名で指定）：
     - title: タイトル（文字列）
     - concept: コンセプト（文字列）
     - summary: サマリー（文字列）
     - visualStyle: { style, palette, lighting }
     - audioDesign: { bgm, sfx, ambience, dialogue, voiceover }
     - characters: キャラクター配列
     - setting: { location, timeOfDay, weather, backgroundElements }
     - time_axis: タイムライン配列

2. **generate_content** - ロックされていない項目を一括生成
   - 現在のロック状態を考慮して未設定項目を生成

3. **translate** - 日本語コンテンツを英語に翻訳
   - YAML形式またはプロンプト形式の翻訳

4. **generate_image** - セグメントのプレビュー画像生成
   - 特定のセグメントの視覚的説明を生成

5. **none** - 操作不要（情報提供のみ）

**重要なルール：**
1. **ユーザーの要求を最優先で理解し、その要求に完全に従って内容を生成する**
2. 更新する場合は、変更するフィールドのみを含める
3. 配列形式のプロパティ（characters, time_axis）は正しい形式で更新する
4. 映画制作の専門用語を使用する
5. 一貫性のある内容を生成する
6. 日本語で回答する
7. **プロパティ名は必ず英語で指定する**
8. **ユーザーが具体的な映像の内容を指定した場合（例：「日本の夏の映像」）、その内容に完全に合わせて生成する**
9. **ユーザーが「このプロンプトを構造化データに変換して」と指示した場合、直接構造化データを生成し、update_fields操作を使用する**
10. **ユーザーが挨拶や雑談をした場合は、まず親しみやすく返答し、その後でやんわりと本題（動画制作の希望）を促してください**
11. **例：**
    - ユーザー: 「おはよう」
    - AI: 「おはようございます！今日はどんな動画を作りましょうか？」
    - ユーザー: 「こんにちは」
    - AI: 「こんにちは！何か作りたい映像のイメージがあれば教えてくださいね。」
    - ユーザー: 「調子どう？」
    - AI: 「ありがとうございます！今日はどんな映像を作りたいですか？」

**応答形式：**
自然な対話で応答し、操作が必要な場合は以下のJSONブロックを含める：

\`\`\`json
{
  "action": "update_fields",
  "updatedFields": {
    "title": "新しいタイトル",
    "visualStyle": {
      "style": "新しいスタイル"
    }
  },
  "suggestions": [
    "提案1",
    "提案2"
  ]
}
\`\`\`

**正しいJSON形式の例：**
- characters: [{"name": "キャラクター名", "description": "説明",
- time_axis: [{"id": "1", "startTime": 0.0, "endTime": 2.0, "action": "アクション", "camera": "カメラワーク"}] （配列形式）

**重要な制限事項：**
- time_axisの合計時間は必ず8秒以下にしてください
- 各セグメントの時間は0.0秒以上8.0秒以下にしてください
- セグメント間の時間は連続している必要があります（例：0.0-2.0, 2.0-4.0, 4.0-6.0, 6.0-8.0）
- 最後のセグメントのendTimeは必ず8.0以下にしてください

**注意：**
- プロパティ名は必ず英語で指定してください
- charactersは配列形式で指定してください
- time_axisは配列形式で指定してください
- 日本語のプロパティ名（役割、時間、シーンなど）は使用しないでください
- **映像の尺は必ず8秒以下にしてください**
- **ユーザーの要求を無視して別の内容を生成しないでください**
- **挨拶や雑談には親しみやすく返答し、その後で本題をやんわりと促してください**

操作が不要な場合は、JSONブロックを含めずに自然な対話のみで応答してください。
`;

    // 現在のFormData状態を文字列化
    const currentState = JSON.stringify(formData, null, 2);

    // チャット履歴を構築（最新の5件のみ）
    const recentHistory = chatHistory.slice(-5);
    const historyText =
      recentHistory.length > 0
        ? `\n\n最近の会話履歴：\n${recentHistory
            .map(
              (msg) =>
                `${msg.type === "user" ? "ユーザー" : "AI"}: ${msg.content}`
            )
            .join("\n")}`
        : "";

    // プロンプトを構築
    const prompt = `
${systemPrompt}

現在のFormData状態：
${currentState}${historyText}

ユーザーの要求：${message}

上記の要求を分析し、適切な操作を選択してください。
操作が必要な場合は、必ずJSONブロックを含めてください。
`;

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 応答からJSONを抽出
    let action: string | undefined;
    let updatedFields: Partial<FormData> | undefined;
    let suggestions: string[] | undefined;
    let actionParams: Record<string, unknown> | undefined;

    try {
      // JSONブロックを探す
      const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        action = jsonData.action;
        updatedFields = jsonData.updatedFields;
        suggestions = jsonData.suggestions;
        actionParams = jsonData.actionParams;
      }
    } catch (error) {
      console.warn("JSON解析エラー:", error);
    }

    const chatResponse: ChatResponse = {
      message: text,
      updatedFields,
      suggestions,
      action: action as
        | "update_fields"
        | "generate_content"
        | "convert_prompt"
        | "translate"
        | "generate_image"
        | "none",
      actionParams,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {error: "チャット処理中にエラーが発生しました"},
      {status: 500}
    );
  }
}
