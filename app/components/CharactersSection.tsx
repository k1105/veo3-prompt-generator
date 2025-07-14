"use client";

import styles from "../page.module.css";
import FormField from "./FormField";
import ReferenceButton from "./ReferenceButton";
import {Character, Scene} from "../types";
import LockButton from "./LockButton";

type CharactersSectionProps = {
  characters: Character[];
  onChange: (characters: Character[]) => void;
  lockState?: boolean;
  onLockToggle?: () => void;
  onUpdate?: (field: string, direction?: string) => Promise<void>;
  scenes: Scene[];
  activeSceneId: string;
  onReference: (sourceSceneId: string, fieldPath: string) => void;
  getReferenceInfo: (fieldPath: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isFieldReferenced: (fieldPath: string) => boolean;
};

export default function CharactersSection({
  characters,
  onChange,
  lockState = false,
  onLockToggle,
  onUpdate,
  scenes,
  activeSceneId,
  onReference,
  getReferenceInfo,
  isFieldReferenced,
}: CharactersSectionProps) {
  const handleCharacterChange = (
    index: number,
    field: keyof Character,
    value: string
  ) => {
    const newCharacters = [...characters];
    newCharacters[index] = {
      ...newCharacters[index],
      [field]: value,
    };
    onChange(newCharacters);
  };

  const addCharacter = () => {
    const newCharacter: Character = {
      name: "",
      description: "",
    };
    onChange([...characters, newCharacter]);
  };

  const removeCharacter = (index: number) => {
    const newCharacters = characters.filter((_, i) => i !== index);
    onChange(newCharacters);
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h2>キャラクター</h2>
        <div className={styles.headerButtons}>
          <ReferenceButton
            currentSceneId={activeSceneId}
            scenes={scenes}
            fieldPath="characters"
            onReference={onReference}
            isReferenced={isFieldReferenced("characters")}
            referenceInfo={getReferenceInfo("characters")}
          />
          {onLockToggle && (
            <LockButton locked={lockState} onToggle={onLockToggle} />
          )}
        </div>
      </div>

      {characters.map((character, index) => (
        <div key={index} className={styles.characterCard}>
          <div className={styles.characterHeader}>
            <h3>キャラクター {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeCharacter(index)}
              className={styles.removeButton}
              disabled={lockState}
            >
              削除
            </button>
          </div>
          <FormField
            id={`character-${index}-name`}
            label="名前"
            value={character.name}
            onChange={(value) =>
              handleCharacterChange(index, "name", value as string)
            }
            placeholder="キャラクターの名前"
            locked={lockState}
            onUpdate={onUpdate}
            fieldKey={`characters.${index}.name`}
          />
          <FormField
            id={`character-${index}-description`}
            label="説明"
            value={character.description}
            onChange={(value) =>
              handleCharacterChange(index, "description", value as string)
            }
            placeholder="キャラクターの外見や特徴"
            type="textarea"
            rows={3}
            locked={lockState}
            onUpdate={onUpdate}
            fieldKey={`characters.${index}.description`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addCharacter}
        className={styles.addButton}
        disabled={lockState}
      >
        + キャラクターを追加
      </button>
    </section>
  );
}
