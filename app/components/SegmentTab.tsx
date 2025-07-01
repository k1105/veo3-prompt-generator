"use client";

import SegmentCategory from "./SegmentCategory";
import {
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface SegmentTabProps {
  segments: {
    world: WorldSegment[];
    effect: EffectSegment[];
    style: StyleSegment[];
    action: ActionSegment[];
  };
  selectedSegment: Segment | null;
  selectedSegmentType: SegmentType | null;
  onSegmentChange: (segmentType: SegmentType, segments: Segment[]) => void;
  onSegmentSelect: (
    segment: Segment | null,
    segmentType: SegmentType | null
  ) => void;
}

export default function SegmentTab({
  segments,
  selectedSegment,
  selectedSegmentType,
  onSegmentChange,
  onSegmentSelect,
}: SegmentTabProps) {
  return (
    <SegmentCategory
      segments={segments}
      selectedSegment={selectedSegment}
      selectedSegmentType={selectedSegmentType}
      onSegmentChange={onSegmentChange}
      onSegmentSelect={onSegmentSelect}
    />
  );
}
