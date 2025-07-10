import {
  TimeSegment,
  VisualStyle,
  AudioDesign,
  Setting,
  Character,
} from "../types";

export function generateImagePrompt(
  segment: TimeSegment,
  visualStyle: VisualStyle,
  audioDesign: AudioDesign,
  setting: Setting,
  characters: Character[],
  title: string,
  concept: string,
  summary: string
): string {
  const {action} = segment;
  const {style, palette, lighting, cameraStyle} = visualStyle;
  const {location, timeOfDay, weather, backgroundElements} = setting;

  // 画像生成用のプロンプト（直接的な画像生成指示）
  let prompt = `Create a cinematic still image: `;

  if (summary) {
    prompt += `Context: ${summary}. `;
  }

  prompt += `Scene: ${action}. `;

  // 設定情報
  if (location) {
    prompt += `Location: ${location}. `;
  }
  if (timeOfDay) {
    prompt += `Time of day: ${timeOfDay}. `;
  }
  if (weather) {
    prompt += `Weather: ${weather}. `;
  }
  if (backgroundElements) {
    prompt += `Background elements: ${backgroundElements}. `;
  }

  // ビジュアル設定
  if (style) {
    prompt += `Visual style: ${style}. `;
  }
  if (palette) {
    prompt += `Color palette: ${palette}. `;
  }
  if (cameraStyle) {
    prompt += `Camera style: ${cameraStyle}. `;
  }
  if (lighting) {
    prompt += `Lighting: ${lighting}. `;
  }

  prompt += `High quality, cinematic photography, professional film still, dramatic lighting, detailed composition.`;

  // 安全上のガイドラインを追加
  prompt += ` Safe for all audiences, family-friendly content, no violence, no inappropriate content.`;

  // 安全なコンテンツの推奨事項を追加
  prompt += ` Focus on landscapes, nature, objects, and general scenes. Avoid depictions of people in potentially unsafe situations.`;

  return prompt;
}
