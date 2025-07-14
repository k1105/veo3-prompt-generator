"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import ReferenceButton from "./ReferenceButton";
import {Setting, Scene} from "../types";

type SettingSectionProps = {
  setting: Setting;
  onChange: (field: keyof Setting, value: string) => void;
  lockState?: {
    location: boolean;
    timeOfDay: boolean;
    weather: boolean;
    backgroundElements: boolean;
  };
  onLockToggle?: (field: string) => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function SettingSection({
  setting,
  onChange,
  lockState,
  onLockToggle,
  onUpdate,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: SettingSectionProps) {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h2>場面設定</h2>
        <ReferenceButton
          currentSceneId={activeSceneId}
          scenes={scenes}
          fieldPath="setting"
          onReference={onReference}
          isReferenced={isFieldReferenced("setting")}
          referenceInfo={getReferenceInfo("setting")}
        />
      </div>
      <FormField
        id="location"
        label="場所"
        value={setting.location}
        onChange={(value) => onChange("location", value as string)}
        placeholder="場所の説明"
        type="textarea"
        rows={2}
        locked={lockState?.location}
        onLockToggle={onLockToggle ? () => onLockToggle("location") : undefined}
        onUpdate={onUpdate}
        fieldKey="setting.location"
      />
      <FormField
        id="timeOfDay"
        label="時間帯"
        value={setting.timeOfDay}
        onChange={(value) => onChange("timeOfDay", value as string)}
        placeholder="時間帯の説明"
        locked={lockState?.timeOfDay}
        onLockToggle={
          onLockToggle ? () => onLockToggle("timeOfDay") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="setting.timeOfDay"
      />
      <FormField
        id="weather"
        label="天気"
        value={setting.weather}
        onChange={(value) => onChange("weather", value as string)}
        placeholder="天気の説明"
        locked={lockState?.weather}
        onLockToggle={onLockToggle ? () => onLockToggle("weather") : undefined}
        onUpdate={onUpdate}
        fieldKey="setting.weather"
      />
      <FormField
        id="backgroundElements"
        label="背景要素"
        value={setting.backgroundElements}
        onChange={(value) => onChange("backgroundElements", value as string)}
        placeholder="背景要素の詳細説明。背景にあるオブジェクト、家具など。"
        type="textarea"
        rows={3}
        locked={lockState?.backgroundElements}
        onLockToggle={
          onLockToggle ? () => onLockToggle("backgroundElements") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="setting.backgroundElements"
      />
    </section>
  );
}
