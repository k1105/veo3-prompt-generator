"use client";

import {useState} from "react";
import styles from "./page.module.css";
import OutputSection from "./components/YamlOutputSection";
import ChatContainer from "./components/ChatContainer";
import ApiKeyManager from "./components/ApiKeyManager";
import ApiKeyModal from "./components/ApiKeyModal";
import PromptForm from "./components/PromptForm";
import SceneManager from "./components/SceneManager";
import {useFormState} from "./hooks/useFormState";
import GenerateButton from "./components/GenerateButton";

export default function Home() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

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
    handleReference,
    getReferenceInfo,
    isFieldReferenced,
  } = useFormState();

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <SceneManager
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSceneChange={handleSceneChange}
            onSceneCreate={handleSceneCreate}
            onSceneDelete={handleSceneDelete}
            onSceneRename={handleSceneRename}
          />
          <GenerateButton
            formData={formData}
            lockState={lockState}
            onGenerate={handleGeneratedData}
            apiKey={apiKey}
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
            onVisualStyleChange={handleVisualStyleChange}
            onAudioDesignChange={handleAudioDesignChange}
            onTimeAxisChange={handleTimeAxisChange}
            onSegmentSelect={handleSegmentSelect}
            onSegmentActionChange={handleSegmentActionChange}
            onSegmentCameraChange={handleSegmentCameraChange}
            onTimeIncrement={handleTimeIncrement}
            onTimeDecrement={handleTimeDecrement}
            onLockToggle={handleLockToggle}
            onFieldUpdate={handleFieldUpdate}
            onCharactersChange={handleCharactersChange}
            onOutputFormatChange={setOutputFormat}
            onSubmit={handleSubmit}
            onGeneratedData={handleGeneratedData}
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
        </div>
        <div className={styles.chatContainer}>
          <ChatContainer
            formData={formData}
            onGenerate={handleGeneratedData}
            apiKey={apiKey}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <ApiKeyManager
          onOpen={() => setIsApiKeyModalOpen(true)}
          currentApiKey={apiKey}
        />
      </footer>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onApiKeySet={handleApiKeySet}
      />
    </div>
  );
}
