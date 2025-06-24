"use client";

import styles from "../page.module.css";

type YamlOutputSectionProps = {
  yaml: string;
  showYaml: boolean;
  copySuccess: boolean;
  onCopy: () => void;
};

export default function YamlOutputSection({
  yaml,
  showYaml,
  copySuccess,
  onCopy,
}: YamlOutputSectionProps) {
  if (!showYaml) return null;

  return (
    <section className={styles.yamlSection}>
      <div className={styles.yamlHeader}>
        <h2>Generated YAML</h2>
        <button type="button" onClick={onCopy} className={styles.copyButton}>
          {copySuccess ? "Copied!" : "Copy YAML"}
        </button>
      </div>
      <pre className={styles.yamlOutput}>{yaml}</pre>
    </section>
  );
}
