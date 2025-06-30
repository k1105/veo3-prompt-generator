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
    synopsis: data.synopsis || "",
    visual: {
      tone: Array.isArray(data.visual_audio.visual.tone)
        ? data.visual_audio.visual.tone.join(", ")
        : data.visual_audio.visual.tone || "",
      palette: data.visual_audio.visual.palette || "",
      keyFX: data.visual_audio.visual.keyFX || "",
      lighting: data.visual_audio.visual.lighting || "",
    },
    aural: {
      bgm: data.visual_audio.aural.bgm || "",
      sfx: data.visual_audio.aural.sfx || "",
      ambience: data.visual_audio.aural.ambience || "",
    },
    spatial: {
      main: data.spatial_layout.main || "",
      foreground: data.spatial_layout.foreground || "",
      midground: data.spatial_layout.midground || "",
      background: data.spatial_layout.background || "",
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
    synopsis?: string;
    visual?: {
      tone?: string;
      palette?: string;
      keyFX?: string;
      lighting?: string;
    };
    aural?: {
      bgm?: string;
      sfx?: string;
      ambience?: string;
    };
    spatial?: {
      main?: string;
      foreground?: string;
      midground?: string;
      background?: string;
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

    // 翻訳されたデータからYAMLを生成
    const yaml = `title: "${translatedData.title || data.title || ""}"

synopsis: >
${translatedData.synopsis || data.synopsis || ""}

visual_audio: |
Visual —
tone: ${
      Array.isArray(data.visual_audio.visual.tone)
        ? data.visual_audio.visual.tone.join(", ")
        : data.visual_audio.visual.tone || ""
    }; palette: ${
      translatedData.visual?.palette || data.visual_audio.visual.palette || ""
    }
key FX: ${translatedData.visual?.keyFX || data.visual_audio.visual.keyFX || ""}
lighting: ${
      translatedData.visual?.lighting || data.visual_audio.visual.lighting || ""
    }
Aural —
BGM: ${translatedData.aural?.bgm || data.visual_audio.aural.bgm || ""}
SFX: ${translatedData.aural?.sfx || data.visual_audio.aural.sfx || ""}
ambience: ${
      translatedData.aural?.ambience || data.visual_audio.aural.ambience || ""
    }

spatial_layout:
main: >
${translatedData.spatial?.main || data.spatial_layout.main || ""}
foreground:
${translatedData.spatial?.foreground || data.spatial_layout.foreground || ""}
midground:
${translatedData.spatial?.midground || data.spatial_layout.midground || ""}
background:
${translatedData.spatial?.background || data.spatial_layout.background || ""}

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

synopsis: >
${data.synopsis || ""}

visual_audio: |
Visual —
tone: ${
      Array.isArray(data.visual_audio.visual.tone)
        ? data.visual_audio.visual.tone.join(", ")
        : data.visual_audio.visual.tone || ""
    }; palette: ${data.visual_audio.visual.palette || ""}
key FX: ${data.visual_audio.visual.keyFX || ""}
lighting: ${data.visual_audio.visual.lighting || ""}
Aural —
BGM: ${data.visual_audio.aural.bgm || ""}
SFX: ${data.visual_audio.aural.sfx || ""}
ambience: ${data.visual_audio.aural.ambience || ""}

spatial_layout:
main: >
${data.spatial_layout.main || ""}
foreground:
${data.spatial_layout.foreground || ""}
midground:
${data.spatial_layout.midground || ""}
background:
${data.spatial_layout.background || ""}

time_axis:
${formatTimeAxis(data.time_axis)}`;
  }
};
