"use client";

import {useState} from "react";
import styles from "./page.module.css";
import {FormData, TimeSegment} from "./types";
import BasicInfoSection from "./components/BasicInfoSection";
import VisualAudioSection from "./components/VisualAudioSection";
import SpatialLayoutSection from "./components/SpatialLayoutSection";
import TimeAxisSection from "./components/TimeAxisSection";
import YamlOutputSection from "./components/YamlOutputSection";
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

  const [selectedSegment, setSelectedSegment] = useState<TimeSegment | null>(
    null
  );
  const [generatedYaml, setGeneratedYaml] = useState<string>("");
  const [showYaml, setShowYaml] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isGeneratingYaml, setIsGeneratingYaml] = useState<boolean>(false);

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

  const handleGeneratedData = (data: {
    visual_audio: {
      visual: {
        tone: string[];
        palette: string;
        keyFX: string;
        camera: string;
        lighting: string;
      };
      aural: {
        bgm: string;
        sfx: string;
        ambience: string;
      };
    };
    spatial_layout: {
      main: string;
      foreground: string;
      midground: string;
      background: string;
    };
    time_axis: Array<{
      id: string;
      startTime: number;
      endTime: number;
      action: string;
    }>;
  }) => {
    setFormData((prev) => ({
      ...prev,
      visual_audio: data.visual_audio,
      spatial_layout: data.spatial_layout,
      time_axis: data.time_axis,
    }));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>YAML Scene Generator</h1>
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
            onGenerate={handleGeneratedData}
          />

          <VisualAudioSection
            visualAudio={formData.visual_audio}
            onVisualChange={(field, value) =>
              handleNestedInputChange("visual_audio", "visual", field, value)
            }
            onAuralChange={(field, value) =>
              handleNestedInputChange("visual_audio", "aural", field, value)
            }
          />

          <SpatialLayoutSection
            spatialLayout={formData.spatial_layout}
            onChange={(field, value) =>
              handleInputChange("spatial_layout", field, value)
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
    </div>
  );
}
