"use client";

import {useState} from "react";
import {Icon} from "@iconify/react";
import {MultiSceneFormData} from "../types";
import {exportToJson, downloadJson} from "../utils/jsonExporter";

type JsonExportButtonProps = {
  formData: MultiSceneFormData;
  disabled?: boolean;
};

export default function JsonExportButton({
  formData,
  disabled = false,
}: JsonExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    try {
      const json = exportToJson(formData);
      downloadJson(json);
    } catch (error) {
      console.error("Failed to export JSON:", error);
      alert("JSONエクスポートに失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="json-export-button"
      title="Export as JSON"
    >
      <Icon
        icon={isExporting ? "mdi:loading" : "mdi:download"}
        style={{fontSize: "1.2rem"}}
        className={isExporting ? "spin" : ""}
      />
      {isExporting ? "Exporting..." : "Export JSON"}
    </button>
  );
}
