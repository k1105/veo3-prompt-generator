"use client";

import styles from "./SegmentCard.module.css";
import {
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface SegmentCardProps {
  segment: Segment;
  segmentType: SegmentType;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (segment: Segment, segmentType: SegmentType) => void;
  onUpdate: (updatedSegment: Segment, segmentType: SegmentType) => void;
  onDelete: (segmentId: string, segmentType: SegmentType) => void;
}

export default function SegmentCard({
  segment,
  segmentType,
  isSelected,
  isExpanded,
  onSelect,
  onUpdate,
  onDelete,
}: SegmentCardProps) {
  const getSegmentColor = (segmentType: SegmentType): string => {
    switch (segmentType) {
      case "world":
        return "var(--world-color)";
      case "effect":
        return "var(--effect-color)";
      case "style":
        return "var(--style-color)";
      case "action":
        return "var(--action-color)";
      default:
        return "var(--gray-alpha-300)";
    }
  };

  const getSegmentDisplayName = (segment: Segment): string => {
    switch (segmentType) {
      case "world":
        return (segment as WorldSegment).segmentName;
      case "effect":
        return (segment as EffectSegment).segmentName;
      case "style":
        return (segment as StyleSegment).segmentName;
      case "action":
        return (segment as ActionSegment).segmentName;
      default:
        return "Unknown";
    }
  };

  const getSegmentDescription = (segment: Segment): string => {
    switch (segmentType) {
      case "world":
        const world = segment as WorldSegment;
        return `${world.environment} - ${world.atmosphere}`;
      case "effect":
        const effect = segment as EffectSegment;
        return `${effect.visual.keyFX} | ${effect.aural.bgm}`;
      case "style":
        const style = segment as StyleSegment;
        return `${style.tone.join(", ")} | ${style.palette}`;
      case "action":
        const action = segment as ActionSegment;
        return `${action.action} | ${action.camera}`;
      default:
        return "";
    }
  };

  const handleSegmentClick = () => {
    onSelect(segment, segmentType);
  };

  const handleInputChange = (field: string, value: string | number) => {
    const updatedSegment = {...segment, [field]: value};
    onUpdate(updatedSegment, segmentType);
  };

  const handleNestedInputChange = (
    parentField: string,
    field: string,
    value: string
  ) => {
    const updatedSegment = {
      ...segment,
      [parentField]: {
        ...(segment as unknown as Record<string, Record<string, string>>)[
          parentField
        ],
        [field]: value,
      },
    };
    onUpdate(updatedSegment, segmentType);
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const arrayValue = value.split(",").map((item) => item.trim());
    const updatedSegment = {...segment, [field]: arrayValue};
    onUpdate(updatedSegment, segmentType);
  };

  const renderExpandedContent = () => {
    if (!isExpanded) return null;

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedHeader}>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(segment.id, segmentType)}
          >
            Delete
          </button>
        </div>

        <div className={styles.expandedFields}>
          {/* 共通フィールド */}
          <div className={styles.expandedField}>
            <label>Name:</label>
            <input
              type="text"
              value={segment.segmentName}
              onChange={(e) => handleInputChange("segmentName", e.target.value)}
            />
          </div>

          {/* セグメントタイプ固有のフィールド */}
          {segmentType === "world" && (
            <>
              <div className={styles.expandedField}>
                <label>Environment:</label>
                <textarea
                  value={(segment as WorldSegment).environment}
                  onChange={(e) =>
                    handleInputChange("environment", e.target.value)
                  }
                  rows={2}
                />
              </div>
              <div className={styles.expandedField}>
                <label>Atmosphere:</label>
                <textarea
                  value={(segment as WorldSegment).atmosphere}
                  onChange={(e) =>
                    handleInputChange("atmosphere", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </>
          )}

          {segmentType === "effect" && (
            <>
              <div className={styles.expandedField}>
                <label>Key FX:</label>
                <input
                  type="text"
                  value={(segment as EffectSegment).visual.keyFX}
                  onChange={(e) =>
                    handleNestedInputChange("visual", "keyFX", e.target.value)
                  }
                />
              </div>
              <div className={styles.expandedField}>
                <label>Lighting:</label>
                <input
                  type="text"
                  value={(segment as EffectSegment).visual.lighting}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual",
                      "lighting",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className={styles.expandedField}>
                <label>Sound Effects:</label>
                <input
                  type="text"
                  value={(segment as EffectSegment).aural.sfx}
                  onChange={(e) =>
                    handleNestedInputChange("aural", "sfx", e.target.value)
                  }
                />
              </div>
              <div className={styles.expandedField}>
                <label>Background Music:</label>
                <input
                  type="text"
                  value={(segment as EffectSegment).aural.bgm}
                  onChange={(e) =>
                    handleNestedInputChange("aural", "bgm", e.target.value)
                  }
                />
              </div>
              <div className={styles.expandedField}>
                <label>Ambience:</label>
                <input
                  type="text"
                  value={(segment as EffectSegment).aural.ambience}
                  onChange={(e) =>
                    handleNestedInputChange("aural", "ambience", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {segmentType === "style" && (
            <>
              <div className={styles.expandedField}>
                <label>Tone (comma-separated):</label>
                <input
                  type="text"
                  value={(segment as StyleSegment).tone.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("tone", e.target.value)
                  }
                />
              </div>
              <div className={styles.expandedField}>
                <label>Palette:</label>
                <input
                  type="text"
                  value={(segment as StyleSegment).palette}
                  onChange={(e) => handleInputChange("palette", e.target.value)}
                />
              </div>
            </>
          )}

          {segmentType === "action" && (
            <>
              <div className={styles.expandedField}>
                <label>Action:</label>
                <textarea
                  value={(segment as ActionSegment).action}
                  onChange={(e) => handleInputChange("action", e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.expandedField}>
                <label>Camera:</label>
                <input
                  type="text"
                  value={(segment as ActionSegment).camera}
                  onChange={(e) => handleInputChange("camera", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.segmentCard} ${
        isSelected ? styles.selectedSegment : ""
      } ${isExpanded ? styles.expandedSegment : ""}`}
      style={{border: `1px solid ${getSegmentColor(segmentType)}`}}
    >
      <div className={styles.segmentHeader} onClick={handleSegmentClick}>
        <div className={styles.segmentContent}>
          <h4 className={styles.segmentName}>
            {getSegmentDisplayName(segment)}
          </h4>
          <p className={styles.segmentDescription}>
            {getSegmentDescription(segment)}
          </p>
        </div>
      </div>

      {/* 展開された編集フォーム */}
      {renderExpandedContent()}
    </div>
  );
}
