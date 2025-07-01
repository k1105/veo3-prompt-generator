"use client";

import styles from "./page.module.css";
import OutputSection from "./components/YamlOutputSection";
import FloatingGenerator from "./components/FloatingGenerator";
import ApiKeyManager from "./components/ApiKeyManager";
import PromptForm from "./components/PromptForm";
import SceneManager from "./components/SceneManager";
import {useFormState} from "./hooks/useFormState";

export default function Home() {
  const {
    scenes,
    activeSceneId,
    handleSceneChange,
    handleSceneCreate,
    handleSceneDelete,
    handleSceneRename,
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
    handleReference,
    getReferenceInfo,
    isFieldReferenced,
  } = useFormState();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SceneManager
          scenes={scenes}
          activeSceneId={activeSceneId}
          onSceneChange={handleSceneChange}
          onSceneCreate={handleSceneCreate}
          onSceneDelete={handleSceneDelete}
          onSceneRename={handleSceneRename}
        />

        <PromptForm
          formData={formData}
          lockState={lockState}
          selectedSegment={selectedSegment}
          outputFormat={outputFormat}
          isGenerating={isGenerating}
          apiKey={apiKey}
          scenes={scenes}
          activeSceneId={activeSceneId}
          onInputChange={handleInputChange}
          onNestedInputChange={handleNestedInputChange}
          onTimeAxisChange={handleTimeAxisChange}
          onSegmentSelect={handleSegmentSelect}
          onSegmentActionChange={handleSegmentActionChange}
          onSegmentCameraChange={handleSegmentCameraChange}
          onTimeIncrement={handleTimeIncrement}
          onTimeDecrement={handleTimeDecrement}
          onLockToggle={handleLockToggle}
          onFieldUpdate={handleFieldUpdate}
          onOutputFormatChange={setOutputFormat}
          onSubmit={handleSubmit}
          onReference={handleReference}
          getReferenceInfo={getReferenceInfo}
          isFieldReferenced={isFieldReferenced}
        />

        <OutputSection
          content={generatedContent}
          japanese={generatedJapanese}
          showOutput={showOutput}
          copySuccess={copySuccess}
          outputFormat={outputFormat}
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
