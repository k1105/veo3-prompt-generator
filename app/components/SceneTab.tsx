"use client";

import styles from "./SceneTab.module.css";
import Layer from "./Layer";
import {
  Scene,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";
import {v4 as uuidv4} from "uuid";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

interface SceneTabProps {
  scenes: Scene[];
  segments: {
    world: WorldSegment[];
    effect: EffectSegment[];
    style: StyleSegment[];
    action: ActionSegment[];
  };
  selectedScene: Scene | null;
  onSceneChange: (scenes: Scene[]) => void;
  onSceneSelect: (scene: Scene | null) => void;
  onSegmentSelect: (
    segment: Segment | null,
    segmentType: SegmentType | null
  ) => void;
}

export default function SceneTab({
  scenes,
  segments,
  selectedScene,
  onSceneChange,
  onSceneSelect,
  onSegmentSelect,
}: SceneTabProps) {
  const handleCreateScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      description: "New scene description",
      segments: {
        actions: [],
      },
    };
    const updatedScenes = [...scenes, newScene];
    onSceneChange(updatedScenes);
    // 新しく作成したシーンを自動選択
    onSceneSelect(newScene);
  };

  const handleSegmentSelect = (segment: Segment, segmentType: SegmentType) => {
    onSegmentSelect(segment, segmentType);
  };

  // セグメント追加（新規作成）
  const handleAddSegment = (layerType: SegmentType) => {
    const newId = uuidv4();
    let newSegment: Segment;
    switch (layerType) {
      case "world":
        newSegment = {
          id: newId,
          segmentName: `World ${segments.world.length + 1}`,
          environment: "New environment",
          atmosphere: "New atmosphere",
        };
        break;
      case "effect":
        newSegment = {
          id: newId,
          segmentName: `Effect ${segments.effect.length + 1}`,
          visual: {keyFX: "", lighting: ""},
          aural: {sfx: "", bgm: "", ambience: ""},
        };
        break;
      case "style":
        newSegment = {
          id: newId,
          segmentName: `Style ${segments.style.length + 1}`,
          tone: ["cinematic film of"],
          palette: "",
        };
        break;
      case "action":
        newSegment = {
          id: newId,
          segmentName: `Action ${segments.action.length + 1}`,
          action: "",
          camera: "",
        };
        break;
      default:
        return;
    }

    // セグメント追加
    window.dispatchEvent(
      new CustomEvent("scene-segment-add", {detail: {layerType, newSegment}})
    );

    // 新規作成したセグメントをシーンに割り当て
    if (selectedScene) {
      const updatedScenes = scenes.map((scene) => {
        if (scene.id === selectedScene.id) {
          if (layerType === "action") {
            // Actionは配列なので、既に含まれていなければ追加
            const updatedActions = scene.segments.actions.includes(newId)
              ? scene.segments.actions
              : [...scene.segments.actions, newId];
            return {
              ...scene,
              segments: {
                ...scene.segments,
                actions: updatedActions,
              },
            };
          } else {
            // その他のレイヤーは単一セグメント
            return {
              ...scene,
              segments: {
                ...scene.segments,
                [layerType]: newId,
              },
            };
          }
        }
        return scene;
      });
      onSceneChange(updatedScenes);
    }

    // 新規作成したセグメントを選択状態にする
    onSegmentSelect(newSegment, layerType);
  };

  // 既存セグメントをシーンに割り当て
  const handleAssignSegment = (layerType: SegmentType, segmentId: string) => {
    if (!selectedScene) return;

    const updatedScenes = scenes.map((scene) => {
      if (scene.id === selectedScene.id) {
        if (layerType === "action") {
          // Actionは配列なので、既に含まれていなければ追加
          const updatedActions = scene.segments.actions.includes(segmentId)
            ? scene.segments.actions
            : [...scene.segments.actions, segmentId];
          return {
            ...scene,
            segments: {
              ...scene.segments,
              actions: updatedActions,
            },
          };
        } else {
          // その他のレイヤーは単一セグメント
          return {
            ...scene,
            segments: {
              ...scene.segments,
              [layerType]: segmentId,
            },
          };
        }
      }
      return scene;
    });

    onSceneChange(updatedScenes);
  };

  // セグメントをシーンから削除
  const handleRemoveSegment = (layerType: SegmentType, segmentId: string) => {
    if (!selectedScene) return;

    const updatedScenes = scenes.map((scene) => {
      if (scene.id === selectedScene.id) {
        if (layerType === "action") {
          // Actionは配列から削除
          return {
            ...scene,
            segments: {
              ...scene.segments,
              actions: scene.segments.actions.filter((id) => id !== segmentId),
            },
          };
        } else {
          // その他のレイヤーはnullに設定
          return {
            ...scene,
            segments: {
              ...scene.segments,
              [layerType]: null,
            },
          };
        }
      }
      return scene;
    });

    onSceneChange(updatedScenes);
  };

  // シーンが選択されていない場合の表示
  if (scenes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <h3>No scenes created yet</h3>
          <p>Create your first scene to get started</p>
          <button
            className={styles.createSceneButton}
            onClick={handleCreateScene}
          >
            Create New Scene
          </button>
        </div>
      </div>
    );
  }

  // シーンが存在しない場合
  if (scenes.length === 0) {
    return (
      <div className={styles.sceneTab}>
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>No scenes created yet</h3>
            <p>Create your first scene to get started</p>
            <button
              className={styles.createSceneButton}
              onClick={handleCreateScene}
            >
              Create New Scene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // シーンが存在する場合は常にタイムライン表示
  const currentScene = selectedScene || scenes[0];

  return (
    <div className={styles.sceneTab}>
      <div className={styles.timelineHeader}>
        <div className={styles.sceneTabs}>
          {scenes.map((scene) => (
            <button
              key={scene.id}
              className={`${styles.sceneTab} ${
                currentScene.id === scene.id ? styles.activeSceneTab : ""
              }`}
              onClick={() => onSceneSelect(scene)}
            >
              <div className={styles.sceneTabName}>{scene.name}</div>
            </button>
          ))}
        </div>

        <button
          className={styles.createSceneButton}
          onClick={handleCreateScene}
        >
          Create New Scene
        </button>
      </div>

      <div className={styles.timelineContainer}>
        {(["world", "effect", "style", "action"] as const).map((layerType) => (
          <Layer
            key={layerType}
            layerType={layerType}
            segmentId={
              layerType === "action"
                ? null
                : currentScene.segments[layerType] || null
            }
            segmentIds={
              layerType === "action" ? currentScene.segments.actions : []
            }
            segments={segments[layerType]}
            onSegmentSelect={handleSegmentSelect}
            onSegmentAssign={handleAssignSegment}
            onSegmentRemove={handleRemoveSegment}
            onSegmentCreate={handleAddSegment}
          />
        ))}
      </div>
    </div>
  );
}
