"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import ReferenceButton from "./ReferenceButton";
import {SpatialLayout, LockState, Scene} from "../types";

type SpatialLayoutSectionProps = {
  spatialLayout: SpatialLayout;
  onChange: (field: keyof SpatialLayout, value: string) => void;
  lockState?: LockState["spatial_layout"];
  onLockToggle?: (field: string) => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function SpatialLayoutSection({
  spatialLayout,
  onChange,
  lockState,
  onLockToggle,
  onUpdate,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: SpatialLayoutSectionProps) {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h2>Spatial Layout</h2>
        <ReferenceButton
          currentSceneId={activeSceneId}
          scenes={scenes}
          fieldPath="spatial_layout"
          onReference={onReference}
          isReferenced={isFieldReferenced("spatial_layout")}
          referenceInfo={getReferenceInfo("spatial_layout")}
        />
      </div>
      <FormField
        id="main"
        label="Main"
        value={spatialLayout.main}
        onChange={(value) => onChange("main", value as string)}
        placeholder="Describe the main subject"
        type="textarea"
        rows={3}
        locked={lockState?.main}
        onLockToggle={onLockToggle ? () => onLockToggle("main") : undefined}
        onUpdate={onUpdate}
        fieldKey="spatial_layout.main"
      />
      <FormField
        id="foreground"
        label="Foreground"
        value={spatialLayout.foreground}
        onChange={(value) => onChange("foreground", value as string)}
        placeholder="Describe foreground elements"
        type="textarea"
        rows={2}
        locked={lockState?.foreground}
        onLockToggle={
          onLockToggle ? () => onLockToggle("foreground") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="spatial_layout.foreground"
      />
      <FormField
        id="midground"
        label="Midground"
        value={spatialLayout.midground}
        onChange={(value) => onChange("midground", value as string)}
        placeholder="Describe midground elements"
        type="textarea"
        rows={2}
        locked={lockState?.midground}
        onLockToggle={
          onLockToggle ? () => onLockToggle("midground") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="spatial_layout.midground"
      />
      <FormField
        id="background"
        label="Background"
        value={spatialLayout.background}
        onChange={(value) => onChange("background", value as string)}
        placeholder="Describe background elements"
        type="textarea"
        rows={2}
        locked={lockState?.background}
        onLockToggle={
          onLockToggle ? () => onLockToggle("background") : undefined
        }
        onUpdate={onUpdate}
        fieldKey="spatial_layout.background"
      />
    </section>
  );
}
