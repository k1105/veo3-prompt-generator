"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import Timeline from "./Timeline";
import TimeInput from "./TimeInput";
import LockButton from "./LockButton";
import PreviewButton from "./PreviewButton";
import ReferenceButton from "./ReferenceButton";
import {
  TimeSegment,
  VisualStyle,
  AudioDesign,
  Setting,
  Character,
  Scene,
} from "../types";

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
  // Time Axis props
  totalDuration: number;
  segments: TimeSegment[];
  selectedSegment: TimeSegment | null;
  onSegmentChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  onSegmentActionChange: (action: string) => void;
  onSegmentCameraChange: (camera: string) => void;
  onTimeIncrement: (field: "startTime" | "endTime") => void;
  onTimeDecrement: (field: "startTime" | "endTime") => void;
  timeAxisLocked?: boolean;
  onTimeAxisLockToggle?: () => void;
  onSegmentActionUpdate?: (direction?: string) => Promise<void>;
  onSegmentCameraUpdate?: (direction?: string) => Promise<void>;
  visualStyle: VisualStyle;
  audioDesign: AudioDesign;
  setting: Setting;
  characters: Character[];
  apiKey: string;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
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
  // Time Axis props
  totalDuration,
  segments,
  selectedSegment,
  onSegmentChange,
  onSegmentSelect,
  onSegmentActionChange,
  onSegmentCameraChange,
  onTimeIncrement,
  onTimeDecrement,
  timeAxisLocked = false,
  onTimeAxisLockToggle,
  onSegmentActionUpdate,
  onSegmentCameraUpdate,
  visualStyle,
  audioDesign,
  setting,
  characters,
  apiKey,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: BasicInfoSectionProps) {
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

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

      <h2>Time Axis</h2>
      <div className={styles.fieldHeader}>
        <div className={styles.headerButtons}>
          <ReferenceButton
            currentSceneId={activeSceneId}
            scenes={scenes}
            fieldPath="time_axis"
            onReference={onReference}
            isReferenced={isFieldReferenced("time_axis")}
            referenceInfo={getReferenceInfo("time_axis")}
          />
          {onTimeAxisLockToggle && (
            <LockButton
              locked={timeAxisLocked}
              onToggle={onTimeAxisLockToggle}
            />
          )}
        </div>
      </div>
      <Timeline
        totalDuration={totalDuration}
        segments={segments}
        onSegmentChange={onSegmentChange}
        onSegmentSelect={onSegmentSelect}
        selectedSegmentId={selectedSegment?.id || null}
      />
      {selectedSegment && (
        <div className={styles.segmentEditor}>
          <h3>
            Edit Segment: {formatTimeForInput(selectedSegment.startTime)} -{" "}
            {formatTimeForInput(selectedSegment.endTime)}
          </h3>
          <div className={styles.timeInputs}>
            <TimeInput
              label="Start Time"
              value={selectedSegment.startTime}
              onIncrement={() => onTimeIncrement("startTime")}
              onDecrement={() => onTimeDecrement("startTime")}
              disabled={{
                decrement:
                  selectedSegment.startTime <= 0 ||
                  selectedSegment.startTime >= selectedSegment.endTime - 0.1 ||
                  timeAxisLocked,
                increment:
                  selectedSegment.startTime >= selectedSegment.endTime - 0.1 ||
                  selectedSegment.startTime <= 0 ||
                  timeAxisLocked,
              }}
              title={{
                decrement: timeAxisLocked
                  ? "Time axis is locked"
                  : "Decrease start time by 0.1s (disabled at 0.0s or when too close to end time)",
                increment: timeAxisLocked
                  ? "Time axis is locked"
                  : "Increase start time by 0.1s (disabled when too close to end time or at 0.0s)",
              }}
            />
            <TimeInput
              label="End Time"
              value={selectedSegment.endTime}
              onIncrement={() => onTimeIncrement("endTime")}
              onDecrement={() => onTimeDecrement("endTime")}
              disabled={{
                decrement:
                  selectedSegment.endTime <= selectedSegment.startTime + 0.1 ||
                  selectedSegment.endTime >= 8 ||
                  timeAxisLocked,
                increment:
                  selectedSegment.endTime >= 8 ||
                  selectedSegment.startTime <= 0 ||
                  timeAxisLocked,
              }}
              title={{
                decrement: timeAxisLocked
                  ? "Time axis is locked"
                  : "Decrease end time by 0.1s (disabled when too close to start time or at 8.0s)",
                increment: timeAxisLocked
                  ? "Time axis is locked"
                  : "Increase end time by 0.1s (disabled at 8.0s or when start time is 0.0s)",
              }}
            />
          </div>
          <FormField
            id="segmentAction"
            label="Action"
            value={selectedSegment.action}
            onChange={(value) => onSegmentActionChange(value as string)}
            placeholder="Describe the action for this time segment"
            type="textarea"
            rows={3}
            locked={timeAxisLocked}
            onUpdate={onSegmentActionUpdate}
            fieldKey="segmentAction"
          />
          <FormField
            id="segmentCamera"
            label="Camera"
            value={selectedSegment.camera}
            onChange={(value) => onSegmentCameraChange(value as string)}
            placeholder="e.g., slow push-in → whip-pan"
            locked={timeAxisLocked}
            onUpdate={onSegmentCameraUpdate}
            fieldKey="segmentCamera"
          />
          <PreviewButton
            segment={selectedSegment}
            visualStyle={visualStyle}
            audioDesign={audioDesign}
            setting={setting}
            characters={characters}
            title={title}
            concept={concept}
            summary={summary}
            apiKey={apiKey}
          />
        </div>
      )}
    </section>
  );
}
