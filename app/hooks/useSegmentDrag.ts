import {useRef, useState, useEffect} from "react";
import {LayerType, ActionSegment} from "../types";

export const useSegmentDrag = (
  layerType: LayerType,
  locked: boolean,
  actionSegments: ActionSegment[],
  segmentWidthRatios?: number[],
  onSegmentWidthRatioChange?: (segmentIndex: number, newRatio: number) => void
) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [draggedSegmentIndex, setDraggedSegmentIndex] = useState<number>(-1);

  // セグメント幅のドラッグ開始
  const handleWidthDragStart = (e: React.MouseEvent, segmentIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked || layerType === "action") return;

    console.log("Width drag started:", {segmentIndex, layerType});
    setIsDraggingWidth(true);
    setDraggedSegmentIndex(segmentIndex);
  };

  // セグメント幅のドラッグ中
  const handleWidthDrag = (e: React.MouseEvent) => {
    if (
      !isDraggingWidth ||
      draggedSegmentIndex === -1 ||
      !segmentWidthRatios ||
      !onSegmentWidthRatioChange
    )
      return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = (e.clientX - rect.left) / rect.width;
    const actionSegmentWidth = 100 / actionSegments.length;

    // 現在のセグメント位置を計算
    let currentPosition = 0;
    for (let i = 0; i < draggedSegmentIndex; i++) {
      const multiplier = segmentWidthRatios[i] || 1;
      currentPosition += actionSegmentWidth * multiplier;
    }

    // ドラッグ位置から新しい右端位置を計算
    const newRightEdge = Math.max(
      currentPosition + actionSegmentWidth,
      position * 100
    );
    const newWidth = newRightEdge - currentPosition;
    const newMultiplier = Math.round(newWidth / actionSegmentWidth);
    const constrainedMultiplier = Math.max(1, Math.min(10, newMultiplier));

    // 制約チェック：総和がActionセグメント数と一致する必要がある
    const currentTotal = segmentWidthRatios.reduce(
      (sum, ratio, index) =>
        index === draggedSegmentIndex ? sum : sum + ratio,
      0
    );

    if (currentTotal + constrainedMultiplier <= actionSegments.length) {
      console.log("Updating segment width:", {
        draggedSegmentIndex,
        constrainedMultiplier,
        currentTotal,
        actionSegmentsLength: actionSegments.length,
      });
      onSegmentWidthRatioChange(draggedSegmentIndex, constrainedMultiplier);
    }
  };

  // ドラッグ終了
  const handleWidthDragEnd = () => {
    setIsDraggingWidth(false);
    setDraggedSegmentIndex(-1);
  };

  // ドラッグ終了のイベントリスナーを設定
  useEffect(() => {
    window.addEventListener("mouseup", handleWidthDragEnd);
    return () => window.removeEventListener("mouseup", handleWidthDragEnd);
  }, []);

  return {
    timelineRef,
    isDraggingWidth,
    draggedSegmentIndex,
    handleWidthDragStart,
    handleWidthDrag,
  };
};
