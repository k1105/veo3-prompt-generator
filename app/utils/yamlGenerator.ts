import {FormData, TimeSegment} from "../types";

const formatTimeAxis = (segments: TimeSegment[]) => {
  return segments
    .map(
      (segment) =>
        `- t: ${segment.startTime}–${segment.endTime} s\naction: ${segment.action}`
    )
    .join("\n");
};

export const generateYaml = async (data: FormData): Promise<string> => {
  // 翻訳用のコンテンツを準備
  const contentToTranslate = {
    title: data.title || "",
    synopsis: data.synopsis || "",
    visual: {
      tone: Array.isArray(data.visual_audio.visual.tone)
        ? data.visual_audio.visual.tone.join(", ")
        : data.visual_audio.visual.tone || "",
      palette: data.visual_audio.visual.palette || "",
      keyFX: data.visual_audio.visual.keyFX || "",
      camera: data.visual_audio.visual.camera || "",
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
    })),
  };

  try {
    // 翻訳APIを呼び出し
    const translateResponse = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: JSON.stringify(contentToTranslate, null, 2),
        type: "yaml",
      }),
    });

    if (!translateResponse.ok) {
      throw new Error("翻訳に失敗しました");
    }

    const translatedData = await translateResponse.json();

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
camera: ${
      translatedData.visual?.camera || data.visual_audio.visual.camera || ""
    }
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
      }`
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
camera: ${data.visual_audio.visual.camera || ""}
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
