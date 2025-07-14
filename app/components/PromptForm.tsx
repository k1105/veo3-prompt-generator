import React from "react";
import styles from "../page.module.css";
import {
  FormData,
  LockState,
  TimeSegment,
  OutputFormat,
  Scene,
  ReferenceInfo,
  Character,
  VisualStyle,
  AudioDesign,
} from "../types";
import BasicInfoSection from "./BasicInfoSection";
import CharactersSection from "./CharactersSection";
import SettingSection from "./SettingSection";
import VisualStyleSection from "./VisualStyleSection";
import AudioDesignSection from "./AudioDesignSection";
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
  onVisualStyleChange: (field: keyof VisualStyle, value: string) => void;
  onAudioDesignChange: (field: keyof AudioDesign, value: string) => void;
  onTimeAxisChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  onSegmentActionChange: (action: string) => void;
  onSegmentCameraChange: (camera: string) => void;
  onTimeIncrement: (field: "startTime" | "endTime") => void;
  onTimeDecrement: (field: "startTime" | "endTime") => void;
  onLockToggle: (section: string, field: string, subsection?: string) => void;
  onFieldUpdate: (field: string, direction?: string) => Promise<void>;
  onCharactersChange: (characters: Character[]) => void;
  onOutputFormatChange: (format: OutputFormat) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGeneratedData: (data: FormData) => void;
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
  onVisualStyleChange,
  onAudioDesignChange,
  onTimeAxisChange,
  onSegmentSelect,
  onSegmentActionChange,
  onSegmentCameraChange,
  onTimeIncrement,
  onTimeDecrement,
  onLockToggle,
  onFieldUpdate,
  onCharactersChange,
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
        concept={formData.concept}
        summary={formData.summary}
        onTitleChange={(value) => onInputChange("title", "title", value)}
        onConceptChange={(value) => onInputChange("concept", "concept", value)}
        onSummaryChange={(value) => onInputChange("summary", "summary", value)}
        titleLocked={lockState.title}
        conceptLocked={lockState.concept}
        summaryLocked={lockState.summary}
        onTitleLockToggle={() => onLockToggle("title", "title")}
        onConceptLockToggle={() => onLockToggle("concept", "concept")}
        onSummaryLockToggle={() => onLockToggle("summary", "summary")}
        onTitleUpdate={(direction) => onFieldUpdate("title", direction)}
        onConceptUpdate={(direction) => onFieldUpdate("concept", direction)}
        onSummaryUpdate={(direction) => onFieldUpdate("summary", direction)}
        // Time Axis props
        totalDuration={8}
        segments={formData.time_axis}
        selectedSegment={selectedSegment}
        onSegmentChange={onTimeAxisChange}
        onSegmentSelect={onSegmentSelect}
        onSegmentActionChange={onSegmentActionChange}
        onSegmentCameraChange={onSegmentCameraChange}
        onTimeIncrement={onTimeIncrement}
        onTimeDecrement={onTimeDecrement}
        timeAxisLocked={lockState.time_axis}
        onTimeAxisLockToggle={() => onLockToggle("time_axis", "time_axis")}
        onSegmentActionUpdate={(direction) =>
          onFieldUpdate("segmentAction", direction)
        }
        onSegmentCameraUpdate={(direction) =>
          onFieldUpdate("segmentCamera", direction)
        }
        visualStyle={formData.visualStyle}
        audioDesign={formData.audioDesign}
        setting={formData.setting}
        characters={formData.characters}
        apiKey={apiKey}
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <CharactersSection
        characters={formData.characters}
        onChange={onCharactersChange}
        lockState={lockState.characters}
        onLockToggle={() => onLockToggle("characters", "characters")}
        onUpdate={onFieldUpdate}
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <SettingSection
        setting={formData.setting}
        onChange={(field, value) => onInputChange("setting", field, value)}
        lockState={lockState.setting}
        onLockToggle={(field) => onLockToggle("setting", field)}
        onUpdate={(field, direction) =>
          onFieldUpdate(`setting.${field}`, direction)
        }
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <VisualStyleSection
        visualStyle={formData.visualStyle}
        onChange={(field, value) => onVisualStyleChange(field, value)}
        lockState={lockState.visualStyle}
        onLockToggle={(field) => onLockToggle("visualStyle", field)}
        onUpdate={(field, direction) =>
          onFieldUpdate(`visualStyle.${field}`, direction)
        }
        scenes={scenes}
        activeSceneId={activeSceneId}
        onReference={onReference}
        getReferenceInfo={getReferenceInfo}
        isFieldReferenced={isFieldReferenced}
      />

      <AudioDesignSection
        audioDesign={formData.audioDesign}
        onChange={(field, value) => onAudioDesignChange(field, value)}
        lockState={lockState.audioDesign}
        onLockToggle={(field) => onLockToggle("audioDesign", field)}
        onUpdate={(field, direction) =>
          onFieldUpdate(`audioDesign.${field}`, direction)
        }
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
