"use client";

import styles from "./Timeline.module.css";
import LockButton from "./LockButton";
import {LayerType} from "../types";
import {useSegmentManager} from "../hooks/useSegmentManager";
import {useSegmentDrag} from "../hooks/useSegmentDrag";
import {useSegmentDisplay} from "../hooks/useSegmentDisplay";

import {Icon} from "@iconify/react";

import {
  ActionSegment,
  SceneSegment,
  WorldSegment,
  EffectSegment,
  StyleSegment,
} from "../types";

type Segment =
  | ActionSegment
  | SceneSegment
  | WorldSegment
  | EffectSegment
  | StyleSegment;

type MultiSceneTimelineProps = {
  totalDuration: number;
  segments: Segment[];
  layerType: LayerType;
  onSegmentChange: (segments: Segment[]) => void;
  onSegmentSelect: (segment: Segment | null) => void;
  selectedSegmentId: string | null;
  actionSegments: ActionSegment[];
  locked: boolean;
  onLockToggle: () => void;
  segmentWidthRatios?: number[];
  onSegmentWidthRatioChange?: (segmentIndex: number, newRatio: number) => void;
  onSegmentWidthRatiosReplace?: (newRatios: number[]) => void;
};

export default function MultiSceneTimeline({
  totalDuration,
  segments,
  layerType,
  onSegmentChange,
  onSegmentSelect,
  selectedSegmentId,
  actionSegments,
  locked,
  onLockToggle,
  segmentWidthRatios,
  onSegmentWidthRatioChange,
  onSegmentWidthRatiosReplace,
}: MultiSceneTimelineProps) {
  // カスタムフックを使用してロジックを分離
  const {addSegment, removeSegment} = useSegmentManager(
    layerType,
    totalDuration,
    actionSegments,
    onSegmentChange,
    onSegmentSelect,
    onSegmentWidthRatiosReplace
  );

  const {
    timelineRef,
    isDraggingWidth,
    draggedSegmentIndex,
    handleWidthDragStart,
    handleWidthDrag,
  } = useSegmentDrag(
    layerType,
    locked,
    actionSegments,
    segmentWidthRatios,
    onSegmentWidthRatioChange
  );

  const {
    getSegmentLabel,
    getLayerColor,
    getSegmentWidth,
    getSegmentPosition,
    getActionBoundaries,
  } = useSegmentDisplay(
    layerType,
    segments,
    actionSegments,
    segmentWidthRatios
  );

  // セグメント追加処理
  const handleAddSegment = () => {
    if (locked) return;
    addSegment(segments, segmentWidthRatios);
  };

  // レイヤータイトルを取得
  const getLayerTitle = () => {
    switch (layerType) {
      case "scene":
        return "Scene";
      case "world":
        return "World";
      case "effect":
        return "Effect";
      case "style":
        return "Style";
      case "action":
        return "Action";
      default:
        return "Unknown";
    }
  };

  // レイヤーアイコンを取得
  const getLayerIcon = () => {
    switch (layerType) {
      case "scene":
        return "ic:round-local-movies";
      case "world":
        return "uil:mountains-sun";
      case "effect":
        return "solar:special-effects-bold";
      case "style":
        return "uil:sliders-v";
      case "action":
        return "material-symbols:accessibility-new-rounded"; // デフォルトアイコン
      default:
        return "material-symbols-light:globe-uk-sharp";
    }
  };

  // セグメント削除処理
  const handleRemoveSegment = (segmentId: string) => {
    if (locked) return;
    removeSegment(segments, segmentId);
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <div className={styles.layerTitle}>
          <Icon
            icon={getLayerIcon()}
            style={{fontSize: "1.3rem", lineHeight: "2rem"}}
          />
          <span className={styles.layerName}>{getLayerTitle()}</span>
        </div>
        <div className={styles.timelineControls}>
          <LockButton
            locked={locked}
            onToggle={() => {
              onLockToggle();
            }}
          />
        </div>
      </div>
      <div className={styles.timelineWrapper}>
        <div
          ref={timelineRef}
          className={styles.timeline}
          onMouseMove={handleWidthDrag}
          style={{cursor: isDraggingWidth ? "ew-resize" : "pointer"}}
        >
          {/* Actionレイヤーの境界線（他のレイヤーの基準） */}
          {layerType !== "action" && (
            <div className={styles.actionBoundaries}>
              {getActionBoundaries()
                .slice(1)
                .map((boundary, index) => (
                  <div
                    key={`boundary-${layerType}-${index}-${boundary}`}
                    className={styles.actionBoundary}
                    style={{
                      left: `${((index + 1) / actionSegments.length) * 100}%`,
                    }}
                  />
                ))}
            </div>
          )}

          {/* セグメント */}
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`${styles.segment} ${
                selectedSegmentId === segment.id ? styles.selected : ""
              }`}
              style={{
                left: `${getSegmentPosition(index)}%`,
                width: `${getSegmentWidth(index)}%`,
                backgroundColor: getLayerColor(),
                opacity: layerType === "action" ? 1 : 0.7,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSegmentSelect(segment);
              }}
            >
              <div className={styles.segmentLabel}>
                {getSegmentLabel(segment)}
              </div>

              {/* ドラッグハンドル（Actionレイヤー以外） */}
              {layerType !== "action" && !locked && (
                <div
                  className={`${styles.widthDragHandle} ${
                    draggedSegmentIndex === index ? styles.dragging : ""
                  }`}
                  onMouseDown={(e) => handleWidthDragStart(e, index)}
                  title={`現在: ${
                    segmentWidthRatios?.[index] || 1
                  }倍 - ドラッグして幅を調整`}
                />
              )}

              {/* 削除ボタン */}
              <button
                className={styles.removeSegment}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveSegment(segment.id);
                }}
                disabled={
                  locked || (layerType === "action" && segments.length <= 1)
                }
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          className={styles.addButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddSegment();
          }}
          disabled={locked}
          title={`Add ${layerType} segment`}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
