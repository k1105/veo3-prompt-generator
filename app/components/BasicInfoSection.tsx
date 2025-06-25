"use client";

import styles from "../page.module.css";
import FormField from "./FormField";

type BasicInfoSectionProps = {
  title: string;
  synopsis: string;
  onTitleChange: (value: string) => void;
  onSynopsisChange: (value: string) => void;
  titleLocked?: boolean;
  synopsisLocked?: boolean;
  onTitleLockToggle?: () => void;
  onSynopsisLockToggle?: () => void;
  onTitleUpdate?: (direction?: string) => Promise<void>;
  onSynopsisUpdate?: (direction?: string) => Promise<void>;
};

export default function BasicInfoSection({
  title,
  synopsis,
  onTitleChange,
  onSynopsisChange,
  titleLocked = false,
  synopsisLocked = false,
  onTitleLockToggle,
  onSynopsisLockToggle,
  onTitleUpdate,
  onSynopsisUpdate,
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
        locked={titleLocked}
        onLockToggle={onTitleLockToggle}
        onUpdate={onTitleUpdate}
        fieldKey="title"
      />
      <FormField
        id="synopsis"
        label="Synopsis"
        value={synopsis}
        onChange={(value) => onSynopsisChange(value as string)}
        placeholder="Enter scene synopsis"
        type="textarea"
        rows={4}
        locked={synopsisLocked}
        onLockToggle={onSynopsisLockToggle}
        onUpdate={onSynopsisUpdate}
        fieldKey="synopsis"
      />
    </section>
  );
}
