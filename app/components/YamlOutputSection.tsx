"use client";

import styles from "../page.module.css";

type OutputSectionProps = {
  content: string;
  japanese?: string;
  showOutput: boolean;
  copySuccess: boolean;
  outputFormat: "yaml" | "descriptive";
  onCopy: () => void;
};

export default function OutputSection({
  content,
  japanese,
  showOutput,
  copySuccess,
  outputFormat,
  onCopy,
}: OutputSectionProps) {
  if (!showOutput) return null;

  return (
    <section className={styles.outputSection}>
      <div className={styles.outputHeader}>
        <h2>
          Generated {outputFormat === "yaml" ? "YAML" : "Descriptive Prompt"}
        </h2>
        <button type="button" onClick={onCopy} className={styles.copyButton}>
          {copySuccess
            ? "Copied!"
            : `Copy ${outputFormat === "yaml" ? "YAML" : "Prompt"}`}
        </button>
      </div>
      <div className={styles.outputContent}>
        {outputFormat === "descriptive" && japanese ? (
          <div>
            <div className={styles.promptSection}>
              <h3>English Prompt:</h3>
              <pre>{content}</pre>
            </div>
            <div className={styles.promptSection}>
              <h3>日本語訳:</h3>
              <pre>{japanese}</pre>
            </div>
          </div>
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </section>
  );
}
