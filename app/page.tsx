"use client";

import {useState} from "react";
import styles from "./page.module.css";
import {FormData, TimeSegment, LockState} from "./types";
import BasicInfoSection from "./components/BasicInfoSection";
import VisualAudioSection from "./components/VisualAudioSection";
import SpatialLayoutSection from "./components/SpatialLayoutSection";
import TimeAxisSection from "./components/TimeAxisSection";
import YamlOutputSection from "./components/YamlOutputSection";
import FloatingGenerator from "./components/FloatingGenerator";
import ApiKeyManager from "./components/ApiKeyManager";
import {generateYaml} from "./utils/yamlGenerator";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    synopsis: "",
    visual_audio: {
      visual: {
        tone: [],
        palette: "",
        keyFX: "",
        camera: "",
        lighting: "",
      },
      aural: {
        bgm: "",
        sfx: "",
        ambience: "",
      },
    },
    spatial_layout: {
      main: "",
      foreground: "",
      midground: "",
      background: "",
    },
    time_axis: [
      {
        id: "1",
        startTime: 0,
        endTime: 2.0,
        action:
          "camera pushes in; talisman scroll unfurls; faint sparks flicker",
      },
      {
        id: "2",
        startTime: 2.0,
        endTime: 5.0,
        action: 'first katana slash; sparks sculpt "Y" and "A"; orbit quickens',
      },
      {
        id: "3",
        startTime: 5.0,
        endTime: 7.0,
        action:
          'second slash forges "M" and "L"; letters align above blade tip',
      },
      {
        id: "4",
        startTime: 7.0,
        endTime: 8.0,
        action:
          'glyphs fuse into blazing "YAML" sigil; bright flash → iris-out',
      },
    ],
  });

  const [lockState, setLockState] = useState<LockState>({
    title: false,
    synopsis: false,
    visual_audio: {
      visual: {
        tone: false,
        palette: false,
        keyFX: false,
        camera: false,
        lighting: false,
      },
      aural: {
        bgm: false,
        sfx: false,
        ambience: false,
      },
    },
    spatial_layout: {
      main: false,
      foreground: false,
      midground: false,
      background: false,
    },
    time_axis: false,
  });

  const [selectedSegment, setSelectedSegment] = useState<TimeSegment | null>(
    null
  );
  const [generatedYaml, setGeneratedYaml] = useState<string>("");
  const [showYaml, setShowYaml] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isGeneratingYaml, setIsGeneratingYaml] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

  const handleInputChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]:
        section === "spatial_layout"
          ? {...prev[section], [field]: value}
          : value,
    }));
  };

  const handleNestedInputChange = (
    section: "visual_audio",
    subsection: "visual" | "aural",
    field: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      visual_audio: {
        ...prev.visual_audio,
        [subsection]: {
          ...prev.visual_audio[subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleTimeAxisChange = (segments: TimeSegment[]) => {
    setFormData((prev) => ({
      ...prev,
      time_axis: segments,
    }));
  };

  const handleSegmentSelect = (segment: TimeSegment | null) => {
    setSelectedSegment(segment);
  };

  const handleSegmentActionChange = (action: string) => {
    if (!selectedSegment) return;

    setFormData((prev) => ({
      ...prev,
      time_axis: prev.time_axis.map((segment) =>
        segment.id === selectedSegment.id ? {...segment, action} : segment
      ),
    }));

    // Update the selectedSegment reference
    setSelectedSegment((prev) => (prev ? {...prev, action} : null));
  };

  const handleSegmentTimeChange = (
    field: "startTime" | "endTime",
    value: number
  ) => {
    if (!selectedSegment) return;

    // Ensure the value is within bounds and doesn't create overlaps
    const minTime = field === "startTime" ? 0 : selectedSegment.startTime + 0.1;
    const maxTime = field === "endTime" ? 8 : selectedSegment.endTime - 0.1;
    const constrainedValue = Math.max(minTime, Math.min(maxTime, value));

    setFormData((prev) => ({
      ...prev,
      time_axis: prev.time_axis.map((segment) => {
        if (segment.id === selectedSegment.id) {
          return {...segment, [field]: Math.round(constrainedValue * 10) / 10};
        }
        // Adjust adjacent segments to prevent overlaps
        if (
          field === "startTime" &&
          segment.endTime === selectedSegment.startTime
        ) {
          return {...segment, endTime: Math.round(constrainedValue * 10) / 10};
        }
        if (
          field === "endTime" &&
          segment.startTime === selectedSegment.endTime
        ) {
          return {
            ...segment,
            startTime: Math.round(constrainedValue * 10) / 10,
          };
        }
        return segment;
      }),
    }));

    // Update the selectedSegment reference
    setSelectedSegment((prev) =>
      prev
        ? {
            ...prev,
            [field]: Math.round(constrainedValue * 10) / 10,
          }
        : null
    );
  };

  const handleTimeIncrement = (field: "startTime" | "endTime") => {
    if (!selectedSegment) return;
    const currentValue = selectedSegment[field];
    handleSegmentTimeChange(field, currentValue + 0.1);
  };

  const handleTimeDecrement = (field: "startTime" | "endTime") => {
    if (!selectedSegment) return;
    const currentValue = selectedSegment[field];
    handleSegmentTimeChange(field, currentValue - 0.1);
  };

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy YAML:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingYaml(true);
    generateYaml(formData).then((yaml) => {
      setGeneratedYaml(yaml);
      setShowYaml(true);
      setIsGeneratingYaml(false);
    });
  };

  // ロック状態を考慮した生成処理
  const handleGeneratedData = (data: Partial<FormData>) => {
    console.log("Received generated data:", data);
    console.log("Current lock state:", lockState);

    setFormData((prev) => {
      const newData = {...prev};

      // ロックされていない項目のみを更新
      if (data.title !== undefined && !lockState.title) {
        console.log("Updating title from:", prev.title, "to:", data.title);
        newData.title = data.title;
      }
      if (data.synopsis !== undefined && !lockState.synopsis) {
        console.log(
          "Updating synopsis from:",
          prev.synopsis,
          "to:",
          data.synopsis
        );
        newData.synopsis = data.synopsis;
      }

      // Visual Audio
      if (data.visual_audio) {
        if (
          !lockState.visual_audio.visual.tone &&
          data.visual_audio.visual.tone
        ) {
          newData.visual_audio.visual.tone = data.visual_audio.visual.tone;
        }
        if (
          !lockState.visual_audio.visual.palette &&
          data.visual_audio.visual.palette
        ) {
          newData.visual_audio.visual.palette =
            data.visual_audio.visual.palette;
        }
        if (
          !lockState.visual_audio.visual.keyFX &&
          data.visual_audio.visual.keyFX
        ) {
          newData.visual_audio.visual.keyFX = data.visual_audio.visual.keyFX;
        }
        if (
          !lockState.visual_audio.visual.camera &&
          data.visual_audio.visual.camera
        ) {
          newData.visual_audio.visual.camera = data.visual_audio.visual.camera;
        }
        if (
          !lockState.visual_audio.visual.lighting &&
          data.visual_audio.visual.lighting
        ) {
          newData.visual_audio.visual.lighting =
            data.visual_audio.visual.lighting;
        }
        if (!lockState.visual_audio.aural.bgm && data.visual_audio.aural.bgm) {
          newData.visual_audio.aural.bgm = data.visual_audio.aural.bgm;
        }
        if (!lockState.visual_audio.aural.sfx && data.visual_audio.aural.sfx) {
          newData.visual_audio.aural.sfx = data.visual_audio.aural.sfx;
        }
        if (
          !lockState.visual_audio.aural.ambience &&
          data.visual_audio.aural.ambience
        ) {
          newData.visual_audio.aural.ambience =
            data.visual_audio.aural.ambience;
        }
      }

      // Spatial Layout
      if (data.spatial_layout) {
        if (!lockState.spatial_layout.main && data.spatial_layout.main) {
          newData.spatial_layout.main = data.spatial_layout.main;
        }
        if (
          !lockState.spatial_layout.foreground &&
          data.spatial_layout.foreground
        ) {
          newData.spatial_layout.foreground = data.spatial_layout.foreground;
        }
        if (
          !lockState.spatial_layout.midground &&
          data.spatial_layout.midground
        ) {
          newData.spatial_layout.midground = data.spatial_layout.midground;
        }
        if (
          !lockState.spatial_layout.background &&
          data.spatial_layout.background
        ) {
          newData.spatial_layout.background = data.spatial_layout.background;
        }
      }

      // Time Axis
      if (data.time_axis && !lockState.time_axis) {
        newData.time_axis = data.time_axis;
      }

      return newData;
    });
  };

  // ロック状態を切り替える関数
  const handleLockToggle = (
    section: string,
    field: string,
    subsection?: string
  ) => {
    setLockState((prev) => {
      if (section === "title" || section === "synopsis") {
        return {
          ...prev,
          [section]:
            !prev[section as keyof Pick<LockState, "title" | "synopsis">],
        };
      } else if (section === "visual_audio") {
        const subsectionKey = subsection as keyof LockState["visual_audio"];
        const fieldKey =
          field as keyof LockState["visual_audio"][typeof subsectionKey];
        return {
          ...prev,
          visual_audio: {
            ...prev.visual_audio,
            [subsectionKey]: {
              ...prev.visual_audio[subsectionKey],
              [fieldKey]: !prev.visual_audio[subsectionKey][fieldKey],
            },
          },
        };
      } else if (section === "spatial_layout") {
        const fieldKey = field as keyof LockState["spatial_layout"];
        return {
          ...prev,
          spatial_layout: {
            ...prev.spatial_layout,
            [fieldKey]: !prev.spatial_layout[fieldKey],
          },
        };
      } else if (section === "time_axis") {
        return {
          ...prev,
          time_axis: !prev.time_axis,
        };
      }
      return prev;
    });
  };

  // フィールドアップデート機能
  const handleFieldUpdate = async (field: string, direction?: string) => {
    try {
      // フィールドの現在の値を取得
      let currentValue: string = "";

      if (field === "title") {
        currentValue = formData.title;
      } else if (field === "synopsis") {
        currentValue = formData.synopsis;
      } else if (field.startsWith("visual.")) {
        const visualField = field.split(
          "."
        )[1] as keyof FormData["visual_audio"]["visual"];
        currentValue = formData.visual_audio.visual[visualField] as string;
      } else if (field.startsWith("aural.")) {
        const auralField = field.split(
          "."
        )[1] as keyof FormData["visual_audio"]["aural"];
        currentValue = formData.visual_audio.aural[auralField];
      } else if (field.startsWith("spatial_layout.")) {
        const spatialField = field.split(
          "."
        )[1] as keyof FormData["spatial_layout"];
        currentValue = formData.spatial_layout[spatialField];
      } else if (field === "segmentAction" && selectedSegment) {
        currentValue = selectedSegment.action;
      }

      const requestBody: {
        field: string;
        currentValue: string;
        direction?: string;
        context: string;
        customApiKey?: string;
      } = {
        field,
        currentValue,
        direction,
        context: `Title: ${formData.title}, Synopsis: ${formData.synopsis}`,
      };

      // カスタムAPIキーが設定されている場合は追加
      if (apiKey) {
        requestBody.customApiKey = apiKey;
      }

      const response = await fetch("/api/update-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("フィールドの更新に失敗しました");
      }

      const data = await response.json();

      // 更新された値をフォームに反映
      if (field === "title") {
        handleInputChange("title", "title", data.updatedValue);
      } else if (field === "synopsis") {
        handleInputChange("synopsis", "synopsis", data.updatedValue);
      } else if (field.startsWith("visual.")) {
        const visualField = field.split(
          "."
        )[1] as keyof FormData["visual_audio"]["visual"];
        handleNestedInputChange(
          "visual_audio",
          "visual",
          visualField,
          data.updatedValue
        );
      } else if (field.startsWith("aural.")) {
        const auralField = field.split(
          "."
        )[1] as keyof FormData["visual_audio"]["aural"];
        handleNestedInputChange(
          "visual_audio",
          "aural",
          auralField,
          data.updatedValue
        );
      } else if (field.startsWith("spatial_layout.")) {
        const spatialField = field.split(
          "."
        )[1] as keyof FormData["spatial_layout"];
        handleInputChange("spatial_layout", spatialField, data.updatedValue);
      } else if (field === "segmentAction" && selectedSegment) {
        handleSegmentActionChange(data.updatedValue);
      }
    } catch (error) {
      console.error("Field update error:", error);
      alert("フィールドの更新に失敗しました");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <BasicInfoSection
            title={formData.title}
            synopsis={formData.synopsis}
            onTitleChange={(value) =>
              handleInputChange("title", "title", value)
            }
            onSynopsisChange={(value) =>
              handleInputChange("synopsis", "synopsis", value)
            }
            titleLocked={lockState.title}
            synopsisLocked={lockState.synopsis}
            onTitleLockToggle={() => handleLockToggle("title", "title")}
            onSynopsisLockToggle={() =>
              handleLockToggle("synopsis", "synopsis")
            }
            onTitleUpdate={(direction) => handleFieldUpdate("title", direction)}
            onSynopsisUpdate={(direction) =>
              handleFieldUpdate("synopsis", direction)
            }
          />

          <VisualAudioSection
            visualAudio={formData.visual_audio}
            onVisualChange={(field, value) =>
              handleNestedInputChange("visual_audio", "visual", field, value)
            }
            onAuralChange={(field, value) =>
              handleNestedInputChange("visual_audio", "aural", field, value)
            }
            lockState={lockState.visual_audio}
            onLockToggle={(subsection, field) =>
              handleLockToggle("visual_audio", field, subsection)
            }
            onVisualUpdate={(field, direction) =>
              handleFieldUpdate(`visual.${field}`, direction)
            }
            onAuralUpdate={(field, direction) =>
              handleFieldUpdate(`aural.${field}`, direction)
            }
          />

          <SpatialLayoutSection
            spatialLayout={formData.spatial_layout}
            onChange={(field, value) =>
              handleInputChange("spatial_layout", field, value)
            }
            lockState={lockState.spatial_layout}
            onLockToggle={(field) => handleLockToggle("spatial_layout", field)}
            onUpdate={(field, direction) =>
              handleFieldUpdate(`spatial_layout.${field}`, direction)
            }
          />

          <TimeAxisSection
            totalDuration={8}
            segments={formData.time_axis}
            selectedSegment={selectedSegment}
            onSegmentChange={handleTimeAxisChange}
            onSegmentSelect={handleSegmentSelect}
            onSegmentActionChange={handleSegmentActionChange}
            onTimeIncrement={handleTimeIncrement}
            onTimeDecrement={handleTimeDecrement}
            locked={lockState.time_axis}
            onLockToggle={() => handleLockToggle("time_axis", "time_axis")}
            onSegmentActionUpdate={(direction) =>
              handleFieldUpdate("segmentAction", direction)
            }
            visualAudio={formData.visual_audio}
            spatialLayout={formData.spatial_layout}
            title={formData.title}
            synopsis={formData.synopsis}
            apiKey={apiKey}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isGeneratingYaml}
          >
            {isGeneratingYaml ? "Generating..." : "Generate YAML"}
          </button>
        </form>

        <YamlOutputSection
          yaml={generatedYaml}
          showYaml={showYaml}
          copySuccess={copySuccess}
          onCopy={handleCopyYaml}
        />
      </main>

      <FloatingGenerator
        formData={formData}
        lockState={lockState}
        onGenerate={handleGeneratedData}
        apiKey={apiKey}
      />

      <ApiKeyManager
        onApiKeySet={(value: string) => setApiKey(value)}
        currentApiKey={apiKey}
      />
    </div>
  );
}
