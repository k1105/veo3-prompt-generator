"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import {VisualAudio, TONE_OPTIONS} from "../types";

type VisualAudioSectionProps = {
  visualAudio: VisualAudio;
  onVisualChange: (
    field: keyof VisualAudio["visual"],
    value: string | string[]
  ) => void;
  onAuralChange: (field: keyof VisualAudio["aural"], value: string) => void;
};

export default function VisualAudioSection({
  visualAudio,
  onVisualChange,
  onAuralChange,
}: VisualAudioSectionProps) {
  return (
    <section className={styles.formSection}>
      <h2>Visual & Audio</h2>
      <div className={styles.subSection}>
        <h3>Visual</h3>
        <FormField
          id="tone"
          label="Tone"
          value={visualAudio.visual.tone}
          onChange={(value) => onVisualChange("tone", value)}
          type="checkbox"
          options={TONE_OPTIONS}
        />
        <FormField
          id="palette"
          label="Palette"
          value={visualAudio.visual.palette}
          onChange={(value) => onVisualChange("palette", value as string)}
          placeholder="e.g., indigo, obsidian, neon-turquoise, silver"
        />
        <FormField
          id="keyFX"
          label="Key FX"
          value={visualAudio.visual.keyFX}
          onChange={(value) => onVisualChange("keyFX", value as string)}
          placeholder="e.g., plasma calligraphy glyphs"
        />
        <FormField
          id="camera"
          label="Camera"
          value={visualAudio.visual.camera}
          onChange={(value) => onVisualChange("camera", value as string)}
          placeholder="e.g., slow push-in → whip-pan"
        />
        <FormField
          id="lighting"
          label="Lighting"
          value={visualAudio.visual.lighting}
          onChange={(value) => onVisualChange("lighting", value as string)}
          placeholder="e.g., lantern rim-lights, ground fog"
        />
      </div>
      <div className={styles.subSection}>
        <h3>Aural</h3>
        <FormField
          id="bgm"
          label="BGM"
          value={visualAudio.aural.bgm}
          onChange={(value) => onAuralChange("bgm", value as string)}
          placeholder="e.g., hybrid taiko × sub-bass groove"
        />
        <FormField
          id="sfx"
          label="SFX"
          value={visualAudio.aural.sfx}
          onChange={(value) => onAuralChange("sfx", value as string)}
          placeholder="e.g., parchment flutter, sword draw"
          type="textarea"
          rows={3}
        />
        <FormField
          id="ambience"
          label="Ambience"
          value={visualAudio.aural.ambience}
          onChange={(value) => onAuralChange("ambience", value as string)}
          placeholder="e.g., distant cicadas, cool night air"
        />
      </div>
    </section>
  );
}
