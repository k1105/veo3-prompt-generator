import {
  MultiSceneFormData,
  ActionSegment,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  Scene,
} from "../types";

// エクスポート用のJSON型定義
export type ExportJson = {
  scenes: Scene[];
  worlds: WorldSegment[];
  effects: EffectSegment[];
  styles: StyleSegment[];
  actions: ActionSegment[];
};

/**
 * マルチシーンフォームデータをJSON形式に変換する
 */
export function exportToJson(formData: MultiSceneFormData): ExportJson {
  return {
    scenes: formData.scenes,
    worlds: formData.worlds,
    effects: formData.effects,
    styles: formData.styles,
    actions: formData.actions,
  };
}

/**
 * JSONをファイルとしてダウンロードする
 */
export function downloadJson(
  json: ExportJson,
  filename: string = "multi-scene-export.json"
) {
  const jsonString = JSON.stringify(json, null, 2);
  const blob = new Blob([jsonString], {type: "application/json"});
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * JSONファイルを読み込んでマルチシーンフォームデータに変換する
 */
export function importFromJson(json: ExportJson): MultiSceneFormData {
  return {
    scenes: json.scenes,
    worlds: json.worlds,
    effects: json.effects,
    styles: json.styles,
    actions: json.actions,
  };
}

/**
 * JSONファイルを読み込む
 */
export function readJsonFile(file: File): Promise<ExportJson> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
