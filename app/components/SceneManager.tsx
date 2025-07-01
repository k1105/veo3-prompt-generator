"use client";

import {useState} from "react";
import styles from "./SceneManager.module.css";
import {Scene} from "../types";

interface SceneManagerProps {
  scenes: Scene[];
  activeSceneId: string;
  onSceneChange: (sceneId: string) => void;
  onSceneCreate: () => void;
  onSceneDelete: (sceneId: string) => void;
  onSceneRename: (sceneId: string, newName: string) => void;
}

export default function SceneManager({
  scenes,
  activeSceneId,
  onSceneChange,
  onSceneCreate,
  onSceneDelete,
  onSceneRename,
}: SceneManagerProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleEditStart = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditingName(scene.name);
  };

  const handleEditSave = () => {
    if (editingSceneId && editingName.trim()) {
      onSceneRename(editingSceneId, editingName.trim());
    }
    setEditingSceneId(null);
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingSceneId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleDelete = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    if (scenes.length > 1) {
      onSceneDelete(sceneId);
    }
  };

  return (
    <div className={styles.sceneManager}>
      <div className={styles.sceneTabs}>
        <div className={styles.tabContainer}>
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className={`${styles.sceneTab} ${
                scene.id === activeSceneId ? styles.active : ""
              }`}
              onClick={() => onSceneChange(scene.id)}
            >
              {editingSceneId === scene.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleEditSave}
                  className={styles.editInput}
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className={styles.sceneName}
                    onDoubleClick={() => handleEditStart(scene)}
                  >
                    {scene.name}
                  </span>
                  {scenes.length > 1 && (
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDelete(e, scene.id)}
                      title="Delete scene"
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <button
          className={styles.createButton}
          onClick={onSceneCreate}
          title="Create new scene"
        >
          + New Scene
        </button>
      </div>
    </div>
  );
}
