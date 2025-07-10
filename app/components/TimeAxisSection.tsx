"use client";

import styles from "../page.module.css";
import Timeline from "./Timeline";
import TimeInput from "./TimeInput";
import FormField from "./FormField";
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

type TimeAxisSectionProps = {
  totalDuration: number;
  segments: TimeSegment[];
  selectedSegment: TimeSegment | null;
  onSegmentChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  onSegmentActionChange: (action: string) => void;
  onSegmentCameraChange: (camera: string) => void;
  onTimeIncrement: (field: "startTime" | "endTime") => void;
  onTimeDecrement: (field: "startTime" | "endTime") => void;
  locked?: boolean;
  onLockToggle?: () => void;
  onSegmentActionUpdate?: (direction?: string) => Promise<void>;
  onSegmentCameraUpdate?: (direction?: string) => Promise<void>;
  visualStyle: VisualStyle;
  audioDesign: AudioDesign;
  setting: Setting;
  characters: Character[];
  title: string;
  concept: string;
  summary: string;
  apiKey: string;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function TimeAxisSection({
  totalDuration,
  segments,
  selectedSegment,
  onSegmentChange,
  onSegmentSelect,
  onSegmentActionChange,
  onSegmentCameraChange,
  onTimeIncrement,
  onTimeDecrement,
  locked = false,
  onLockToggle,
  onSegmentActionUpdate,
  onSegmentCameraUpdate,
  visualStyle,
  audioDesign,
  setting,
  characters,
  title,
  concept,
  summary,
  apiKey,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: TimeAxisSectionProps) {
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.fieldHeader}>
        <h2>Time Axis</h2>
        <div className={styles.headerButtons}>
          <ReferenceButton
            currentSceneId={activeSceneId}
            scenes={scenes}
            fieldPath="time_axis"
            onReference={onReference}
            isReferenced={isFieldReferenced("time_axis")}
            referenceInfo={getReferenceInfo("time_axis")}
          />
          {onLockToggle && (
            <LockButton locked={locked} onToggle={onLockToggle} />
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
                  locked,
                increment:
                  selectedSegment.startTime >= selectedSegment.endTime - 0.1 ||
                  selectedSegment.startTime <= 0 ||
                  locked,
              }}
              title={{
                decrement: locked
                  ? "Time axis is locked"
                  : "Decrease start time by 0.1s (disabled at 0.0s or when too close to end time)",
                increment: locked
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
                  locked,
                increment:
                  selectedSegment.endTime >= 8 ||
                  selectedSegment.startTime <= 0 ||
                  locked,
              }}
              title={{
                decrement: locked
                  ? "Time axis is locked"
                  : "Decrease end time by 0.1s (disabled when too close to start time or at 8.0s)",
                increment: locked
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
            locked={locked}
            onUpdate={onSegmentActionUpdate}
            fieldKey="segmentAction"
          />
          <FormField
            id="segmentCamera"
            label="Camera"
            value={selectedSegment.camera}
            onChange={(value) => onSegmentCameraChange(value as string)}
            placeholder="e.g., slow push-in → whip-pan"
            locked={locked}
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
