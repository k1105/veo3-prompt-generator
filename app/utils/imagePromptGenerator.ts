import {TimeSegment, VisualAudio, SpatialLayout} from "../types";

export function generateImagePrompt(
  segment: TimeSegment,
  visualAudio: VisualAudio,
  spatialLayout: SpatialLayout,
  title: string,
  synopsis: string
): string {
  const {action} = segment;
  const {visual} = visualAudio;
  const {main, foreground, midground, background} = spatialLayout;

  // 画像生成用のプロンプト（直接的な画像生成指示）
  let prompt = `Create a cinematic still image: `;

  if (synopsis) {
    prompt += `Context: ${synopsis}. `;
  }

  prompt += `Scene: ${action}. `;

  // 空間レイアウト情報
  if (main) {
    prompt += `Main subject: ${main}. `;
  }
  if (foreground) {
    prompt += `Foreground: ${foreground}. `;
  }
  if (midground) {
    prompt += `Midground: ${midground}. `;
  }
  if (background) {
    prompt += `Background: ${background}. `;
  }

  // ビジュアル設定
  if (visual.tone && visual.tone.length > 0) {
    prompt += `Visual style: ${visual.tone.join(", ")}. `;
  }
  if (visual.palette) {
    prompt += `Color palette: ${visual.palette}. `;
  }
  if (visual.keyFX) {
    prompt += `Special effects: ${visual.keyFX}. `;
  }
  if (visual.camera) {
    prompt += `Camera angle: ${visual.camera}. `;
  }
  if (visual.lighting) {
    prompt += `Lighting: ${visual.lighting}. `;
  }

  prompt += `High quality, cinematic photography, professional film still, dramatic lighting, detailed composition.`;

  return prompt;
}
