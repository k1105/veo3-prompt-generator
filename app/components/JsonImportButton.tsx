"use client";

import {useState, useRef} from "react";
import {Icon} from "@iconify/react";
import {MultiSceneFormData} from "../types";
import {readJsonFile, importFromJson} from "../utils/jsonExporter";

type JsonImportButtonProps = {
  onImport: (formData: MultiSceneFormData) => void;
  disabled?: boolean;
};

export default function JsonImportButton({
  onImport,
  disabled = false,
}: JsonImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (disabled || isImporting) return;

    setIsImporting(true);
    try {
      const json = await readJsonFile(file);
      const formData = importFromJson(json);
      onImport(formData);
    } catch (error) {
      console.error("Failed to import JSON:", error);
      alert("JSONインポートに失敗しました。ファイル形式を確認してください。");
    } finally {
      setIsImporting(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (disabled || isImporting) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{display: "none"}}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isImporting}
        className="json-import-button"
        title="Import from JSON"
      >
        <Icon
          icon={isImporting ? "mdi:loading" : "mdi:upload"}
          style={{fontSize: "1.2rem"}}
          className={isImporting ? "spin" : ""}
        />
        {isImporting ? "Importing..." : "Import JSON"}
      </button>
    </>
  );
}
