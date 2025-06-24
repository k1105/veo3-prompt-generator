export type TimeSegment = {
  id: string;
  startTime: number;
  endTime: number;
  action: string;
};

export type ToneOption = {
  value: string;
  label: string;
  category: string;
  japanese: string;
};

export const TONE_OPTIONS: ToneOption[] = [
  // 現実的/写実的
  {
    value: "documentary film of",
    label: "Documentary Film",
    category: "Realistic/Photorealistic",
    japanese: "ドキュメンタリーフィルム風",
  },
  {
    value: "photorealistic",
    label: "Photorealistic",
    category: "Realistic/Photorealistic",
    japanese: "写真のようにリアルな",
  },
  {
    value: "hyperrealistic",
    label: "Hyperrealistic",
    category: "Realistic/Photorealistic",
    japanese: "超写実的な",
  },
  {
    value: "realistic photography",
    label: "Realistic Photography",
    category: "Realistic/Photorealistic",
    japanese: "現実の写真を思わせる",
  },
  {
    value: "natural light photography",
    label: "Natural Light Photography",
    category: "Realistic/Photorealistic",
    japanese: "自然光の写真",
  },

  // 映画的
  {
    value: "cinematic film of",
    label: "Cinematic Film",
    category: "Cinematic",
    japanese: "映画のような",
  },
  {
    value: "cinematic lighting",
    label: "Cinematic Lighting",
    category: "Cinematic",
    japanese: "映画的なライティング",
  },
  {
    value: "anamorphic lens flare",
    label: "Anamorphic Lens Flare",
    category: "Cinematic",
    japanese: "アナモルフィックレンズフレア",
  },
  {
    value: "film grain",
    label: "Film Grain",
    category: "Cinematic",
    japanese: "フィルムグレイン、粒子感",
  },
  {
    value: "blockbuster movie",
    label: "Blockbuster Movie",
    category: "Cinematic",
    japanese: "大作映画のような",
  },

  // アニメ/イラスト
  {
    value: "anime style",
    label: "Anime Style",
    category: "Anime/Illustration",
    japanese: "アニメスタイル",
  },
  {
    value: "manga art",
    label: "Manga Art",
    category: "Anime/Illustration",
    japanese: "漫画アート",
  },
  {
    value: "illustration",
    label: "Illustration",
    category: "Anime/Illustration",
    japanese: "イラスト",
  },
  {
    value: "cartoon style",
    label: "Cartoon Style",
    category: "Anime/Illustration",
    japanese: "カートゥーンスタイル",
  },
  {
    value: "2D animation",
    label: "2D Animation",
    category: "Anime/Illustration",
    japanese: "2Dアニメーション",
  },
  {
    value: "3D animation",
    label: "3D Animation",
    category: "Anime/Illustration",
    japanese: "3Dアニメーション",
  },

  // 芸術的/抽象的
  {
    value: "impressionistic",
    label: "Impressionistic",
    category: "Artistic/Abstract",
    japanese: "印象派風の",
  },
  {
    value: "abstract art",
    label: "Abstract Art",
    category: "Artistic/Abstract",
    japanese: "抽象芸術",
  },
  {
    value: "surrealism",
    label: "Surrealism",
    category: "Artistic/Abstract",
    japanese: "シュルレアリスム",
  },
  {
    value: "dreamy",
    label: "Dreamy",
    category: "Artistic/Abstract",
    japanese: "夢のような",
  },
  {
    value: "vaporwave",
    label: "Vaporwave",
    category: "Artistic/Abstract",
    japanese: "ヴェイパーウェイヴ",
  },

  // 歴史的/時代別
  {
    value: "vintage photography",
    label: "Vintage Photography",
    category: "Historical/Era-Specific",
    japanese: "ヴィンテージ写真",
  },
  {
    value: "80s aesthetic",
    label: "80s Aesthetic",
    category: "Historical/Era-Specific",
    japanese: "80年代の美学",
  },
  {
    value: "noir film",
    label: "Noir Film",
    category: "Historical/Era-Specific",
    japanese: "フィルム・ノワール",
  },
  {
    value: "sepia tone",
    label: "Sepia Tone",
    category: "Historical/Era-Specific",
    japanese: "セピア調",
  },
  {
    value: "black and white film",
    label: "Black and White Film",
    category: "Historical/Era-Specific",
    japanese: "モノクロフィルム",
  },
];

export type VisualAudio = {
  visual: {
    tone: string[];
    palette: string;
    keyFX: string;
    camera: string;
    lighting: string;
  };
  aural: {
    bgm: string;
    sfx: string;
    ambience: string;
  };
};

export type SpatialLayout = {
  main: string;
  foreground: string;
  midground: string;
  background: string;
};

export type FormData = {
  title: string;
  synopsis: string;
  visual_audio: VisualAudio;
  spatial_layout: SpatialLayout;
  time_axis: TimeSegment[];
};

export type VisualAudioSection = FormData["visual_audio"];
export type VisualAudioSubsection = keyof VisualAudioSection;
