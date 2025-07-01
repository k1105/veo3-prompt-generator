"use client";

import {useState} from "react";
import styles from "./Layer.module.css";
import {
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface LayerProps {
  layerType: SegmentType;
  segmentId: string | null;
  segmentIds: string[]; // For action layer which can have multiple segments
  segments: Segment[];
  onSegmentSelect: (segment: Segment, segmentType: SegmentType) => void;
  onSegmentAssign: (layerType: SegmentType, segmentId: string) => void;
  onSegmentRemove: (layerType: SegmentType, segmentId: string) => void;
  onSegmentCreate: (layerType: SegmentType) => void;
}

export default function Layer({
  layerType,
  segmentId,
  segmentIds,
  segments,
  onSegmentSelect,
  onSegmentAssign,
  onSegmentRemove,
  onSegmentCreate,
}: LayerProps) {
  const [showSegmentSelector, setShowSegmentSelector] = useState(false);

  const getSegmentById = (id: string): Segment | null => {
    return segments.find((seg) => seg.id === id) || null;
  };

  const getSegmentDisplayName = (segment: Segment): string => {
    switch (layerType) {
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

  const getSegmentColor = (): string => {
    switch (layerType) {
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

  const handleAssignSegment = (segmentId: string) => {
    onSegmentAssign(layerType, segmentId);
    setShowSegmentSelector(false);
  };

  const handleCreateSegment = () => {
    onSegmentCreate(layerType);
    setShowSegmentSelector(false);
  };

  return (
    <div className={styles.layerTimelineRow}>
      <div className={styles.layerLabel}>{layerType.toUpperCase()}</div>
      <div className={styles.layerTimelineBar}>
        {/* Display assigned segments */}
        {layerType === "action"
          ? // Action layer can have multiple segments
            segmentIds.map((id) => {
              const segment = getSegmentById(id);
              return segment ? (
                <div
                  key={id}
                  className={styles.timelineSegment}
                  style={{
                    background: getSegmentColor(),
                    marginRight: 8,
                    padding: "0.5em 1em",
                    borderRadius: 8,
                    color: "#fff",
                    display: "inline-block",
                  }}
                  onClick={() => onSegmentSelect(segment, layerType)}
                >
                  {getSegmentDisplayName(segment)}
                  <button
                    className="deleteButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSegmentRemove(layerType, id);
                    }}
                    style={{
                      marginLeft: 8,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })
          : // Other layers have single segment
            segmentId && (
              <div
                className={styles.timelineSegment}
                style={{
                  background: getSegmentColor(),
                  marginRight: 8,
                  padding: "0.5em 1em",
                  borderRadius: 8,
                  color: "#fff",
                  display: "inline-block",
                }}
                onClick={() => {
                  const segment = getSegmentById(segmentId);
                  if (segment) {
                    onSegmentSelect(segment, layerType);
                  }
                }}
              >
                {getSegmentDisplayName(getSegmentById(segmentId)!)}
                <button
                  className="deleteButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSegmentRemove(layerType, segmentId);
                  }}
                  style={{
                    marginLeft: 8,
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            )}

        {/* Add segment button */}
        <button
          className="addButton"
          onClick={() => setShowSegmentSelector(true)}
          style={{
            marginLeft: 8,
            background: "var(--primary-color)",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "0.5em 1em",
            cursor: "pointer",
          }}
        >
          ＋
        </button>
      </div>

      {/* Segment selector modal */}
      {showSegmentSelector && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Select {layerType} Segment</h3>

            {/* Existing segments list */}
            <div className={styles.segmentList}>
              <h4>Existing Segments</h4>
              {segments.length > 0 ? (
                segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={styles.segmentOption}
                    onClick={() => handleAssignSegment(segment.id)}
                    style={{
                      background: getSegmentColor(),
                      padding: "0.5em 1em",
                      margin: "0.25em 0",
                      borderRadius: 8,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {getSegmentDisplayName(segment)}
                  </div>
                ))
              ) : (
                <p
                  style={{color: "var(--gray-alpha-400)", fontStyle: "italic"}}
                >
                  No existing segments
                </p>
              )}
            </div>

            {/* Create new button */}
            <div className={styles.createNewSection}>
              <h4>Create New</h4>
              <button
                className="createNewButton"
                onClick={handleCreateSegment}
                style={{
                  background: "var(--secondary-color)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "0.75em 1.5em",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Create New {layerType} Segment
              </button>
            </div>

            <button
              className="closeButton"
              onClick={() => setShowSegmentSelector(false)}
              style={{
                marginTop: "1em",
                background: "var(--gray-alpha-300)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "0.5em 1em",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
