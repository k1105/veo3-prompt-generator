import {useState} from "react";
import {
  FormData,
  TimeSegment,
  OutputFormat,
  Scene,
  ReferenceInfo,
  Character,
  VisualStyle,
  AudioDesign,
} from "../types";
import {generateYaml} from "../utils/yamlGenerator";

const createDefaultScene = (id: string, name: string): Scene => ({
  id,
  name,
  formData: {
    title: "",
    concept: "",
    summary: "",
    characters: [],
    setting: {
      location: "",
      timeOfDay: "",
      weather: "",
      backgroundElements: "",
    },
    visualStyle: {
      style: "",
      palette: "",
      lighting: "",
      cameraStyle: "",
    },
    audioDesign: {
      bgm: "",
      sfx: "",
      ambience: "",
      dialogue: "",
      voiceover: "",
    },
    time_axis: [],
  },
  lockState: {
    title: false,
    concept: false,
    summary: false,
    characters: false,
    setting: {
      location: false,
      timeOfDay: false,
      weather: false,
      backgroundElements: false,
    },
    visualStyle: {
      style: false,
      palette: false,
      lighting: false,
      cameraStyle: false,
    },
    audioDesign: {
      bgm: false,
      sfx: false,
      ambience: false,
      dialogue: false,
      voiceover: false,
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
        section === "setting" ? {...formData[section], [field]: value} : value,
    };
    updateActiveScene({formData: newFormData});
  };

  const handleCharactersChange = (characters: Character[]) => {
    const newFormData = {
      ...formData,
      characters,
    };
    updateActiveScene({formData: newFormData});
  };

  const handleVisualStyleChange = (field: keyof VisualStyle, value: string) => {
    const newFormData = {
      ...formData,
      visualStyle: {
        ...formData.visualStyle,
        [field]: value,
      },
    };
    updateActiveScene({formData: newFormData});
  };

  const handleAudioDesignChange = (field: keyof AudioDesign, value: string) => {
    const newFormData = {
      ...formData,
      audioDesign: {
        ...formData.audioDesign,
        [field]: value,
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

    if (outputFormat === "descriptive") {
      // Descriptive形式の場合はプロンプト生成APIを呼び出し
      fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formData,
          apiKey,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          updateActiveScene({
            generatedContent: result.prompt,
            generatedJapanese: result.japanese,
            showOutput: true,
            isGenerating: false,
          });
        })
        .catch((error) => {
          console.error("Error generating prompt:", error);
          updateActiveScene({isGenerating: false});
        });
    } else {
      // YAML形式の場合は従来のgenerateYaml関数を使用
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
    }
  };

  const handleGeneratedData = (data: FormData) => {
    updateActiveScene({formData: data});
  };

  const handleLockToggle = (section: string, field: string) => {
    const newLockState = {...lockState};

    if (section === "visualStyle") {
      const visualStyleField = field as keyof typeof newLockState.visualStyle;
      newLockState.visualStyle[visualStyleField] =
        !newLockState.visualStyle[visualStyleField];
    } else if (section === "audioDesign") {
      const audioDesignField = field as keyof typeof newLockState.audioDesign;
      newLockState.audioDesign[audioDesignField] =
        !newLockState.audioDesign[audioDesignField];
    } else if (section === "setting") {
      const settingField = field as keyof typeof newLockState.setting;
      newLockState.setting[settingField] = !newLockState.setting[settingField];
    } else if (section === "characters") {
      newLockState.characters = !newLockState.characters;
    } else if (section === "title") {
      newLockState.title = !newLockState.title;
    } else if (section === "concept") {
      newLockState.concept = !newLockState.concept;
    } else if (section === "summary") {
      newLockState.summary = !newLockState.summary;
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
      } else if (field === "concept") {
        currentValue = formData.concept;
      } else if (field === "summary") {
        currentValue = formData.summary;
      } else if (field.startsWith("visualStyle.")) {
        const visualStyleField = field.split(
          "."
        )[1] as keyof FormData["visualStyle"];
        currentValue = Array.isArray(formData.visualStyle[visualStyleField])
          ? formData.visualStyle[visualStyleField].join(", ")
          : formData.visualStyle[visualStyleField];
      } else if (field.startsWith("audioDesign.")) {
        const audioDesignField = field.split(
          "."
        )[1] as keyof FormData["audioDesign"];
        currentValue = formData.audioDesign[audioDesignField];
      } else if (field.startsWith("setting.")) {
        const settingField = field.split(".")[1] as keyof FormData["setting"];
        currentValue = formData.setting[settingField];
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
        context: `Title: ${formData.title}, Concept: ${formData.concept}, Summary: ${formData.summary}`,
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
      } else if (field === "concept") {
        handleInputChange("concept", "concept", data.updatedValue);
      } else if (field === "summary") {
        handleInputChange("summary", "summary", data.updatedValue);
      } else if (field.startsWith("visualStyle.")) {
        const visualStyleField = field.split(
          "."
        )[1] as keyof FormData["visualStyle"];
        handleVisualStyleChange(visualStyleField, data.updatedValue);
      } else if (field.startsWith("audioDesign.")) {
        const audioDesignField = field.split(
          "."
        )[1] as keyof FormData["audioDesign"];
        handleAudioDesignChange(audioDesignField, data.updatedValue);
      } else if (field.startsWith("setting.")) {
        const settingField = field.split(".")[1] as keyof FormData["setting"];
        handleInputChange("setting", settingField, data.updatedValue);
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
    handleVisualStyleChange,
    handleAudioDesignChange,
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
    handleCharactersChange,
  };
};
