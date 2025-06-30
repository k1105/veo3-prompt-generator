import {FormData} from "../types";

export const generatePrompt = async (
  data: FormData,
  apiKey?: string
): Promise<{prompt: string; japanese: string}> => {
  try {
    const response = await fetch("/api/generate-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`プロンプト生成に失敗しました: ${response.status}`);
    }

    const result = await response.json();
    return {
      prompt: result.prompt,
      japanese: result.japanese || "",
    };
  } catch (error) {
    console.error("Prompt generation error:", error);

    // エラーが発生した場合は、シンプルなフォールバックプロンプトを生成
    const tone = Array.isArray(data.visual_audio.visual.tone)
      ? data.visual_audio.visual.tone.join(", ")
      : data.visual_audio.visual.tone || "";

    const mainSubject = data.spatial_layout.main || "central subject";
    const action = data.time_axis[0]?.action || "in focus";
    const camera = data.time_axis[0]?.camera || "";

    const fallbackPrompt = `${tone} ${action} ${mainSubject}${
      camera ? `, ${camera}` : ""
    }`;

    return {
      prompt: fallbackPrompt,
      japanese: "",
    };
  }
};
