"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import ReferenceButton from "./ReferenceButton";
import {VisualStyle, Scene} from "../types";

type VisualStyleSectionProps = {
  visualStyle: VisualStyle;
  onChange: (field: keyof VisualStyle, value: string) => void;
  lockState?: {
    style: boolean;
    palette: boolean;
    lighting: boolean;
  };
  onLockToggle?: (field: string) => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function VisualStyleSection({
  visualStyle,
  onChange,
  lockState,
  onLockToggle,
  onUpdate,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: VisualStyleSectionProps) {
  const handleChange = (field: keyof VisualStyle, value: string | string[]) => {
    // Ensure only string values are passed for VisualStyle fields
    const stringValue = Array.isArray(value) ? value.join(", ") : value;
    onChange(field, stringValue);
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h2>Visual Style</h2>
        <ReferenceButton
          currentSceneId={activeSceneId}
          scenes={scenes}
          fieldPath="visualStyle"
          onReference={onReference}
          isReferenced={isFieldReferenced("visualStyle")}
          referenceInfo={getReferenceInfo("visualStyle")}
        />
      </div>
      <FormField
        id="style"
        label="Style"
        value={visualStyle.style}
        onChange={(value) => handleChange("style", value)}
        placeholder="e.g., cinematic, documentary, anime, illustration"
        locked={lockState?.style}
        onLockToggle={onLockToggle ? () => onLockToggle("style") : undefined}
        onUpdate={onUpdate}
        fieldKey="visualStyle.style"
      />
      <FormField
        id="palette"
        label="Color Palette"
        value={visualStyle.palette}
        onChange={(value) => handleChange("palette", value)}
        placeholder="e.g., warm earth tones, cool blues, high contrast"
        locked={lockState?.palette}
        onLockToggle={onLockToggle ? () => onLockToggle("palette") : undefined}
        onUpdate={onUpdate}
        fieldKey="visualStyle.palette"
      />
      <FormField
        id="lighting"
        label="Lighting"
        value={visualStyle.lighting}
        onChange={(value) => handleChange("lighting", value)}
        placeholder="e.g., natural daylight, dramatic shadows, soft diffused"
        locked={lockState?.lighting}
        onLockToggle={onLockToggle ? () => onLockToggle("lighting") : undefined}
        onUpdate={onUpdate}
        fieldKey="visualStyle.lighting"
      />
    </section>
  );
}
