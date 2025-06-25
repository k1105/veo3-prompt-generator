import {NextRequest, NextResponse} from "next/server";
import {GoogleGenerativeAI} from "@google/generative-ai";

// Google Generative AIの型定義を拡張
declare module "@google/generative-ai" {
  interface GenerationConfig {
    responseModalities?: string[];
  }
}

export async function POST(request: NextRequest) {
  try {
    const {prompt, apiKey: customApiKey} = await request.json();

    // APIキーを取得（カスタムAPIキーまたは環境変数から）
    let apiKey = customApiKey;
    if (!apiKey || apiKey.trim() === "") {
      apiKey =
        process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error:
            "API key is required. Please set a custom API key or environment variable GEMINI_API_KEY.",
        },
        {status: 400}
      );
    }

    if (!prompt) {
      return NextResponse.json({error: "Prompt is required"}, {status: 400});
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // まず利用可能なモデルを確認
    console.log("Attempting to generate image with prompt:", prompt);

    // Gemini 2.0 Flash Preview Image Generation を使用（画像生成対応）
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
    });

    // responseModalitiesを明示的に設定して画像生成を有効にする
    const generateRequest = {
      contents: [
        {
          role: "user",
          parts: [{text: prompt}],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const result = await model.generateContent(generateRequest);
    const response = await result.response;

    // レスポンスの詳細をログに出力
    console.log("Full response structure:", JSON.stringify(response, null, 2));
    console.log("Candidates:", response.candidates);
    console.log("Parts:", response.candidates?.[0]?.content?.parts);

    // まずテキストレスポンスを確認
    const textResponse = response.text();
    console.log(
      "Text response received:",
      textResponse.substring(0, 100) + "..."
    );

    // 画像データを取得（利用可能な場合）
    const imageData = response.candidates?.[0]?.content?.parts?.find((part) =>
      part.inlineData?.mimeType?.startsWith("image/")
    )?.inlineData?.data;

    console.log("Image data found:", !!imageData);
    if (imageData) {
      console.log("Image data length:", imageData.length);
      return NextResponse.json({
        imageData: `data:image/png;base64,${imageData}`,
        message: "Image generated successfully",
      });
    } else {
      // 画像が生成されない場合は、テキスト説明を返す
      return NextResponse.json({
        imageData: null,
        textDescription: textResponse,
        message:
          "Image generation not available. Text description provided instead.",
      });
    }
  } catch (error) {
    console.error("Error generating image:", error);

    // より詳細なエラー情報を返す
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: `Failed to generate image: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
      },
      {status: 500}
    );
  }
}
