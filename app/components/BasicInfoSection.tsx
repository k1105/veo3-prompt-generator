"use client";

import styles from "../page.module.css";
import FormField from "./FormField";

type BasicInfoSectionProps = {
  title: string;
  concept: string;
  summary: string;
  onTitleChange: (value: string) => void;
  onConceptChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  titleLocked?: boolean;
  conceptLocked?: boolean;
  summaryLocked?: boolean;
  onTitleLockToggle?: () => void;
  onConceptLockToggle?: () => void;
  onSummaryLockToggle?: () => void;
  onTitleUpdate?: (direction?: string) => Promise<void>;
  onConceptUpdate?: (direction?: string) => Promise<void>;
  onSummaryUpdate?: (direction?: string) => Promise<void>;
};

export default function BasicInfoSection({
  title,
  concept,
  summary,
  onTitleChange,
  onConceptChange,
  onSummaryChange,
  titleLocked = false,
  conceptLocked = false,
  summaryLocked = false,
  onTitleLockToggle,
  onConceptLockToggle,
  onSummaryLockToggle,
  onTitleUpdate,
  onConceptUpdate,
  onSummaryUpdate,
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
        id="concept"
        label="Concept"
        value={concept}
        onChange={(value) => onConceptChange(value as string)}
        placeholder="超短い核イメージ (例: サングラスをかけた犬が嵐のビーチを逃げる)"
        type="textarea"
        rows={2}
        locked={conceptLocked}
        onLockToggle={onConceptLockToggle}
        onUpdate={onConceptUpdate}
        fieldKey="concept"
      />
      <FormField
        id="summary"
        label="Summary"
        value={summary}
        onChange={(value) => onSummaryChange(value as string)}
        placeholder="全体像を時間軸なしで説明 (例: 主人公のゴールデンレトリバーが巨大な岩から必死に逃げるアクション。舞台は嵐の熱帯ビーチで、激しい自然音とドラマティックなライティングが特徴。)"
        type="textarea"
        rows={4}
        locked={summaryLocked}
        onLockToggle={onSummaryLockToggle}
        onUpdate={onSummaryUpdate}
        fieldKey="summary"
      />
    </section>
  );
}
