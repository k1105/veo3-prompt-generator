"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import AutoGenerator from "./AutoGenerator";

type BasicInfoSectionProps = {
  title: string;
  synopsis: string;
  onTitleChange: (value: string) => void;
  onSynopsisChange: (value: string) => void;
  onGenerate: (data: {
    visual_audio: {
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
    spatial_layout: {
      main: string;
      foreground: string;
      midground: string;
      background: string;
    };
    time_axis: Array<{
      id: string;
      startTime: number;
      endTime: number;
      action: string;
    }>;
  }) => void;
};

export default function BasicInfoSection({
  title,
  synopsis,
  onTitleChange,
  onSynopsisChange,
  onGenerate,
}: BasicInfoSectionProps) {
  return (
    <section className={styles.formSection}>
      <h2>Basic Information</h2>
      <FormField
        id="title"
        label="Title"
        value={title}
        onChange={(value) => onTitleChange(value as string)}
        placeholder="Enter scene title"
      />
      <FormField
        id="synopsis"
        label="Synopsis"
        value={synopsis}
        onChange={(value) => onSynopsisChange(value as string)}
        placeholder="Enter scene synopsis"
        type="textarea"
        rows={4}
      />
      <AutoGenerator
        title={title}
        synopsis={synopsis}
        onGenerate={onGenerate}
      />
    </section>
  );
}
