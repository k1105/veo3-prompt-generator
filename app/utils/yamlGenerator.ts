import {FormData, TimeSegment} from "../types";

const formatTimeAxis = (segments: TimeSegment[]) => {
  return segments
    .map(
      (segment) =>
        `- t: ${segment.startTime}–${segment.endTime} s\naction: ${segment.action}\ncamera: ${segment.camera}`
    )
    .join("\n");
};

export const generateYaml = async (data: FormData): Promise<string> => {
  // 翻訳用のコンテンツを準備（最適化版）
  const contentToTranslate = {
    title: data.title || "",
    concept: data.concept || "",
    summary: data.summary || "",
    visual: {
      style: data.visualStyle.style || "",
      palette: data.visualStyle.palette || "",
      lighting: data.visualStyle.lighting || "",
      cameraStyle: data.visualStyle.cameraStyle || "",
    },
    aural: {
      bgm: data.audioDesign.bgm || "",
      sfx: data.audioDesign.sfx || "",
      ambience: data.audioDesign.ambience || "",
      dialogue: data.audioDesign.dialogue || "",
      voiceover: data.audioDesign.voiceover || "",
    },
    characters: data.characters.map((character) => ({
      name: character.name || "",
      description: character.description || "",
      performanceNote: character.performanceNote || "",
    })),
    setting: {
      location: data.setting.location || "",
      timeOfDay: data.setting.timeOfDay || "",
      weather: data.setting.weather || "",
      backgroundElements: data.setting.backgroundElements || "",
    },
    time_axis: data.time_axis.map((segment) => ({
      action: segment.action,
      camera: segment.camera,
    })),
  };

  // リトライ機能付きの翻訳処理
  const attemptTranslation = async (
    retryCount = 0
  ): Promise<{
    title?: string;
    concept?: string;
    summary?: string;
    visual?: {
      style?: string;
      palette?: string;
      lighting?: string;
      cameraStyle?: string;
    };
    aural?: {
      bgm?: string;
      sfx?: string;
      ambience?: string;
      dialogue?: string;
      voiceover?: string;
    };
    characters?: Array<{
      name?: string;
      description?: string;
      performanceNote?: string;
    }>;
    setting?: {
      location?: string;
      timeOfDay?: string;
      weather?: string;
      backgroundElements?: string;
    };
    time_axis?: Array<{action?: string; camera?: string}>;
  }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const translateResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: JSON.stringify(contentToTranslate, null, 2),
          type: "yaml",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!translateResponse.ok) {
        // レート制限エラーの場合
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

  try {
    const translatedData = await attemptTranslation();

    // デバッグ用：翻訳データをログ出力
    console.log("Translated data:", translatedData);
    console.log("Original data:", data);

    // 翻訳されたデータからYAMLを生成
    const yaml = `title: "${translatedData.title || data.title || ""}"

concept: "${translatedData.concept || data.concept || ""}"

summary: >
${translatedData.summary || data.summary || ""}

visual_style: |
Style: ${translatedData.visual?.style || data.visualStyle.style || ""}
Palette: ${translatedData.visual?.palette || data.visualStyle.palette || ""}
Lighting: ${translatedData.visual?.lighting || data.visualStyle.lighting || ""}
Camera Style: ${
      translatedData.visual?.cameraStyle || data.visualStyle.cameraStyle || ""
    }

audio_design: |
BGM: ${translatedData.aural?.bgm || data.audioDesign.bgm || ""}
SFX: ${translatedData.aural?.sfx || data.audioDesign.sfx || ""}
Ambience: ${translatedData.aural?.ambience || data.audioDesign.ambience || ""}
Dialogue: ${translatedData.aural?.dialogue || data.audioDesign.dialogue || ""}
Voiceover: ${
      translatedData.aural?.voiceover || data.audioDesign.voiceover || ""
    }

characters:
${data.characters
  .map((character, index) => {
    const translatedChar = translatedData.characters?.[index];
    return `- name: "${translatedChar?.name || character.name || ""}"
  description: "${translatedChar?.description || character.description || ""}"
  performanceNote: "${
    translatedChar?.performanceNote || character.performanceNote || ""
  }"`;
  })
  .join("\n")}

setting:
location: "${translatedData.setting?.location || data.setting.location || ""}"
timeOfDay: "${
      translatedData.setting?.timeOfDay || data.setting.timeOfDay || ""
    }"
weather: "${translatedData.setting?.weather || data.setting.weather || ""}"
backgroundElements: "${
      translatedData.setting?.backgroundElements ||
      data.setting.backgroundElements ||
      ""
    }"

time_axis:
${data.time_axis
  .map(
    (segment, index) =>
      `- t: ${segment.startTime}–${segment.endTime} s\naction: ${
        translatedData.time_axis?.[index]?.action || segment.action
      }\ncamera: ${translatedData.time_axis?.[index]?.camera || segment.camera}`
  )
  .join("\n")}`;

    return yaml;
  } catch (error) {
    console.error("Translation error:", error);

    // 翻訳に失敗した場合は元のコンテンツでYAMLを生成
    return `title: "${data.title || "YAML Arcane — Shadow Onmyoji"}"

concept: "${data.concept || ""}"

summary: >
${data.summary || ""}

visual_style: |
Style: ${data.visualStyle.style || ""}
Palette: ${data.visualStyle.palette || ""}
Lighting: ${data.visualStyle.lighting || ""}
Camera Style: ${data.visualStyle.cameraStyle || ""}

audio_design: |
BGM: ${data.audioDesign.bgm || ""}
SFX: ${data.audioDesign.sfx || ""}
Ambience: ${data.audioDesign.ambience || ""}
Dialogue: ${data.audioDesign.dialogue || ""}
Voiceover: ${data.audioDesign.voiceover || ""}

characters:
${data.characters
  .map(
    (character) => `- name: "${character.name || ""}"
  description: "${character.description || ""}"
  performanceNote: "${character.performanceNote || ""}"`
  )
  .join("\n")}

setting:
location: "${data.setting.location || ""}"
timeOfDay: "${data.setting.timeOfDay || ""}"
weather: "${data.setting.weather || ""}"
backgroundElements: "${data.setting.backgroundElements || ""}"

time_axis:
${formatTimeAxis(data.time_axis)}`;
  }
};
