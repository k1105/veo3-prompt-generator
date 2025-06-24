"use client";

import styles from "../page.module.css";
import Timeline from "./Timeline";
import TimeInput from "./TimeInput";
import FormField from "./FormField";
import {TimeSegment} from "../types";

type TimeAxisSectionProps = {
  totalDuration: number;
  segments: TimeSegment[];
  selectedSegment: TimeSegment | null;
  onSegmentChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  onSegmentActionChange: (action: string) => void;
  onTimeIncrement: (field: "startTime" | "endTime") => void;
  onTimeDecrement: (field: "startTime" | "endTime") => void;
};

export default function TimeAxisSection({
  totalDuration,
  segments,
  selectedSegment,
  onSegmentChange,
  onSegmentSelect,
  onSegmentActionChange,
  onTimeIncrement,
  onTimeDecrement,
}: TimeAxisSectionProps) {
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  return (
    <section className={styles.formSection}>
      <h2>Time Axis</h2>
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
                  selectedSegment.startTime >= selectedSegment.endTime - 0.1,
                increment:
                  selectedSegment.startTime >= selectedSegment.endTime - 0.1 ||
                  selectedSegment.startTime <= 0,
              }}
              title={{
                decrement:
                  "Decrease start time by 0.1s (disabled at 0.0s or when too close to end time)",
                increment:
                  "Increase start time by 0.1s (disabled when too close to end time or at 0.0s)",
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
                  selectedSegment.endTime >= 8,
                increment:
                  selectedSegment.endTime >= 8 ||
                  selectedSegment.startTime <= 0,
              }}
              title={{
                decrement:
                  "Decrease end time by 0.1s (disabled when too close to start time or at 8.0s)",
                increment:
                  "Increase end time by 0.1s (disabled at 8.0s or when start time is 0.0s)",
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
          />
        </div>
      )}
    </section>
  );
}
