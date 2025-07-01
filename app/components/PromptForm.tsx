import React from "react";
import styles from "../page.module.css";
import {
  FormData,
  LockState,
  TimeSegment,
  OutputFormat,
  Scene,
  ReferenceInfo,
} from "../types";
import BasicInfoSection from "./BasicInfoSection";
import VisualAudioSection from "./VisualAudioSection";
import SpatialLayoutSection from "./SpatialLayoutSection";
import TimeAxisSection from "./TimeAxisSection";
import OutputFormatSelector from "./OutputFormatSelector";

interface PromptFormProps {
  formData: FormData;
  lockState: LockState;
  selectedSegment: TimeSegment | null;
  outputFormat: OutputFormat;
  isGenerating: boolean;
  apiKey: string;
  scenes: Scene[];
  activeSceneId: string;
  onInputChange: (
    section: keyof FormData,
    field: string,
    value: string
  ) => void;
  onNestedInputChange: (
    section: "visual_audio",
    subsection: "visual" | "aural",
    field: string,
    value: string | string[]
  ) => void;
  onTimeAxisChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  onSegmentActionChange: (action: string) => void;
  onSegmentCameraChange: (camera: string) => void;
  onTimeIncrement: (field: "startTime" | "endTime") => void;
  onTimeDecrement: (field: "startTime" | "endTime") => void;
  onLockToggle: (section: string, field: string, subsection?: string) => void;
  onFieldUpdate: (field: string, direction?: string) => Promise<void>;
  onOutputFormatChange: (format: OutputFormat) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => ReferenceInfo | undefined;
  isFieldReferenced: (fieldPath: string) => boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({
  formData,
  lockState,
  selectedSegment,
  outputFormat,
  isGenerating,
  apiKey,
  scenes,
  activeSceneId,
  onInputChange,
  onNestedInputChange,
  onTimeAxisChange,
  onSegmentSelect,
  onSegmentActionChange,
  onSegmentCameraChange,
  onTimeIncrement,
  onTimeDecrement,
  onLockToggle,
  onFieldUpdate,
  onOutputFormatChange,
  onSubmit,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <BasicInfoSection
        title={formData.title}
        synopsis={formData.synopsis}
        onTitleChange={(value) => onInputChange("title", "title", value)}
        onSynopsisChange={(value) =>
          onInputChange("synopsis", "synopsis", value)
        }
        titleLocked={lockState.title}
        synopsisLocked={lockState.synopsis}
        onTitleLockToggle={() => onLockToggle("title", "title")}
        onSynopsisLockToggle={() => onLockToggle("synopsis", "synopsis")}
        onTitleUpdate={(direction) => onFieldUpdate("title", direction)}
        onSynopsisUpdate={(direction) => onFieldUpdate("synopsis", direction)}
      />

      <VisualAudioSection
        visualAudio={formData.visual_audio}
        onVisualChange={(field, value) =>
          onNestedInputChange("visual_audio", "visual", field, value)
        }
        onAuralChange={(field, value) =>
          onNestedInputChange("visual_audio", "aural", field, value)
        }
        lockState={lockState.visual_audio}
        onLockToggle={(subsection, field) =>
          onLockToggle("visual_audio", field, subsection)
        }
        onVisualUpdate={(field, direction) =>
          onFieldUpdate(`visual.${field}`, direction)
        }
        onAuralUpdate={(field, direction) =>
          onFieldUpdate(`aural.${field}`, direction)
        }
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <SpatialLayoutSection
        spatialLayout={formData.spatial_layout}
        onChange={(field, value) =>
          onInputChange("spatial_layout", field, value)
        }
        lockState={lockState.spatial_layout}
        onLockToggle={(field) => onLockToggle("spatial_layout", field)}
        onUpdate={(field, direction) =>
          onFieldUpdate(`spatial_layout.${field}`, direction)
        }
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <TimeAxisSection
        totalDuration={8}
        segments={formData.time_axis}
        selectedSegment={selectedSegment}
        onSegmentChange={onTimeAxisChange}
        onSegmentSelect={onSegmentSelect}
        onSegmentActionChange={onSegmentActionChange}
        onSegmentCameraChange={onSegmentCameraChange}
        onTimeIncrement={onTimeIncrement}
        onTimeDecrement={onTimeDecrement}
        locked={lockState.time_axis}
        onLockToggle={() => onLockToggle("time_axis", "time_axis")}
        onSegmentActionUpdate={(direction) =>
          onFieldUpdate("segmentAction", direction)
        }
        onSegmentCameraUpdate={(direction) =>
          onFieldUpdate("segmentCamera", direction)
        }
        visualAudio={formData.visual_audio}
        spatialLayout={formData.spatial_layout}
        title={formData.title}
        synopsis={formData.synopsis}
        apiKey={apiKey}
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <div className={styles.generateSection}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Prompt"}
        </button>

        <OutputFormatSelector
          outputFormat={outputFormat}
          onOutputFormatChange={onOutputFormatChange}
        />
      </div>
    </form>
  );
};

export default PromptForm;
