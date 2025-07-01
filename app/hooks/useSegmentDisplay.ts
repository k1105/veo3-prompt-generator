import {
  ActionSegment,
  SceneSegment,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  LayerType,
} from "../types";

type Segment =
  | ActionSegment
  | SceneSegment
  | WorldSegment
  | EffectSegment
  | StyleSegment;

export const useSegmentDisplay = (
  layerType: LayerType,
  segments: Segment[],
  actionSegments: ActionSegment[],
  segmentWidthRatios?: number[]
) => {
  // セグメントラベルを取得
  const getSegmentLabel = (segment: Segment) => {
    // まずsegmentNameフィールドを優先して使用
    if (segment.segmentName) {
      return segment.segmentName;
    }

    // segmentNameがない場合のフォールバック
    switch (layerType) {
      case "scene":
        const sceneSegment = segment as SceneSegment;
        return (
          sceneSegment.title ||
          sceneSegment.description?.substring(0, 20) ||
          "Scene"
        );
      case "world":
        return (segment as WorldSegment).environment;
      case "effect":
        const effectSegment = segment as EffectSegment;
        return (
          effectSegment.aural?.sfx || effectSegment.visual?.keyFX || "Effect"
        );
      case "style":
        const styleSegment = segment as StyleSegment;
        return styleSegment.palette || "Style";
      case "action":
        return (segment as ActionSegment).action;
      default:
        return "Unknown";
    }
  };

  // レイヤー色を取得
  const getLayerColor = () => {
    switch (layerType) {
      case "scene":
        return "#4CAF50";
      case "world":
        return "#2196F3";
      case "effect":
        return "#FF9800";
      case "style":
        return "#9C27B0";
      case "action":
        return "#F44336";
      default:
        return "#666";
    }
  };

  // セグメント幅を計算（Actionレイヤー以外はActionセグメントの整数倍）
  const getSegmentWidth = (index: number) => {
    if (segments.length === 0) return 0;

    if (layerType === "action") {
      // Actionレイヤーは等幅
      return 100 / segments.length;
    } else {
      // 他のレイヤーはActionセグメントの整数倍
      if (segmentWidthRatios && segmentWidthRatios.length > 0) {
        const actionSegmentWidth = 100 / actionSegments.length;
        const multiplier = segmentWidthRatios[index] || 1;
        return actionSegmentWidth * multiplier;
      } else {
        // 比率が設定されていない場合はActionセグメントと同じ幅
        return 100 / actionSegments.length;
      }
    }
  };

  // セグメントの位置を計算
  const getSegmentPosition = (index: number) => {
    if (segments.length === 0) return 0;

    if (layerType === "action") {
      // Actionレイヤーは等幅配置
      return (index / segments.length) * 100;
    } else {
      // 他のレイヤーはActionセグメントの整数倍に基づく配置
      if (segmentWidthRatios && segmentWidthRatios.length > 0) {
        const actionSegmentWidth = 100 / actionSegments.length;
        let position = 0;
        for (let i = 0; i < index; i++) {
          const multiplier = segmentWidthRatios[i] || 1;
          position += actionSegmentWidth * multiplier;
        }
        return position;
      } else {
        // 比率が設定されていない場合はActionセグメントと同じ配置
        return (index / actionSegments.length) * 100;
      }
    }
  };

  // Actionレイヤーの境界点を取得（他のレイヤーの基準となる）
  const getActionBoundaries = () => {
    const boundaries = [0];
    actionSegments.forEach((segment) => {
      boundaries.push(segment.endTime);
    });
    return boundaries;
  };

  return {
    getSegmentLabel,
    getLayerColor,
    getSegmentWidth,
    getSegmentPosition,
    getActionBoundaries,
  };
};
