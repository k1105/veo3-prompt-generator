"use client";

import {OutputFormat} from "../types";
import styles from "../page.module.css";

type OutputFormatSelectorProps = {
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
};

export default function OutputFormatSelector({
  outputFormat,
  onOutputFormatChange,
}: OutputFormatSelectorProps) {
  return (
    <div className={styles.outputFormatSelector}>
      <div className={styles.formatSection}>
        <h3>Output Format</h3>
        <div className={styles.formatOptions}>
          <label className={styles.formatOption}>
            <input
              type="radio"
              name="outputFormat"
              value="yaml"
              checked={outputFormat === "yaml"}
              onChange={(e) =>
                onOutputFormatChange(e.target.value as OutputFormat)
              }
            />
            <span>YAML</span>
          </label>
          <label className={styles.formatOption}>
            <input
              type="radio"
              name="outputFormat"
              value="descriptive"
              checked={outputFormat === "descriptive"}
              onChange={(e) =>
                onOutputFormatChange(e.target.value as OutputFormat)
              }
            />
            <span>Descriptive</span>
          </label>
        </div>
      </div>
    </div>
  );
}
