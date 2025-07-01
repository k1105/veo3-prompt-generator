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

export const useSegmentManager = (
  layerType: LayerType,
  totalDuration: number,
  actionSegments: ActionSegment[],
  onSegmentChange: (segments: Segment[]) => void,
  onSegmentSelect: (segment: Segment | null) => void,
  onSegmentWidthRatiosReplace?: (newRatios: number[]) => void
) => {
  // Actionレイヤーの境界点を取得（他のレイヤーの基準となる）
  const getActionBoundaries = () => {
    const boundaries = [0];
    return boundaries;
  };

  // 新しいセグメントIDを生成
  const generateSegmentId = (index?: number) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const suffix = index !== undefined ? `-${index}` : "";
    return `${layerType}-${timestamp}-${random}${suffix}`;
  };

  // レイヤータイプに応じたデフォルトセグメントを作成
  const createDefaultSegment = (
    id: string,
    startTime: number,
    endTime: number,
    index: number
  ): Segment => {
    switch (layerType) {
      case "scene":
        return {
          id,
          startTime,
          endTime,
          segmentName: `Scene ${index + 1}`,
          title: `Scene ${index + 1}`,
          description: `Scene ${index + 1} description`,
        } as SceneSegment;
      case "world":
        return {
          id,
          startTime,
          endTime,
          segmentName: `World ${index + 1}`,
          environment: `Environment ${index + 1}`,
          atmosphere: `Atmosphere ${index + 1}`,
        } as WorldSegment;
      case "effect":
        return {
          id,
          startTime,
          endTime,
          segmentName: `Effect ${index + 1}`,
          visual: {
            keyFX: `Key FX ${index + 1}`,
            lighting: `Lighting ${index + 1}`,
          },
          aural: {
            sfx: `SFX ${index + 1}`,
            bgm: `BGM ${index + 1}`,
            ambience: `Ambience ${index + 1}`,
          },
        } as EffectSegment;
      case "style":
        return {
          id,
          startTime,
          endTime,
          segmentName: `Style ${index + 1}`,
          tone: ["cinematic film of"],
          palette: `Palette ${index + 1}`,
        } as StyleSegment;
      case "action":
        return {
          id,
          startTime,
          endTime,
          segmentName: `Action ${index + 1}`,
          action: `Action ${index + 1}`,
          camera: "steady shot",
        } as ActionSegment;
      default:
        throw new Error(`Unknown layer type: ${layerType}`);
    }
  };

  // Actionレイヤーのセグメント追加
  const addActionSegment = (segments: Segment[]) => {
    const segmentWidth = totalDuration / (segments.length + 1);
    const startTime = segments.length * segmentWidth;
    const endTime = (segments.length + 1) * segmentWidth;
    const newSegmentId = generateSegmentId();

    const newSegment = createDefaultSegment(
      newSegmentId,
      startTime,
      endTime,
      segments.length
    ) as ActionSegment;

    const updatedSegments = [...segments, newSegment];
    const adjustedSegments = updatedSegments.map((segment, index) => ({
      ...segment,
      startTime: index * segmentWidth,
      endTime: (index + 1) * segmentWidth,
    }));

    onSegmentChange(adjustedSegments);
    onSegmentSelect(newSegment);
  };

  // 非Actionレイヤーのセグメント追加（空の場合）
  const addNonActionSegmentsFromEmpty = () => {
    if (!onSegmentWidthRatiosReplace) return;

    // Actionセグメントと同じ数のセグメントを作成
    const newRatios = new Array(actionSegments.length).fill(1);
    onSegmentWidthRatiosReplace(newRatios);

    const actionBoundaries = getActionBoundaries();
    const newSegments: Segment[] = [];

    for (let i = 0; i < actionSegments.length; i++) {
      const startTime = actionBoundaries[i];
      const endTime = actionBoundaries[i + 1];
      const newSegmentId = generateSegmentId(i);

      const newSegment = createDefaultSegment(
        newSegmentId,
        startTime,
        endTime,
        i
      );
      newSegments.push(newSegment);
    }

    onSegmentChange(newSegments);
    onSegmentSelect(newSegments[0]);
  };

  // 非Actionレイヤーのセグメント追加（既存セグメントがある場合）
  const addNonActionSegment = (
    segments: Segment[],
    segmentWidthRatios: number[]
  ) => {
    if (!onSegmentWidthRatiosReplace) return;

    const totalWidth = segmentWidthRatios.reduce((sum, w) => sum + w, 0);
    const lastIndex = segmentWidthRatios.length - 1;
    const lastWidth = segmentWidthRatios[lastIndex];

    if (totalWidth < actionSegments.length) {
      // まだ全て埋め尽くされていない場合は従来通り追加
      const newRatios = [...segmentWidthRatios, 1];
      onSegmentWidthRatiosReplace(newRatios);

      const actionBoundaries = getActionBoundaries();
      const newSegmentIndex = segments.length;
      const startTime = actionBoundaries[newSegmentIndex];
      const endTime = actionBoundaries[newSegmentIndex + 1];
      const newSegmentId = generateSegmentId();

      const newSegment = createDefaultSegment(
        newSegmentId,
        startTime,
        endTime,
        segments.length
      );

      const updatedSegments = [...segments, newSegment];
      onSegmentChange(updatedSegments);
      onSegmentSelect(newSegment);
    } else if (totalWidth === actionSegments.length && lastWidth >= 2) {
      // 全て埋め尽くされていて末尾の幅が2以上の場合のみ、末尾を1減らして新規セグメントを追加
      const newRatios = [...segmentWidthRatios];
      newRatios[lastIndex] = lastWidth - 1;
      newRatios.push(1);
      onSegmentWidthRatiosReplace(newRatios);

      const actionBoundaries = getActionBoundaries();
      const newSegmentIndex = segments.length;
      const startTime = actionBoundaries[newSegmentIndex];
      const endTime = actionBoundaries[newSegmentIndex + 1];
      const newSegmentId = generateSegmentId();

      const newSegment = createDefaultSegment(
        newSegmentId,
        startTime,
        endTime,
        segments.length
      );

      const updatedSegments = [...segments, newSegment];
      onSegmentChange(updatedSegments);
      onSegmentSelect(newSegment);
    } else {
      // 追加できない
      console.log(
        `追加できません。 ${layerType} セグメント数: ${actionSegments.length} 現在のセグメント数: ${segments.length} 合計幅: ${totalWidth} 最後の幅: ${lastWidth}`
      );
    }
  };

  // セグメント追加のメイン関数
  const addSegment = (segments: Segment[], segmentWidthRatios?: number[]) => {
    if (layerType === "action") {
      addActionSegment(segments);
    } else {
      if (!segmentWidthRatios || segmentWidthRatios.length === 0) {
        addNonActionSegmentsFromEmpty();
      } else {
        addNonActionSegment(segments, segmentWidthRatios);
      }
    }
  };

  // セグメント削除
  const removeSegment = (segments: Segment[], segmentId: string) => {
    // Actionレイヤーは少なくとも1つのセグメントを持つ必要がある
    if (layerType === "action" && segments.length <= 1) {
      return;
    }

    const segmentIndex = segments.findIndex((s) => s.id === segmentId);
    if (segmentIndex === -1) return;

    const updatedSegments = segments.filter((s) => s.id !== segmentId);

    // セグメントを削除した後、残りのセグメントを等幅に再レイアウト
    if (updatedSegments.length > 0) {
      const segmentWidth = totalDuration / updatedSegments.length;

      const reorganizedSegments = updatedSegments.map((segment, index) => ({
        ...segment,
        startTime: index * segmentWidth,
        endTime: (index + 1) * segmentWidth,
      }));

      onSegmentChange(reorganizedSegments);
    } else {
      onSegmentChange(updatedSegments);
    }

    onSegmentSelect(null);
  };

  return {
    addSegment,
    removeSegment,
    getActionBoundaries,
  };
};
