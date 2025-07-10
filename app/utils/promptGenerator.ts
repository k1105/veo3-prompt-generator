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
    const style = data.visualStyle.style || "";
    const action = data.time_axis[0]?.action || "in focus";
    const camera = data.time_axis[0]?.camera || "";

    const fallbackPrompt = `${style} ${action} central subject${
      camera ? `, ${camera}` : ""
    }`;

    return {
      prompt: fallbackPrompt,
      japanese: "",
    };
  }
};
