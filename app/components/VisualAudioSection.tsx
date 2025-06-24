"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import {VisualAudio, TONE_OPTIONS, LockState} from "../types";

type VisualAudioSectionProps = {
  visualAudio: VisualAudio;
  onVisualChange: (
    field: keyof VisualAudio["visual"],
    value: string | string[]
  ) => void;
  onAuralChange: (field: keyof VisualAudio["aural"], value: string) => void;
  lockState?: LockState["visual_audio"];
  onLockToggle?: (section: "visual" | "aural", field: string) => void;
};

export default function VisualAudioSection({
  visualAudio,
  onVisualChange,
  onAuralChange,
  lockState,
  onLockToggle,
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
          locked={lockState?.visual.tone}
          onLockToggle={
            onLockToggle ? () => onLockToggle("visual", "tone") : undefined
          }
        />
        <FormField
          id="palette"
          label="Palette"
          value={visualAudio.visual.palette}
          onChange={(value) => onVisualChange("palette", value as string)}
          placeholder="e.g., indigo, obsidian, neon-turquoise, silver"
          locked={lockState?.visual.palette}
          onLockToggle={
            onLockToggle ? () => onLockToggle("visual", "palette") : undefined
          }
        />
        <FormField
          id="keyFX"
          label="Key FX"
          value={visualAudio.visual.keyFX}
          onChange={(value) => onVisualChange("keyFX", value as string)}
          placeholder="e.g., plasma calligraphy glyphs"
          locked={lockState?.visual.keyFX}
          onLockToggle={
            onLockToggle ? () => onLockToggle("visual", "keyFX") : undefined
          }
        />
        <FormField
          id="camera"
          label="Camera"
          value={visualAudio.visual.camera}
          onChange={(value) => onVisualChange("camera", value as string)}
          placeholder="e.g., slow push-in → whip-pan"
          locked={lockState?.visual.camera}
          onLockToggle={
            onLockToggle ? () => onLockToggle("visual", "camera") : undefined
          }
        />
        <FormField
          id="lighting"
          label="Lighting"
          value={visualAudio.visual.lighting}
          onChange={(value) => onVisualChange("lighting", value as string)}
          placeholder="e.g., lantern rim-lights, ground fog"
          locked={lockState?.visual.lighting}
          onLockToggle={
            onLockToggle ? () => onLockToggle("visual", "lighting") : undefined
          }
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
          locked={lockState?.aural.bgm}
          onLockToggle={
            onLockToggle ? () => onLockToggle("aural", "bgm") : undefined
          }
        />
        <FormField
          id="sfx"
          label="SFX"
          value={visualAudio.aural.sfx}
          onChange={(value) => onAuralChange("sfx", value as string)}
          placeholder="e.g., parchment flutter, sword draw"
          type="textarea"
          rows={3}
          locked={lockState?.aural.sfx}
          onLockToggle={
            onLockToggle ? () => onLockToggle("aural", "sfx") : undefined
          }
        />
        <FormField
          id="ambience"
          label="Ambience"
          value={visualAudio.aural.ambience}
          onChange={(value) => onAuralChange("ambience", value as string)}
          placeholder="e.g., distant cicadas, cool night air"
          locked={lockState?.aural.ambience}
          onLockToggle={
            onLockToggle ? () => onLockToggle("aural", "ambience") : undefined
          }
        />
      </div>
    </section>
  );
}
