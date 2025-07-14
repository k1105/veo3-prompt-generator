"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import ReferenceButton from "./ReferenceButton";
import {AudioDesign, Scene} from "../types";

type AudioDesignSectionProps = {
  audioDesign: AudioDesign;
  onChange: (field: keyof AudioDesign, value: string) => void;
  lockState?: {
    bgm: boolean;
    sfx: boolean;
    ambience: boolean;
    dialogue: boolean;
    voiceover: boolean;
  };
  onLockToggle?: (field: string) => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function AudioDesignSection({
  audioDesign,
  onChange,
  lockState,
  onLockToggle,
  onUpdate,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: AudioDesignSectionProps) {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h2>音響</h2>
        <ReferenceButton
          currentSceneId={activeSceneId}
          scenes={scenes}
          fieldPath="audioDesign"
          onReference={onReference}
          isReferenced={isFieldReferenced("audioDesign")}
          referenceInfo={getReferenceInfo("audioDesign")}
        />
      </div>
      <FormField
        id="bgm"
        label="BGM"
        value={audioDesign.bgm}
        onChange={(value) => onChange("bgm", value as string)}
        placeholder="背景音楽の説明"
        type="textarea"
        rows={2}
        locked={lockState?.bgm}
        onLockToggle={onLockToggle ? () => onLockToggle("bgm") : undefined}
        onUpdate={onUpdate}
        fieldKey="audioDesign.bgm"
      />
      <FormField
        id="sfx"
        label="効果音"
        value={audioDesign.sfx}
        onChange={(value) => onChange("sfx", value as string)}
        placeholder="効果音の説明"
        type="textarea"
        rows={2}
        locked={lockState?.sfx}
        onLockToggle={onLockToggle ? () => onLockToggle("sfx") : undefined}
        onUpdate={onUpdate}
        fieldKey="audioDesign.sfx"
      />
      <FormField
        id="ambience"
        label="環境音"
        value={audioDesign.ambience}
        onChange={(value) => onChange("ambience", value as string)}
        placeholder="環境音や雰囲気の説明"
        type="textarea"
        rows={2}
        locked={lockState?.ambience}
        onLockToggle={onLockToggle ? () => onLockToggle("ambience") : undefined}
        onUpdate={onUpdate}
        fieldKey="audioDesign.ambience"
      />
      <FormField
        id="dialogue"
        label="セリフ"
        value={audioDesign.dialogue}
        onChange={(value) => onChange("dialogue", value as string)}
        placeholder="キャラクターの会話やセリフ"
        type="textarea"
        rows={3}
        locked={lockState?.dialogue}
        onLockToggle={onLockToggle ? () => onLockToggle("dialogue") : undefined}
        onUpdate={onUpdate}
        fieldKey="audioDesign.dialogue"
      />
      <FormField
        id="voiceover"
        label="ナレーション"
        value={audioDesign.voiceover}
        onChange={(value) => onChange("voiceover", value as string)}
        placeholder="ナレーションやボイスオーバーの内容"
        type="textarea"
        rows={2}
        locked={lockState?.voiceover}
        onLockToggle={
          onLockToggle ? () => onLockToggle("voiceover") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="audioDesign.voiceover"
      />
    </section>
  );
}
