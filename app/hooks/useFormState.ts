import {useState} from "react";
import {
  FormData,
  TimeSegment,
  OutputFormat,
  Scene,
  ReferenceInfo,
} from "../types";
import {generateYaml} from "../utils/yamlGenerator";

const createDefaultScene = (id: string, name: string): Scene => ({
  id,
  name,
  formData: {
    title: "",
    synopsis: "",
    visual_audio: {
      visual: {
        tone: [],
        palette: "",
        keyFX: "",
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
        camera: "slow push-in",
      },
      {
        id: "2",
        startTime: 2.0,
        endTime: 5.0,
        action: 'first katana slash; sparks sculpt "Y" and "A"; orbit quickens',
        camera: "steady medium shot",
      },
      {
        id: "3",
        startTime: 5.0,
        endTime: 7.0,
        action:
          'second slash forges "M" and "L"; letters align above blade tip',
        camera: "close-up on blade",
      },
      {
        id: "4",
        startTime: 7.0,
        endTime: 8.0,
        action:
          'glyphs fuse into blazing "YAML" sigil; bright flash → iris-out',
        camera: "wide shot with iris-out",
      },
    ],
  },
  lockState: {
    title: false,
    synopsis: false,
    visual_audio: {
      visual: {
        tone: false,
        palette: false,
        keyFX: false,
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
  },
  selectedSegment: null,
  outputFormat: "yaml",
  generatedContent: "",
  generatedJapanese: "",
  showOutput: false,
  copySuccess: false,
  isGenerating: false,
  references: [],
});

export const useFormState = () => {
  const [scenes, setScenes] = useState<Scene[]>([
    createDefaultScene("1", "Scene 1"),
  ]);
  const [activeSceneId, setActiveSceneId] = useState<string>("1");

  // 現在のアクティブなSceneを取得
  const activeScene =
    scenes.find((scene) => scene.id === activeSceneId) || scenes[0];

  // 現在のSceneの状態を取得
  const {
    formData,
    lockState,
    selectedSegment,
    outputFormat,
    generatedContent,
    generatedJapanese,
    showOutput,
    copySuccess,
    isGenerating,
  } = activeScene;

  const [apiKey, setApiKey] = useState<string>("");

  // Scene管理のハンドラー
  const handleSceneChange = (sceneId: string) => {
    setActiveSceneId(sceneId);
  };

  const handleSceneCreate = () => {
    const newId = (
      Math.max(...scenes.map((s) => parseInt(s.id))) + 1
    ).toString();
    const newScene = createDefaultScene(newId, `Scene ${newId}`);
    setScenes((prev) => [...prev, newScene]);
    setActiveSceneId(newId);
  };

  const handleSceneDelete = (sceneId: string) => {
    if (scenes.length <= 1) return;

    setScenes((prev) => {
      const newScenes = prev.filter((scene) => scene.id !== sceneId);
      if (activeSceneId === sceneId) {
        setActiveSceneId(newScenes[0].id);
      }
      return newScenes;
    });
  };

  const handleSceneRename = (sceneId: string, newName: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? {...scene, name: newName} : scene
      )
    );
  };

  // Sceneの状態を更新するヘルパー関数
  const updateActiveScene = (updates: Partial<Scene>) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === activeSceneId ? {...scene, ...updates} : scene
      )
    );
  };

  const handleInputChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    const newFormData = {
      ...formData,
      [section]:
        section === "spatial_layout"
          ? {...formData[section], [field]: value}
          : value,
    };
    updateActiveScene({formData: newFormData});
  };

  const handleNestedInputChange = (
    section: "visual_audio",
    subsection: "visual" | "aural",
    field: string,
    value: string | string[]
  ) => {
    const newFormData = {
      ...formData,
      visual_audio: {
        ...formData.visual_audio,
        [subsection]: {
          ...formData.visual_audio[subsection],
          [field]: value,
        },
      },
    };
    updateActiveScene({formData: newFormData});
  };

  const handleTimeAxisChange = (segments: TimeSegment[]) => {
    const newFormData = {
      ...formData,
      time_axis: segments,
    };
    updateActiveScene({formData: newFormData});
  };

  const handleSegmentSelect = (segment: TimeSegment | null) => {
    updateActiveScene({selectedSegment: segment});
  };

  const handleSegmentActionChange = (action: string) => {
    if (!selectedSegment) return;

    const newFormData = {
      ...formData,
      time_axis: formData.time_axis.map((segment) =>
        segment.id === selectedSegment.id ? {...segment, action} : segment
      ),
    };
    updateActiveScene({
      formData: newFormData,
      selectedSegment: selectedSegment ? {...selectedSegment, action} : null,
    });
  };

  const handleSegmentCameraChange = (camera: string) => {
    if (!selectedSegment) return;

    const newFormData = {
      ...formData,
      time_axis: formData.time_axis.map((segment) =>
        segment.id === selectedSegment.id ? {...segment, camera} : segment
      ),
    };
    updateActiveScene({
      formData: newFormData,
      selectedSegment: selectedSegment ? {...selectedSegment, camera} : null,
    });
  };

  const handleSegmentTimeChange = (
    field: "startTime" | "endTime",
    value: number
  ) => {
    if (!selectedSegment) return;

    const minTime = field === "startTime" ? 0 : selectedSegment.startTime + 0.1;
    const maxTime = field === "endTime" ? 8 : selectedSegment.endTime - 0.1;
    const constrainedValue = Math.max(minTime, Math.min(maxTime, value));

    const newFormData = {
      ...formData,
      time_axis: formData.time_axis.map((segment) => {
        if (segment.id === selectedSegment.id) {
          return {...segment, [field]: Math.round(constrainedValue * 10) / 10};
        }
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
    };
    updateActiveScene({formData: newFormData});
  };

  const handleTimeIncrement = (field: "startTime" | "endTime") => {
    if (!selectedSegment) return;
    handleSegmentTimeChange(field, selectedSegment[field] + 0.1);
  };

  const handleTimeDecrement = (field: "startTime" | "endTime") => {
    if (!selectedSegment) return;
    handleSegmentTimeChange(field, selectedSegment[field] - 0.1);
  };

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      updateActiveScene({copySuccess: true});
      setTimeout(() => {
        updateActiveScene({copySuccess: false});
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveScene({isGenerating: true});

    generateYaml(formData)
      .then((result) => {
        updateActiveScene({
          generatedContent: result,
          showOutput: true,
          isGenerating: false,
        });
      })
      .catch((error) => {
        console.error("Error generating YAML:", error);
        updateActiveScene({isGenerating: false});
      });
  };

  const handleGeneratedData = (data: Partial<FormData>) => {
    const newFormData = {...formData, ...data};
    updateActiveScene({formData: newFormData});
  };

  const handleLockToggle = (
    section: string,
    field: string,
    subsection?: string
  ) => {
    const newLockState = {...lockState};

    if (section === "visual_audio" && subsection) {
      if (subsection === "visual") {
        const visualField =
          field as keyof typeof newLockState.visual_audio.visual;
        newLockState.visual_audio.visual[visualField] =
          !newLockState.visual_audio.visual[visualField];
      } else if (subsection === "aural") {
        const auralField =
          field as keyof typeof newLockState.visual_audio.aural;
        newLockState.visual_audio.aural[auralField] =
          !newLockState.visual_audio.aural[auralField];
      }
    } else if (section === "spatial_layout") {
      const spatialField = field as keyof typeof newLockState.spatial_layout;
      newLockState.spatial_layout[spatialField] =
        !newLockState.spatial_layout[spatialField];
    } else if (section === "title") {
      newLockState.title = !newLockState.title;
    } else if (section === "synopsis") {
      newLockState.synopsis = !newLockState.synopsis;
    } else if (section === "time_axis") {
      newLockState.time_axis = !newLockState.time_axis;
    }

    updateActiveScene({lockState: newLockState});
  };

  const handleFieldUpdate = async (field: string, direction?: string) => {
    // APIキーが設定されていない場合は、環境変数に依存するAPIルートに任せる
    if (!apiKey) {
      console.log("No custom API key provided, using environment variable");
    }

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
      } else if (field === "segmentCamera" && selectedSegment) {
        currentValue = selectedSegment.camera;
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
        ...(apiKey && {customApiKey: apiKey}),
      };

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
      } else if (field === "segmentCamera" && selectedSegment) {
        handleSegmentCameraChange(data.updatedValue);
      }
    } catch (error) {
      console.error("Field update error:", error);
      alert("フィールドの更新に失敗しました");
    }
  };

  const setOutputFormat = (format: OutputFormat) => {
    updateActiveScene({outputFormat: format});
  };

  // 引用機能のヘルパー関数
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldValueByPath = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setFieldValueByPath = (obj: any, path: string, value: any): any => {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => current[key], obj);
    target[lastKey] = value;
    return obj;
  };

  const handleReference = (sourceSceneId: string, fieldPath: string) => {
    const sourceScene = scenes.find((scene) => scene.id === sourceSceneId);
    if (!sourceScene) return;

    // 引用元の値を取得
    const sourceValue = getFieldValueByPath(sourceScene.formData, fieldPath);

    // 現在のシーンの値を更新
    const newFormData = {...formData};
    setFieldValueByPath(newFormData, fieldPath, sourceValue);

    // 引用情報を更新
    const newReference: ReferenceInfo = {
      sourceSceneId,
      sourceSceneName: sourceScene.name,
      referencedAt: new Date().toISOString(),
      fieldPath,
    };

    // 既存の引用情報を更新または追加
    const existingReferences = activeScene.references.filter(
      (ref) => ref.fieldPath !== fieldPath
    );
    const updatedReferences = [...existingReferences, newReference];

    updateActiveScene({
      formData: newFormData,
      references: updatedReferences,
    });
  };

  // 引用情報を取得するヘルパー関数
  const getReferenceInfo = (fieldPath: string) => {
    return activeScene.references.find((ref) => ref.fieldPath === fieldPath);
  };

  // 引用されているかどうかをチェックするヘルパー関数
  const isFieldReferenced = (fieldPath: string) => {
    return activeScene.references.some((ref) => ref.fieldPath === fieldPath);
  };

  return {
    // Scene管理
    scenes,
    activeSceneId,
    handleSceneChange,
    handleSceneCreate,
    handleSceneDelete,
    handleSceneRename,

    // 現在のSceneの状態
    formData,
    lockState,
    selectedSegment,
    outputFormat,
    generatedContent,
    generatedJapanese,
    showOutput,
    copySuccess,
    isGenerating,
    apiKey,

    // 引用機能
    handleReference,
    getReferenceInfo,
    isFieldReferenced,

    // ハンドラー
    setOutputFormat,
    setApiKey,
    handleInputChange,
    handleNestedInputChange,
    handleTimeAxisChange,
    handleSegmentSelect,
    handleSegmentActionChange,
    handleSegmentCameraChange,
    handleTimeIncrement,
    handleTimeDecrement,
    handleCopyYaml,
    handleSubmit,
    handleGeneratedData,
    handleLockToggle,
    handleFieldUpdate,
  };
};
