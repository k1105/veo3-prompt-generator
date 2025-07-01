"use client";

import {useState, useEffect} from "react";
import styles from "../page.module.css";
import FormField from "./FormField";
import {
  ActionSegment,
  SceneSegment,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  LayerType,
  TONE_OPTIONS,
} from "../types";

type Segment =
  | ActionSegment
  | SceneSegment
  | WorldSegment
  | EffectSegment
  | StyleSegment;

type MultiSceneEditorProps = {
  layerType: LayerType;
  segment: Segment;
  onSegmentUpdate: (updatedSegment: Segment) => void;
  onFieldUpdate?: (field: string, direction?: string) => Promise<void>;
};

export default function MultiSceneEditor({
  layerType,
  segment,
  onSegmentUpdate,
  onFieldUpdate,
}: MultiSceneEditorProps) {
  const [isEditingSegmentName, setIsEditingSegmentName] = useState(false);
  const [segmentNameValue, setSegmentNameValue] = useState(
    segment.segmentName || ""
  );

  // セグメントが変更されたときにセグメント名値を更新
  useEffect(() => {
    setSegmentNameValue(segment.segmentName || "");
  }, [segment.segmentName]);

  const handleSegmentNameClick = () => {
    setIsEditingSegmentName(true);
  };

  const handleSegmentNameChange = (value: string) => {
    setSegmentNameValue(value);
  };

  const handleSegmentNameSave = () => {
    onSegmentUpdate({
      ...segment,
      segmentName: segmentNameValue,
    });
    setIsEditingSegmentName(false);
  };

  const handleSegmentNameCancel = () => {
    setSegmentNameValue(segment.segmentName || "");
    setIsEditingSegmentName(false);
  };

  const handleSegmentNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSegmentNameSave();
    } else if (e.key === "Escape") {
      handleSegmentNameCancel();
    }
  };

  const getSegmentFields = () => {
    switch (layerType) {
      case "scene":
        const sceneSegment = segment as SceneSegment;
        return (
          <>
            <FormField
              id="sceneTitle"
              label="Title"
              value={sceneSegment.title}
              onChange={(value) => {
                onSegmentUpdate({
                  ...sceneSegment,
                  title: value as string,
                });
              }}
              placeholder="Enter scene title"
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("sceneTitle") : undefined
              }
              fieldKey="sceneTitle"
            />
            <FormField
              id="sceneSynopsis"
              label="Synopsis"
              value={sceneSegment.description}
              onChange={(value) => {
                onSegmentUpdate({
                  ...sceneSegment,
                  description: value as string,
                });
              }}
              placeholder="Enter scene synopsis"
              type="textarea"
              rows={3}
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("sceneSynopsis") : undefined
              }
              fieldKey="sceneSynopsis"
            />
          </>
        );

      case "world":
        const worldSegment = segment as WorldSegment;
        return (
          <>
            <FormField
              id="environment"
              label="Environment"
              value={worldSegment.environment}
              onChange={(value) => {
                onSegmentUpdate({
                  ...worldSegment,
                  environment: value as string,
                });
              }}
              placeholder="Describe the environment"
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("environment") : undefined
              }
              fieldKey="environment"
            />
            <FormField
              id="atmosphere"
              label="Atmosphere"
              value={worldSegment.atmosphere}
              onChange={(value) => {
                onSegmentUpdate({
                  ...worldSegment,
                  atmosphere: value as string,
                });
              }}
              placeholder="Describe the atmosphere"
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("atmosphere") : undefined
              }
              fieldKey="atmosphere"
            />
          </>
        );

      case "effect":
        const effectSegment = segment as EffectSegment;
        return (
          <>
            <div className={styles.subSection}>
              <h3>Visual</h3>
              <FormField
                id="keyFX"
                label="Key FX"
                value={effectSegment.visual.keyFX}
                onChange={(value) => {
                  onSegmentUpdate({
                    ...effectSegment,
                    visual: {
                      ...effectSegment.visual,
                      keyFX: value as string,
                    },
                  });
                }}
                placeholder="e.g., lens flare, particle effects"
                onUpdate={
                  onFieldUpdate ? () => onFieldUpdate("keyFX") : undefined
                }
                fieldKey="keyFX"
              />
              <FormField
                id="lighting"
                label="Lighting"
                value={effectSegment.visual.lighting}
                onChange={(value) => {
                  onSegmentUpdate({
                    ...effectSegment,
                    visual: {
                      ...effectSegment.visual,
                      lighting: value as string,
                    },
                  });
                }}
                placeholder="e.g., dramatic shadows, rim lighting"
                onUpdate={
                  onFieldUpdate ? () => onFieldUpdate("lighting") : undefined
                }
                fieldKey="lighting"
              />
            </div>
            <div className={styles.subSection}>
              <h3>Aural</h3>
              <FormField
                id="sfx"
                label="SFX"
                value={effectSegment.aural.sfx}
                onChange={(value) => {
                  onSegmentUpdate({
                    ...effectSegment,
                    aural: {
                      ...effectSegment.aural,
                      sfx: value as string,
                    },
                  });
                }}
                placeholder="Describe sound effects"
                onUpdate={
                  onFieldUpdate ? () => onFieldUpdate("sfx") : undefined
                }
                fieldKey="sfx"
              />
              <FormField
                id="bgm"
                label="BGM"
                value={effectSegment.aural.bgm}
                onChange={(value) => {
                  onSegmentUpdate({
                    ...effectSegment,
                    aural: {
                      ...effectSegment.aural,
                      bgm: value as string,
                    },
                  });
                }}
                placeholder="e.g., hybrid taiko × sub-bass groove"
                onUpdate={
                  onFieldUpdate ? () => onFieldUpdate("bgm") : undefined
                }
                fieldKey="bgm"
              />
              <FormField
                id="ambience"
                label="Ambience"
                value={effectSegment.aural.ambience}
                onChange={(value) => {
                  onSegmentUpdate({
                    ...effectSegment,
                    aural: {
                      ...effectSegment.aural,
                      ambience: value as string,
                    },
                  });
                }}
                placeholder="e.g., distant cicadas, cool night air"
                onUpdate={
                  onFieldUpdate ? () => onFieldUpdate("ambience") : undefined
                }
                fieldKey="ambience"
              />
            </div>
          </>
        );

      case "style":
        const styleSegment = segment as StyleSegment;
        return (
          <>
            <FormField
              id="tone"
              label="Tone"
              value={styleSegment.tone}
              onChange={(value) => {
                onSegmentUpdate({
                  ...styleSegment,
                  tone: value as string[],
                });
              }}
              type="checkbox"
              options={TONE_OPTIONS}
              onUpdate={onFieldUpdate ? () => onFieldUpdate("tone") : undefined}
              fieldKey="tone"
            />
            <FormField
              id="palette"
              label="Palette"
              value={styleSegment.palette}
              onChange={(value) => {
                onSegmentUpdate({
                  ...styleSegment,
                  palette: value as string,
                });
              }}
              placeholder="e.g., indigo, obsidian, neon-turquoise, silver"
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("palette") : undefined
              }
              fieldKey="palette"
            />
          </>
        );

      case "action":
        const actionSegment = segment as ActionSegment;
        return (
          <>
            <FormField
              id="action"
              label="Action"
              value={actionSegment.action}
              onChange={(value) => {
                onSegmentUpdate({
                  ...actionSegment,
                  action: value as string,
                });
              }}
              placeholder="Describe the action"
              type="textarea"
              rows={3}
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("action") : undefined
              }
              fieldKey="action"
            />
            <FormField
              id="camera"
              label="Camera"
              value={actionSegment.camera}
              onChange={(value) => {
                onSegmentUpdate({
                  ...actionSegment,
                  camera: value as string,
                });
              }}
              placeholder="e.g., slow push-in → whip-pan"
              onUpdate={
                onFieldUpdate ? () => onFieldUpdate("camera") : undefined
              }
              fieldKey="camera"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.fieldHeader}>
        {isEditingSegmentName ? (
          <div className={styles.titleEditContainer}>
            <input
              type="text"
              value={segmentNameValue}
              onChange={(e) => handleSegmentNameChange(e.target.value)}
              onKeyDown={handleSegmentNameKeyDown}
              onBlur={handleSegmentNameSave}
              className={styles.titleInput}
              placeholder="Enter segment name..."
              autoFocus
            />
            <div className={styles.titleEditButtons}>
              <button
                type="button"
                onClick={handleSegmentNameSave}
                className={styles.titleSaveButton}
              >
                ✓
              </button>
              <button
                type="button"
                onClick={handleSegmentNameCancel}
                className={styles.titleCancelButton}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <h2
            className={styles.editableTitle}
            onClick={handleSegmentNameClick}
            title="Click to edit segment name"
          >
            {segment.segmentName || "Untitled"}
          </h2>
        )}
      </div>
      {getSegmentFields()}
    </div>
  );
}
