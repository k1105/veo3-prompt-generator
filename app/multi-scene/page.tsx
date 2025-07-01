"use client";

import {useState, useEffect} from "react";
import styles from "../page.module.css";
import {
  MultiSceneFormData,
  Scene,
  WorldSegment,
  EffectSegment,
  StyleSegment,
  ActionSegment,
  SegmentType,
} from "../types";

import MultiSceneLayout from "../components/MultiSceneLayout";
import OutputSection from "../components/YamlOutputSection";
import OutputFormatSelector from "../components/OutputFormatSelector";
import JsonExportButton from "../components/JsonExportButton";
import JsonImportButton from "../components/JsonImportButton";
import ApiKeyManager from "../components/ApiKeyManager";
import {OutputFormat} from "../types";

type Segment = WorldSegment | EffectSegment | StyleSegment | ActionSegment;

export default function MultiScenePage() {
  const [formData, setFormData] = useState<MultiSceneFormData>({
    scenes: [],
    worlds: [
      {
        id: "world-1",
        segmentName: "Office World",
        environment: "Modern office space",
        atmosphere: "Professional and clean",
      },
    ],
    effects: [
      {
        id: "effect-1",
        segmentName: "Office Effects",
        visual: {
          keyFX: "Lens flare effects",
          lighting: "Dramatic shadows",
        },
        aural: {
          sfx: "Ambient office sounds",
          bgm: "Hybrid taiko × sub-bass groove",
          ambience: "Distant cicadas, cool night air",
        },
      },
    ],
    styles: [
      {
        id: "style-1",
        segmentName: "Cinematic Style",
        tone: ["cinematic film of"],
        palette: "indigo, obsidian, neon-turquoise, silver",
      },
    ],
    actions: [
      {
        id: "action-1",
        segmentName: "Opening Sequence",
        action:
          "Camera pushes in; talisman scroll unfurls; faint sparks flicker",
        camera: "slow push-in",
      },
      {
        id: "action-2",
        segmentName: "First Slash",
        action: 'first katana slash; sparks sculpt "Y" and "A"; orbit quickens',
        camera: "steady medium shot",
      },
      {
        id: "action-3",
        segmentName: "Second Slash",
        action:
          'second slash forges "M" and "L"; letters align above blade tip',
        camera: "close-up on blade",
      },
      {
        id: "action-4",
        segmentName: "Final Fusion",
        action:
          'glyphs fuse into blazing "YAML" sigil; bright flash → iris-out',
        camera: "wide shot with iris-out",
      },
    ],
  });

  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedSegmentType, setSelectedSegmentType] =
    useState<SegmentType | null>(null);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("yaml");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generatedJapanese, setGeneratedJapanese] = useState<string>("");
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

  const handleSceneChange = (scenes: Scene[]) => {
    setFormData((prev) => ({
      ...prev,
      scenes,
    }));

    // 選択中のシーンが更新された場合、selectedSceneも更新
    if (selectedScene) {
      const updatedSelectedScene = scenes.find(
        (scene) => scene.id === selectedScene.id
      );
      if (updatedSelectedScene) {
        setSelectedScene(updatedSelectedScene);
      }
    }
  };

  const handleSegmentChange = (
    segmentType: SegmentType,
    segments: Segment[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [segmentType + "s"]: segments,
    }));
  };

  const handleSceneSelect = (scene: Scene | null) => {
    setSelectedScene(scene);
    // シーンが選択されたら、そのシーンのセグメントを選択状態にする
    if (scene) {
      // シーンの最初のアクションを選択
      if (scene.segments.actions.length > 0) {
        const firstAction = formData.actions.find(
          (action) => action.id === scene.segments.actions[0]
        );
        if (firstAction) {
          setSelectedSegment(firstAction);
          setSelectedSegmentType("action");
        }
      }
    } else {
      setSelectedSegment(null);
      setSelectedSegmentType(null);
    }
  };

  const handleSegmentSelect = (
    segment: Segment | null,
    segmentType: SegmentType | null
  ) => {
    setSelectedSegment(segment);
    setSelectedSegmentType(segmentType);
  };

  // JSONインポート処理
  const handleJsonImport = (importedFormData: MultiSceneFormData) => {
    setFormData(importedFormData);

    // 選択状態をリセット
    setSelectedScene(null);
    setSelectedSegment(null);
    setSelectedSegmentType(null);

    // 出力をクリア
    setGeneratedContent("");
    setGeneratedJapanese("");
    setShowOutput(false);
  };

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy YAML:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // ここでプロンプト生成ロジックを実装
    const mockYaml = `# Multi-Scene Prompt

scenes:
${formData.scenes
  .map(
    (scene, index) => `  scene_${index + 1}:
    name: ${scene.name}
    description: ${scene.description}
    segments:
      world: ${scene.segments.world || "none"}
      effect: ${scene.segments.effect || "none"}
      style: ${scene.segments.style || "none"}
      actions: [${scene.segments.actions.join(", ")}]`
  )
  .join("\n")}

worlds:
${formData.worlds
  .map(
    (world, index) => `  world_${index + 1}:
    environment: ${world.environment}
    atmosphere: ${world.atmosphere}`
  )
  .join("\n")}

effects:
${formData.effects
  .map(
    (effect, index) => `  effect_${index + 1}:
    visual:
      key_fx: ${effect.visual.keyFX}
      lighting: ${effect.visual.lighting}
    aural:
      sfx: ${effect.aural.sfx}
      bgm: ${effect.aural.bgm}
      ambience: ${effect.aural.ambience}`
  )
  .join("\n")}

styles:
${formData.styles
  .map(
    (style, index) => `  style_${index + 1}:
    tone: ${style.tone.join(", ")}
    palette: ${style.palette}`
  )
  .join("\n")}

actions:
${formData.actions
  .map(
    (action, index) => `  action_${index + 1}:
    action: ${action.action}
    camera: ${action.camera}`
  )
  .join("\n")}`;

    setGeneratedContent(mockYaml);
    setGeneratedJapanese("");
    setShowOutput(true);
    setIsGenerating(false);
  };

  // SceneTabからのセグメント追加・削除イベントを受けてformDataを更新
  useEffect(() => {
    const handleAdd = (
      e: CustomEvent<{layerType: SegmentType; newSegment: Segment}>
    ) => {
      const {layerType, newSegment} = e.detail;
      setFormData((prev) => {
        if (layerType === "world")
          return {
            ...prev,
            worlds: [...prev.worlds, newSegment as WorldSegment],
          };
        if (layerType === "effect")
          return {
            ...prev,
            effects: [...prev.effects, newSegment as EffectSegment],
          };
        if (layerType === "style")
          return {
            ...prev,
            styles: [...prev.styles, newSegment as StyleSegment],
          };
        if (layerType === "action")
          return {
            ...prev,
            actions: [...prev.actions, newSegment as ActionSegment],
          };
        return prev;
      });
    };
    const handleDelete = (
      e: CustomEvent<{layerType: SegmentType; segmentId: string}>
    ) => {
      const {layerType, segmentId} = e.detail;
      setFormData((prev) => {
        if (layerType === "world")
          return {
            ...prev,
            worlds: prev.worlds.filter((seg) => seg.id !== segmentId),
          };
        if (layerType === "effect")
          return {
            ...prev,
            effects: prev.effects.filter((seg) => seg.id !== segmentId),
          };
        if (layerType === "style")
          return {
            ...prev,
            styles: prev.styles.filter((seg) => seg.id !== segmentId),
          };
        if (layerType === "action")
          return {
            ...prev,
            actions: prev.actions.filter((seg) => seg.id !== segmentId),
          };
        return prev;
      });
    };
    window.addEventListener("scene-segment-add", handleAdd as EventListener);
    window.addEventListener(
      "scene-segment-delete",
      handleDelete as EventListener
    );
    return () => {
      window.removeEventListener(
        "scene-segment-add",
        handleAdd as EventListener
      );
      window.removeEventListener(
        "scene-segment-delete",
        handleDelete as EventListener
      );
    };
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <MultiSceneLayout
            scenes={formData.scenes}
            worlds={formData.worlds}
            effects={formData.effects}
            styles={formData.styles}
            actions={formData.actions}
            selectedScene={selectedScene}
            selectedSegment={selectedSegment}
            selectedSegmentType={selectedSegmentType}
            onSceneChange={handleSceneChange}
            onSegmentChange={handleSegmentChange}
            onSceneSelect={handleSceneSelect}
            onSegmentSelect={handleSegmentSelect}
          />

          <div className={styles.generateSection}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Multi-Scene Prompt"}
            </button>

            <OutputFormatSelector
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
            />

            <JsonExportButton formData={formData} disabled={isGenerating} />

            <JsonImportButton
              onImport={handleJsonImport}
              disabled={isGenerating}
            />
          </div>
        </form>

        <OutputSection
          content={generatedContent}
          japanese={generatedJapanese}
          showOutput={showOutput}
          copySuccess={copySuccess}
          outputFormat={outputFormat}
          onCopy={handleCopyYaml}
        />
      </main>

      <ApiKeyManager
        onApiKeySet={(value: string) => setApiKey(value)}
        currentApiKey={apiKey}
      />
    </div>
  );
}
