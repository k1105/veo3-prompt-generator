"use client";

import {useState} from "react";
import styles from "./page.module.css";
import Timeline from "./components/Timeline";
import AutoGenerator from "./components/AutoGenerator";

type TimeSegment = {
  id: string;
  startTime: number;
  endTime: number;
  action: string;
};

type FormData = {
  title: string;
  synopsis: string;
  visual_audio: {
    visual: {
      tone: string;
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
  time_axis: TimeSegment[];
};

type VisualAudioSection = FormData["visual_audio"];
type VisualAudioSubsection = keyof VisualAudioSection;

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    synopsis: "",
    visual_audio: {
      visual: {
        tone: "",
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
      [section]: value,
    }));
  };

  const handleNestedInputChange = (
    section: "visual_audio",
    subsection: VisualAudioSubsection,
    field: string,
    value: string
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

  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  const generateYaml = async (data: FormData): Promise<string> => {
    const formatTimeAxis = (segments: TimeSegment[]) => {
      return segments
        .map(
          (segment) =>
            `- t: ${segment.startTime}–${segment.endTime} s\naction: ${segment.action}`
        )
        .join("\n");
    };

    // 翻訳用のコンテンツを準備
    const contentToTranslate = {
      title: data.title || "YAML Arcane — Shadow Onmyoji",
      synopsis:
        data.synopsis ||
        'In a moon-drenched courtyard, a lone onmyoji-samurai unleashes the\narcane force hidden in the four letters "Y-A-M-L." Paper talismans\nignite, neon glyphs whirl, and a single katana stroke forges the\nglowing word across the night sky, sealing evil in an 8-second blaze\nof mystic style.',
      visual: {
        tone: data.visual_audio.visual.tone || "neo-feudal cool",
        palette:
          data.visual_audio.visual.palette ||
          "indigo, obsidian, neon-turquoise, silver",
        keyFX:
          data.visual_audio.visual.keyFX ||
          'plasma calligraphy glyphs "Y", "A", "M", "L" (60 px glow, cyan)',
        camera:
          data.visual_audio.visual.camera ||
          "slow push-in → whip-pan on katana slash → hold on sky-borne sigil",
        lighting:
          data.visual_audio.visual.lighting ||
          "lantern rim-lights, ground fog catching cyan reflections",
      },
      aural: {
        bgm:
          data.visual_audio.aural.bgm ||
          "hybrid taiko × sub-bass groove, 100 BPM, –12 LUFS",
        sfx:
          data.visual_audio.aural.sfx ||
          '- parchment flutter (close-mic, stereo)\n- sword draw "shing" (doppler rise)\n- electric glyph crackle (wide stereo panorama)',
        ambience:
          data.visual_audio.aural.ambience ||
          "distant cicadas, cool night air (10 °C, 85 % RH)",
      },
      spatial: {
        main:
          data.spatial_layout.main ||
          "onmyoji-samurai — raven-black kimono, silver lamellar plate, crow-feather\nhaori; left hand forms kuji-in mudra while right hand draws katana leaving\na neon cyan trail",
        foreground:
          data.spatial_layout.foreground ||
          "glyph_particles: four rotating plasma letters (Y,A,M,L), 1 m orbit, clockwise",
        midground:
          data.spatial_layout.midground ||
          "stone lanterns every 3 m, warm 2200 K glow on raked gravel",
        background:
          data.spatial_layout.background ||
          "moss-stained vermilion torii, cedar silhouettes, thin crescent moon, drifting mist",
      },
      time_axis: data.time_axis.map((segment) => ({
        action: segment.action,
      })),
    };

    try {
      // 翻訳APIを呼び出し
      const translateResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: JSON.stringify(contentToTranslate, null, 2),
          type: "yaml",
        }),
      });

      if (!translateResponse.ok) {
        throw new Error("翻訳に失敗しました");
      }

      const translatedData = await translateResponse.json();

      // 翻訳されたデータからYAMLを生成
      const yaml = `title: "${
        translatedData.title || data.title || "YAML Arcane — Shadow Onmyoji"
      }"

synopsis: >
${
  translatedData.synopsis ||
  data.synopsis ||
  'In a moon-drenched courtyard, a lone onmyoji-samurai unleashes the\narcane force hidden in the four letters "Y-A-M-L." Paper talismans\nignite, neon glyphs whirl, and a single katana stroke forges the\nglowing word across the night sky, sealing evil in an 8-second blaze\nof mystic style.'
}

visual_audio: |
Visual —
tone: ${
        translatedData.visual?.tone ||
        data.visual_audio.visual.tone ||
        "neo-feudal cool"
      }; palette: ${
        translatedData.visual?.palette ||
        data.visual_audio.visual.palette ||
        "indigo, obsidian, neon-turquoise, silver"
      }
key FX: ${
        translatedData.visual?.keyFX ||
        data.visual_audio.visual.keyFX ||
        'plasma calligraphy glyphs "Y", "A", "M", "L" (60 px glow, cyan)'
      }
camera: ${
        translatedData.visual?.camera ||
        data.visual_audio.visual.camera ||
        "slow push-in → whip-pan on katana slash → hold on sky-borne sigil"
      }
lighting: ${
        translatedData.visual?.lighting ||
        data.visual_audio.visual.lighting ||
        "lantern rim-lights, ground fog catching cyan reflections"
      }
Aural —
BGM: ${
        translatedData.aural?.bgm ||
        data.visual_audio.aural.bgm ||
        "hybrid taiko × sub-bass groove, 100 BPM, –12 LUFS"
      }
SFX: ${
        translatedData.aural?.sfx ||
        data.visual_audio.aural.sfx ||
        '- parchment flutter (close-mic, stereo)\n- sword draw "shing" (doppler rise)\n- electric glyph crackle (wide stereo panorama)'
      }
ambience: ${
        translatedData.aural?.ambience ||
        data.visual_audio.aural.ambience ||
        "distant cicadas, cool night air (10 °C, 85 % RH)"
      }

spatial_layout:
main: >
${
  translatedData.spatial?.main ||
  data.spatial_layout.main ||
  "onmyoji-samurai — raven-black kimono, silver lamellar plate, crow-feather\nhaori; left hand forms kuji-in mudra while right hand draws katana leaving\na neon cyan trail"
}
foreground:
${
  translatedData.spatial?.foreground ||
  data.spatial_layout.foreground ||
  "glyph_particles: four rotating plasma letters (Y,A,M,L), 1 m orbit, clockwise"
}
midground:
${
  translatedData.spatial?.midground ||
  data.spatial_layout.midground ||
  "stone lanterns every 3 m, warm 2200 K glow on raked gravel"
}
background:
${
  translatedData.spatial?.background ||
  data.spatial_layout.background ||
  "moss-stained vermilion torii, cedar silhouettes, thin crescent moon, drifting mist"
}

time_axis:
${data.time_axis
  .map(
    (segment, index) =>
      `- t: ${segment.startTime}–${segment.endTime} s\naction: ${
        translatedData.time_axis?.[index]?.action || segment.action
      }`
  )
  .join("\n")}`;

      return yaml;
    } catch (error) {
      console.error("Translation error:", error);
      // 翻訳に失敗した場合は元のコンテンツでYAMLを生成
      return `title: "${data.title || "YAML Arcane — Shadow Onmyoji"}"

synopsis: >
${
  data.synopsis ||
  'In a moon-drenched courtyard, a lone onmyoji-samurai unleashes the\narcane force hidden in the four letters "Y-A-M-L." Paper talismans\nignite, neon glyphs whirl, and a single katana stroke forges the\nglowing word across the night sky, sealing evil in an 8-second blaze\nof mystic style.'
}

visual_audio: |
Visual —
tone: ${data.visual_audio.visual.tone || "neo-feudal cool"}; palette: ${
        data.visual_audio.visual.palette ||
        "indigo, obsidian, neon-turquoise, silver"
      }
key FX: ${
        data.visual_audio.visual.keyFX ||
        'plasma calligraphy glyphs "Y", "A", "M", "L" (60 px glow, cyan)'
      }
camera: ${
        data.visual_audio.visual.camera ||
        "slow push-in → whip-pan on katana slash → hold on sky-borne sigil"
      }
lighting: ${
        data.visual_audio.visual.lighting ||
        "lantern rim-lights, ground fog catching cyan reflections"
      }
Aural —
BGM: ${
        data.visual_audio.aural.bgm ||
        "hybrid taiko × sub-bass groove, 100 BPM, –12 LUFS"
      }
SFX: ${
        data.visual_audio.aural.sfx ||
        '- parchment flutter (close-mic, stereo)\n- sword draw "shing" (doppler rise)\n- electric glyph crackle (wide stereo panorama)'
      }
ambience: ${
        data.visual_audio.aural.ambience ||
        "distant cicadas, cool night air (10 °C, 85 % RH)"
      }

spatial_layout:
main: >
${
  data.spatial_layout.main ||
  "onmyoji-samurai — raven-black kimono, silver lamellar plate, crow-feather\nhaori; left hand forms kuji-in mudra while right hand draws katana leaving\na neon cyan trail"
}
foreground:
${
  data.spatial_layout.foreground ||
  "glyph_particles: four rotating plasma letters (Y,A,M,L), 1 m orbit, clockwise"
}
midground:
${
  data.spatial_layout.midground ||
  "stone lanterns every 3 m, warm 2200 K glow on raked gravel"
}
background:
${
  data.spatial_layout.background ||
  "moss-stained vermilion torii, cedar silhouettes, thin crescent moon, drifting mist"
}

time_axis:
${formatTimeAxis(data.time_axis)}`;
    }
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
        tone: string;
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

  // Get the current selected segment from formData to ensure it's always up to date
  const currentSelectedSegment = selectedSegment
    ? formData.time_axis.find((segment) => segment.id === selectedSegment.id)
    : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>YAML Scene Generator</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.formSection}>
            <h2>Basic Information</h2>
            <div className={styles.inputGroup}>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  handleInputChange("title", "title", e.target.value)
                }
                placeholder="Enter scene title"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="synopsis">Synopsis:</label>
              <textarea
                id="synopsis"
                value={formData.synopsis}
                onChange={(e) =>
                  handleInputChange("synopsis", "synopsis", e.target.value)
                }
                placeholder="Enter scene synopsis"
                rows={4}
              />
            </div>
            <AutoGenerator
              title={formData.title}
              synopsis={formData.synopsis}
              onGenerate={handleGeneratedData}
            />
          </section>

          <section className={styles.formSection}>
            <h2>Visual & Audio</h2>
            <div className={styles.subSection}>
              <h3>Visual</h3>
              <div className={styles.inputGroup}>
                <label htmlFor="tone">Tone:</label>
                <input
                  type="text"
                  id="tone"
                  value={formData.visual_audio.visual.tone}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "visual",
                      "tone",
                      e.target.value
                    )
                  }
                  placeholder="e.g., neo-feudal cool"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="palette">Palette:</label>
                <input
                  type="text"
                  id="palette"
                  value={formData.visual_audio.visual.palette}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "visual",
                      "palette",
                      e.target.value
                    )
                  }
                  placeholder="e.g., indigo, obsidian, neon-turquoise, silver"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="keyFX">Key FX:</label>
                <input
                  type="text"
                  id="keyFX"
                  value={formData.visual_audio.visual.keyFX}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "visual",
                      "keyFX",
                      e.target.value
                    )
                  }
                  placeholder="e.g., plasma calligraphy glyphs"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="camera">Camera:</label>
                <input
                  type="text"
                  id="camera"
                  value={formData.visual_audio.visual.camera}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "visual",
                      "camera",
                      e.target.value
                    )
                  }
                  placeholder="e.g., slow push-in → whip-pan"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lighting">Lighting:</label>
                <input
                  type="text"
                  id="lighting"
                  value={formData.visual_audio.visual.lighting}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "visual",
                      "lighting",
                      e.target.value
                    )
                  }
                  placeholder="e.g., lantern rim-lights, ground fog"
                />
              </div>
            </div>
            <div className={styles.subSection}>
              <h3>Aural</h3>
              <div className={styles.inputGroup}>
                <label htmlFor="bgm">BGM:</label>
                <input
                  type="text"
                  id="bgm"
                  value={formData.visual_audio.aural.bgm}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "aural",
                      "bgm",
                      e.target.value
                    )
                  }
                  placeholder="e.g., hybrid taiko × sub-bass groove"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="sfx">SFX:</label>
                <textarea
                  id="sfx"
                  value={formData.visual_audio.aural.sfx}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "aural",
                      "sfx",
                      e.target.value
                    )
                  }
                  placeholder="e.g., parchment flutter, sword draw"
                  rows={3}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="ambience">Ambience:</label>
                <input
                  type="text"
                  id="ambience"
                  value={formData.visual_audio.aural.ambience}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "visual_audio",
                      "aural",
                      "ambience",
                      e.target.value
                    )
                  }
                  placeholder="e.g., distant cicadas, cool night air"
                />
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Spatial Layout</h2>
            <div className={styles.inputGroup}>
              <label htmlFor="main">Main:</label>
              <textarea
                id="main"
                value={formData.spatial_layout.main}
                onChange={(e) =>
                  handleInputChange("spatial_layout", "main", e.target.value)
                }
                placeholder="Describe the main subject"
                rows={3}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="foreground">Foreground:</label>
              <textarea
                id="foreground"
                value={formData.spatial_layout.foreground}
                onChange={(e) =>
                  handleInputChange(
                    "spatial_layout",
                    "foreground",
                    e.target.value
                  )
                }
                placeholder="Describe foreground elements"
                rows={2}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="midground">Midground:</label>
              <textarea
                id="midground"
                value={formData.spatial_layout.midground}
                onChange={(e) =>
                  handleInputChange(
                    "spatial_layout",
                    "midground",
                    e.target.value
                  )
                }
                placeholder="Describe midground elements"
                rows={2}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="background">Background:</label>
              <textarea
                id="background"
                value={formData.spatial_layout.background}
                onChange={(e) =>
                  handleInputChange(
                    "spatial_layout",
                    "background",
                    e.target.value
                  )
                }
                placeholder="Describe background elements"
                rows={2}
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Time Axis</h2>
            <Timeline
              totalDuration={8}
              segments={formData.time_axis}
              onSegmentChange={handleTimeAxisChange}
              onSegmentSelect={handleSegmentSelect}
              selectedSegmentId={selectedSegment?.id || null}
            />
            {currentSelectedSegment && (
              <div className={styles.segmentEditor}>
                <h3>
                  Edit Segment:{" "}
                  {formatTimeForInput(currentSelectedSegment.startTime)} -{" "}
                  {formatTimeForInput(currentSelectedSegment.endTime)}
                </h3>
                <div className={styles.timeInputs}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="startTime">Start Time:</label>
                    <div className={styles.timeCounter}>
                      <button
                        type="button"
                        className={styles.timeButton}
                        onClick={() => handleTimeDecrement("startTime")}
                        disabled={
                          currentSelectedSegment.startTime <= 0 ||
                          currentSelectedSegment.startTime >=
                            currentSelectedSegment.endTime - 0.1
                        }
                        title="Decrease start time by 0.1s (disabled at 0.0s or when too close to end time)"
                      >
                        −
                      </button>
                      <span className={styles.timeDisplay}>
                        {formatTimeForInput(currentSelectedSegment.startTime)}
                      </span>
                      <button
                        type="button"
                        className={styles.timeButton}
                        onClick={() => handleTimeIncrement("startTime")}
                        disabled={
                          currentSelectedSegment.startTime >=
                            currentSelectedSegment.endTime - 0.1 ||
                          currentSelectedSegment.startTime <= 0
                        }
                        title="Increase start time by 0.1s (disabled when too close to end time or at 0.0s)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="endTime">End Time:</label>
                    <div className={styles.timeCounter}>
                      <button
                        type="button"
                        className={styles.timeButton}
                        onClick={() => handleTimeDecrement("endTime")}
                        disabled={
                          currentSelectedSegment.endTime <=
                            currentSelectedSegment.startTime + 0.1 ||
                          currentSelectedSegment.endTime >= 8
                        }
                        title="Decrease end time by 0.1s (disabled when too close to start time or at 8.0s)"
                      >
                        −
                      </button>
                      <span className={styles.timeDisplay}>
                        {formatTimeForInput(currentSelectedSegment.endTime)}
                      </span>
                      <button
                        type="button"
                        className={styles.timeButton}
                        onClick={() => handleTimeIncrement("endTime")}
                        disabled={
                          currentSelectedSegment.endTime >= 8 ||
                          currentSelectedSegment.startTime <= 0
                        }
                        title="Increase end time by 0.1s (disabled at 8.0s or when start time is 0.0s)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="segmentAction">Action:</label>
                  <textarea
                    id="segmentAction"
                    value={currentSelectedSegment.action}
                    onChange={(e) => handleSegmentActionChange(e.target.value)}
                    placeholder="Describe the action for this time segment"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </section>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isGeneratingYaml}
          >
            {isGeneratingYaml ? "Generating..." : "Generate YAML"}
          </button>
        </form>

        {showYaml && (
          <section className={styles.yamlSection}>
            <div className={styles.yamlHeader}>
              <h2>Generated YAML</h2>
              <button
                type="button"
                onClick={handleCopyYaml}
                className={styles.copyButton}
              >
                {copySuccess ? "Copied!" : "Copy YAML"}
              </button>
            </div>
            <pre className={styles.yamlOutput}>{generatedYaml}</pre>
          </section>
        )}
      </main>
    </div>
  );
}
