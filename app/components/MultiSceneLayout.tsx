"use client";

import {useState} from "react";
import layoutStyles from "./MultiSceneLayout.module.css";
import {
  Scene,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

import SceneTab from "./SceneTab";
import SegmentTab from "./SegmentTab";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface MultiSceneLayoutProps {
  scenes: Scene[];
  worlds: WorldSegment[];
  effects: EffectSegment[];
  styles: StyleSegment[];
  actions: ActionSegment[];
  selectedScene: Scene | null;
  selectedSegment: Segment | null;
  selectedSegmentType: SegmentType | null;
  onSceneChange: (scenes: Scene[]) => void;
  onSegmentChange: (segmentType: SegmentType, segments: Segment[]) => void;
  onSceneSelect: (scene: Scene | null) => void;
  onSegmentSelect: (
    segment: Segment | null,
    segmentType: SegmentType | null
  ) => void;
}

export default function MultiSceneLayout({
  scenes,
  worlds,
  effects,
  styles,
  actions,
  selectedScene,
  selectedSegment,
  selectedSegmentType,
  onSceneChange,
  onSegmentChange,
  onSceneSelect,
  onSegmentSelect,
}: MultiSceneLayoutProps) {
  const [activeTab, setActiveTab] = useState<"scene" | "segment">("scene");

  const segmentData = {
    world: worlds,
    effect: effects,
    style: styles,
    action: actions,
  };

  return (
    <div className={layoutStyles.layout}>
      <div className={layoutStyles.tabContainer}>
        <button
          className={`${layoutStyles.tab} ${
            activeTab === "scene" ? layoutStyles.activeTab : ""
          }`}
          onClick={() => setActiveTab("scene")}
        >
          Scene
        </button>
        <button
          className={`${layoutStyles.tab} ${
            activeTab === "segment" ? layoutStyles.activeTab : ""
          }`}
          onClick={() => setActiveTab("segment")}
        >
          Segment
        </button>
      </div>

      <div className={layoutStyles.tabContent}>
        {activeTab === "scene" && (
          <SceneTab
            scenes={scenes}
            segments={segmentData}
            selectedScene={selectedScene}
            onSceneChange={onSceneChange}
            onSceneSelect={onSceneSelect}
            onSegmentSelect={onSegmentSelect}
          />
        )}
        {activeTab === "segment" && (
          <SegmentTab
            segments={segmentData}
            selectedSegment={selectedSegment}
            selectedSegmentType={selectedSegmentType}
            onSegmentChange={onSegmentChange}
            onSegmentSelect={onSegmentSelect}
          />
        )}
      </div>
    </div>
  );
}
