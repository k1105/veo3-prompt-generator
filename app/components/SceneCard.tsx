"use client";

import styles from "./SceneCard.module.css";
import {
  Scene,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface SceneCardProps {
  scene: Scene;
  segments: {
    world: WorldSegment[];
    effect: EffectSegment[];
    style: StyleSegment[];
    action: ActionSegment[];
  };
  onSceneSelect: (scene: Scene) => void;
  onSegmentSelect: (segment: Segment, segmentType: SegmentType) => void;
}

export default function SceneCard({
  scene,
  segments,
  onSceneSelect,
  onSegmentSelect,
}: SceneCardProps) {
  const getSegmentById = (
    id: string,
    segmentType: SegmentType
  ): Segment | null => {
    return segments[segmentType].find((seg) => seg.id === id) || null;
  };

  const getSegmentDisplayName = (
    segment: Segment,
    segmentType: SegmentType
  ): string => {
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

  return (
    <div className={styles.sceneCard} onClick={() => onSceneSelect(scene)}>
      <div className={styles.sceneHeader}>
        <h3>{scene.name}</h3>
      </div>

      <p className={styles.sceneDescription}>{scene.description}</p>

      <div className={styles.segmentLayers}>
        {/* World Layer */}
        <div className={styles.layer}>
          <div className={styles.layerLabel}>World</div>
          <div className={styles.segmentContainer}>
            {scene.segments.world ? (
              <div
                className={styles.segment}
                style={{backgroundColor: getSegmentColor("world")}}
                onClick={(e) => {
                  e.stopPropagation();
                  const segment = getSegmentById(
                    scene.segments.world!,
                    "world"
                  );
                  if (segment) {
                    onSegmentSelect(segment, "world");
                  }
                }}
              >
                {getSegmentDisplayName(
                  getSegmentById(scene.segments.world!, "world")!,
                  "world"
                )}
              </div>
            ) : (
              <div className={styles.emptySegment}>No world selected</div>
            )}
          </div>
        </div>

        {/* Effect Layer */}
        <div className={styles.layer}>
          <div className={styles.layerLabel}>Effect</div>
          <div className={styles.segmentContainer}>
            {scene.segments.effect ? (
              <div
                className={styles.segment}
                style={{backgroundColor: getSegmentColor("effect")}}
                onClick={(e) => {
                  e.stopPropagation();
                  const segment = getSegmentById(
                    scene.segments.effect!,
                    "effect"
                  );
                  if (segment) {
                    onSegmentSelect(segment, "effect");
                  }
                }}
              >
                {getSegmentDisplayName(
                  getSegmentById(scene.segments.effect!, "effect")!,
                  "effect"
                )}
              </div>
            ) : (
              <div className={styles.emptySegment}>No effect selected</div>
            )}
          </div>
        </div>

        {/* Style Layer */}
        <div className={styles.layer}>
          <div className={styles.layerLabel}>Style</div>
          <div className={styles.segmentContainer}>
            {scene.segments.style ? (
              <div
                className={styles.segment}
                style={{backgroundColor: getSegmentColor("style")}}
                onClick={(e) => {
                  e.stopPropagation();
                  const segment = getSegmentById(
                    scene.segments.style!,
                    "style"
                  );
                  if (segment) {
                    onSegmentSelect(segment, "style");
                  }
                }}
              >
                {getSegmentDisplayName(
                  getSegmentById(scene.segments.style!, "style")!,
                  "style"
                )}
              </div>
            ) : (
              <div className={styles.emptySegment}>No style selected</div>
            )}
          </div>
        </div>

        {/* Actions Layer */}
        <div className={styles.layer}>
          <div className={styles.layerLabel}>Actions</div>
          <div className={styles.segmentContainer}>
            {scene.segments.actions.length > 0 ? (
              <div className={styles.actionSegments}>
                {scene.segments.actions.map((actionId) => {
                  const action = getSegmentById(actionId, "action");
                  return action ? (
                    <div
                      key={actionId}
                      className={styles.segment}
                      style={{
                        backgroundColor: getSegmentColor("action"),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentSelect(action, "action");
                      }}
                    >
                      {getSegmentDisplayName(action, "action")}
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className={styles.emptySegment}>No actions selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
