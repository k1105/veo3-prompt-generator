"use client";

import {useState} from "react";
import styles from "./SegmentCategory.module.css";
import SegmentCard from "./SegmentCard";
import {
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";
import {v4 as uuidv4} from "uuid";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface SegmentCategoryProps {
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

export default function SegmentCategory({
  segments,
  selectedSegment,
  selectedSegmentType,
  onSegmentChange,
  onSegmentSelect,
}: SegmentCategoryProps) {
  const [activeCategory, setActiveCategory] = useState<SegmentType>("world");
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const handleSegmentSelect = (segment: Segment, segmentType: SegmentType) => {
    onSegmentSelect(segment, segmentType);
    setExpandedSegment(expandedSegment === segment.id ? null : segment.id);
  };

  const handleCreateSegment = (segmentType: SegmentType) => {
    const newSegment = createNewSegment(segmentType);
    const currentSegments = segments[segmentType];
    onSegmentChange(segmentType, [...currentSegments, newSegment]);
    onSegmentSelect(newSegment, segmentType);
    setExpandedSegment(newSegment.id);
  };

  const handleUpdateSegment = (
    updatedSegment: Segment,
    segmentType: SegmentType
  ) => {
    const currentSegments = segments[segmentType];
    const updatedSegments = currentSegments.map((seg) =>
      seg.id === updatedSegment.id ? updatedSegment : seg
    );
    onSegmentChange(segmentType, updatedSegments);
  };

  const handleDeleteSegment = (segmentId: string, segmentType: SegmentType) => {
    const currentSegments = segments[segmentType];
    const updatedSegments = currentSegments.filter(
      (seg) => seg.id !== segmentId
    );
    onSegmentChange(segmentType, updatedSegments);

    // 削除したセグメントが選択中だった場合、選択をクリア
    if (selectedSegment?.id === segmentId) {
      onSegmentSelect(null, null);
      setExpandedSegment(null);
    }
  };

  const createNewSegment = (segmentType: SegmentType): Segment => {
    const id = uuidv4();
    const baseSegment = {
      id,
      segmentName: `New ${segmentType}`,
    };

    switch (segmentType) {
      case "world":
        return {
          ...baseSegment,
          environment: "New environment",
          atmosphere: "New atmosphere",
        } as WorldSegment;
      case "effect":
        return {
          ...baseSegment,
          visual: {
            keyFX: "New key effect",
            lighting: "New lighting",
          },
          aural: {
            sfx: "New sound effects",
            bgm: "New background music",
            ambience: "New ambience",
          },
        } as EffectSegment;
      case "style":
        return {
          ...baseSegment,
          tone: ["cinematic film of"],
          palette: "New palette",
        } as StyleSegment;
      case "action":
        return {
          ...baseSegment,
          action: "New action",
          camera: "New camera movement",
        } as ActionSegment;
      default:
        throw new Error(`Unknown segment type: ${segmentType}`);
    }
  };

  const categories: {type: SegmentType; label: string}[] = [
    {type: "world", label: "Worlds"},
    {type: "effect", label: "Effects"},
    {type: "style", label: "Styles"},
    {type: "action", label: "Actions"},
  ];

  return (
    <div className={styles.segmentCategory}>
      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <button
            key={category.type}
            className={`${styles.categoryTab} ${
              activeCategory === category.type ? styles.activeCategoryTab : ""
            }`}
            onClick={() => setActiveCategory(category.type)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.segmentContent}>
        <div className={styles.segmentHeader}>
          <h3>{categories.find((c) => c.type === activeCategory)?.label}</h3>
          <button
            className={styles.createSegmentButton}
            onClick={() => handleCreateSegment(activeCategory)}
          >
            Create New {activeCategory}
          </button>
        </div>

        <div className={styles.segmentGrid}>
          {segments[activeCategory].map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              segmentType={activeCategory}
              isSelected={
                selectedSegment?.id === segment.id &&
                selectedSegmentType === activeCategory
              }
              isExpanded={expandedSegment === segment.id}
              onSelect={handleSegmentSelect}
              onUpdate={handleUpdateSegment}
              onDelete={handleDeleteSegment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
