"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import {SpatialLayout} from "../types";

type SpatialLayoutSectionProps = {
  spatialLayout: SpatialLayout;
  onChange: (field: keyof SpatialLayout, value: string) => void;
};

export default function SpatialLayoutSection({
  spatialLayout,
  onChange,
}: SpatialLayoutSectionProps) {
  return (
    <section className={styles.formSection}>
      <h2>Spatial Layout</h2>
      <FormField
        id="main"
        label="Main"
        value={spatialLayout.main}
        onChange={(value) => onChange("main", value as string)}
        placeholder="Describe the main subject"
        type="textarea"
        rows={3}
      />
      <FormField
        id="foreground"
        label="Foreground"
        value={spatialLayout.foreground}
        onChange={(value) => onChange("foreground", value as string)}
        placeholder="Describe foreground elements"
        type="textarea"
        rows={2}
      />
      <FormField
        id="midground"
        label="Midground"
        value={spatialLayout.midground}
        onChange={(value) => onChange("midground", value as string)}
        placeholder="Describe midground elements"
        type="textarea"
        rows={2}
      />
      <FormField
        id="background"
        label="Background"
        value={spatialLayout.background}
        onChange={(value) => onChange("background", value as string)}
        placeholder="Describe background elements"
        type="textarea"
        rows={2}
      />
    </section>
  );
}
