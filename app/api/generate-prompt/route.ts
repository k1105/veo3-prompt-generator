import {NextRequest, NextResponse} from "next/server";
import {FormData, TimeSegment} from "../../types";

const BEST_PRACTICES_PROMPT = `
Below are the ## best practices for prompts for the video generation AI "Veo 3". Output the English prompt and Japanese translation for an 8-second video based on the ## given conditions.

## Given Conditions

- <input_data>

## Best Practices

- Layer your prompts: Start with the core action, then add technical specifications, style, and audio elements

- Be specific about timing: Use phrases like "gradual," "sudden," or "rhythmic" to control pacing

- Combine technical and creative language: Mix cinematography terms with evocative descriptions

- Consider cause and effect: Describe how actions influence the environment

- prompt example

<prompt: macro lens revealing a spider weaving its web at sunrise, each silk strand vibrating with tiny water droplets, soft focus on background garden>

### Crafting Cinematic Prompts

- Lens and Focus Techniques

- Control depth and visual impact through precise lens specifications:

- Focus styles: rack focus, tilt-shift, bokeh effects, split diopter

- Lens types: fisheye, telephoto compression, anamorphic flares

- prompt example

handheld camera following a cat through tall grass at ground level, sudden zoom when it spots a butterfly

### Shot Composition

- Define your frame with specific compositional elements:

- Framing: extreme close-up, establishing shot, insert shot, cutaway

- Subject arrangement: rule of thirds, leading lines, negative space

- prompt example

extreme close-up of raindrops racing down a car window, city lights creating abstract bokeh patterns in the background

### Genre and Style Direction

- Dialogue and Character Interaction

- When incorporating speech, be specific about tone, pacing, and context. The model can handle complex conversational dynamics with natural voice-overs and lip-sync.

- prompt example

two robots in a repair shop arguing about the meaning of existence while one tries to fix the other's loose arm joint

### Multi-Sensory Scenes

- Leverage Veo3's audio capabilities by describing sounds that enhance the visual narrative.

- prompt example

time-lapse of a busy farmers market from dawn to dusk, sounds transitioning from morning bird songs to afternoon crowd chatter to evening cleanup

## Output Format

Please provide ONLY the English prompt and Japanese translation in the following format:

**English Prompt:** [Your English prompt here]

**Japanese Translation:** [Your Japanese translation here]

Do not include any explanations, justifications, or additional commentary.`;

const formatDataForGemini = (data: FormData): string => {
  const yamlData = {
    title: data.title || "",
    summary: data.summary || "",
    visualStyle: {
      style: data.visualStyle?.style || "",
      palette: data.visualStyle?.palette || "",
      lighting: data.visualStyle?.lighting || "",
      cameraStyle: data.visualStyle?.cameraStyle || "",
    },
    audioDesign: {
      bgm: data.audioDesign?.bgm || "",
      sfx: data.audioDesign?.sfx || "",
      ambience: data.audioDesign?.ambience || "",
      dialogue: data.audioDesign?.dialogue || "",
      voiceover: data.audioDesign?.voiceover || "",
    },
    setting: {
      location: data.setting?.location || "",
      timeOfDay: data.setting?.timeOfDay || "",
      weather: data.setting?.weather || "",
      backgroundElements: data.setting?.backgroundElements || "",
    },
    time_axis: (data.time_axis || []).map((segment: TimeSegment) => ({
      action: segment.action,
      camera: segment.camera,
    })),
  };

  return JSON.stringify(yamlData, null, 2);
};

const extractPromptFromGeminiResponse = (
  response: string
): {english: string; japanese: string} => {
  // <prompt: ...> 形式を探す
  const promptMatch = response.match(/<prompt:\s*([^>]+)>/i);
  if (promptMatch) {
    return {
      english: promptMatch[1].trim(),
      japanese: "",
    };
  }

  // **English Prompt:** と **Japanese Translation:** の形式を探す
  const englishMatch = response.match(
    /\*\*English Prompt:\*\*\s*([\s\S]*?)(?=\*\*Japanese Translation:\*\*|$)/
  );
  const japaneseMatch = response.match(
    /\*\*Japanese Translation:\*\*\s*([\s\S]*?)(?=\*\*|$)/
  );

  if (englishMatch) {
    const english = englishMatch[1].trim();
    const japanese = japaneseMatch ? japaneseMatch[1].trim() : "";
    return {english, japanese};
  }

  // フォールバック: 行ごとの解析
  const lines = response.split("\n");
  const englishLines = [];
  const japaneseLines = [];
  let foundEnglish = false;
  let foundJapanese = false;
  let inJapaneseSection = false;
  let inExplanationSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 説明セクションの開始を検出
    if (
      trimmedLine.includes("Explanation of Choices") ||
      trimmedLine.includes("Justification") ||
      trimmedLine.includes("**Explanation") ||
      trimmedLine.includes("*   **")
    ) {
      inExplanationSection = true;
      break; // 説明セクションが始まったら処理を停止
    }

    // 日本語の特徴的な文字が含まれているかチェック
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmedLine)) {
      inJapaneseSection = true;
      foundJapanese = true;
    }

    // 英語の行を収集（日本語セクションに入る前、かつ説明セクションに入る前）
    if (
      !inJapaneseSection &&
      !inExplanationSection &&
      trimmedLine.length > 0 &&
      !trimmedLine.startsWith("#") &&
      !trimmedLine.startsWith("##") &&
      !trimmedLine.startsWith("**English Prompt:**") &&
      !trimmedLine.startsWith("**Japanese Translation:**")
    ) {
      englishLines.push(trimmedLine);
      foundEnglish = true;
    }

    // 日本語の行を収集（説明セクションに入る前）
    if (
      inJapaneseSection &&
      !inExplanationSection &&
      trimmedLine.length > 0 &&
      !trimmedLine.startsWith("#") &&
      !trimmedLine.startsWith("##") &&
      !trimmedLine.startsWith("**English Prompt:**") &&
      !trimmedLine.startsWith("**Japanese Translation:**")
    ) {
      japaneseLines.push(trimmedLine);
    }
  }

  const english =
    foundEnglish && englishLines.length > 0 ? englishLines.join(" ") : "";
  const japanese =
    foundJapanese && japaneseLines.length > 0 ? japaneseLines.join(" ") : "";

  return {english, japanese};
};

export async function POST(request: NextRequest) {
  try {
    const {data, apiKey: customApiKey} = await request.json();

    if (!data) {
      return NextResponse.json({error: "データが必要です"}, {status: 400});
    }

    // APIキーを取得（カスタムAPIキーまたは環境変数から）
    let apiKey = customApiKey;
    if (!apiKey || apiKey.trim() === "") {
      apiKey =
        process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json(
        {error: "Gemini API キーが設定されていません"},
        {status: 500}
      );
    }

    // 翻訳用のコンテンツを準備
    const contentToTranslate = {
      title: data.title || "",
      summary: data.summary || "",
      visual: {
        palette: data.visualStyle?.palette || "",
        style: data.visualStyle?.style || "",
        lighting: data.visualStyle?.lighting || "",
        cameraStyle: data.visualStyle?.cameraStyle || "",
      },
      aural: {
        bgm: data.audioDesign?.bgm || "",
        sfx: data.audioDesign?.sfx || "",
        ambience: data.audioDesign?.ambience || "",
        dialogue: data.audioDesign?.dialogue || "",
        voiceover: data.audioDesign?.voiceover || "",
      },
      setting: {
        location: data.setting?.location || "",
        timeOfDay: data.setting?.timeOfDay || "",
        weather: data.setting?.weather || "",
        backgroundElements: data.setting?.backgroundElements || "",
      },
      time_axis: (data.time_axis || []).map((segment: TimeSegment) => ({
        action: segment.action,
        camera: segment.camera,
      })),
    };

    // 翻訳処理
    const attemptTranslation = async (retryCount = 0) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const translateResponse = await fetch(
          `${request.nextUrl.origin}/api/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: JSON.stringify(contentToTranslate, null, 2),
              type: "prompt",
              customApiKey: apiKey,
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!translateResponse.ok) {
          if (
            translateResponse.status === 429 ||
            translateResponse.status === 503
          ) {
            if (retryCount < 3) {
              console.log(
                `Rate limit hit, retrying in ${(retryCount + 1) * 2} seconds...`
              );
              await new Promise((resolve) =>
                setTimeout(resolve, (retryCount + 1) * 2000)
              );
              return attemptTranslation(retryCount + 1);
            }
          }
          throw new Error(`翻訳に失敗しました: ${translateResponse.status}`);
        }

        return await translateResponse.json();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          if (retryCount < 2) {
            console.log(`Timeout, retrying... (attempt ${retryCount + 1})`);
            return attemptTranslation(retryCount + 1);
          }
        }
        throw error;
      }
    };

    const translatedData = await attemptTranslation();

    // 翻訳されたデータでYAMLを構築
    const translatedFormData = {
      ...data,
      title: translatedData.title || data.title,
      summary: translatedData.summary || data.summary,
      visualStyle: {
        ...data.visualStyle,
        style: translatedData.visual?.style || data.visualStyle?.style || "",
        palette:
          translatedData.visual?.palette || data.visualStyle?.palette || "",
        lighting:
          translatedData.visual?.lighting || data.visualStyle?.lighting || "",
        cameraStyle:
          translatedData.visual?.cameraStyle ||
          data.visualStyle?.cameraStyle ||
          "",
      },
      audioDesign: {
        ...data.audioDesign,
        bgm: translatedData.aural?.bgm || data.audioDesign?.bgm || "",
        sfx: translatedData.aural?.sfx || data.audioDesign?.sfx || "",
        ambience:
          translatedData.aural?.ambience || data.audioDesign?.ambience || "",
        dialogue:
          translatedData.aural?.dialogue || data.audioDesign?.dialogue || "",
        voiceover:
          translatedData.aural?.voiceover || data.audioDesign?.voiceover || "",
      },
      setting: {
        ...data.setting,
        location:
          translatedData.setting?.location || data.setting?.location || "",
        timeOfDay:
          translatedData.setting?.timeOfDay || data.setting?.timeOfDay || "",
        weather: translatedData.setting?.weather || data.setting?.weather || "",
        backgroundElements:
          translatedData.setting?.backgroundElements ||
          data.setting?.backgroundElements ||
          "",
      },
      time_axis: (data.time_axis || []).map(
        (segment: TimeSegment, index: number) => ({
          ...segment,
          action: translatedData.time_axis?.[index]?.action || segment.action,
          camera: translatedData.time_axis?.[index]?.camera || segment.camera,
        })
      ),
    };

    // Geminiにベストプラクティスプロンプトを送信
    const geminiPrompt = BEST_PRACTICES_PROMPT.replace(
      "<input_data>",
      formatDataForGemini(translatedFormData)
    );

    const geminiResponse = await fetch(
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
                  text: geminiPrompt,
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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API エラー: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;

    // 生成されたテキストからプロンプト部分を抽出
    const {english, japanese} = extractPromptFromGeminiResponse(generatedText);

    return NextResponse.json({
      prompt: english,
      japanese: japanese,
    });
  } catch (error) {
    console.error("Prompt generation error:", error);

    // エラーが発生した場合は、シンプルなフォールバックプロンプトを生成
    const fallbackPrompt = "cinematic film of central subject in focus";

    return NextResponse.json({
      prompt: fallbackPrompt,
      japanese: "",
    });
  }
}
