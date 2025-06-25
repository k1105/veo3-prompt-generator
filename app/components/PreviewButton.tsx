"use client";

import {useState, useEffect} from "react";
import {TimeSegment, VisualAudio, SpatialLayout} from "../types";
import {generateImagePrompt} from "../utils/imagePromptGenerator";

type PreviewButtonProps = {
  segment: TimeSegment;
  visualAudio: VisualAudio;
  spatialLayout: SpatialLayout;
  title: string;
  synopsis: string;
  apiKey: string;
};

export default function PreviewButton({
  segment,
  visualAudio,
  spatialLayout,
  title,
  synopsis,
  apiKey,
}: PreviewButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // セグメントが変更された際にプレビューをクリア
  useEffect(() => {
    setPreviewImage(null);
    setTextDescription(null);
    setError(null);
  }, [segment.id]);

  const handlePreview = async () => {
    // 既に画像が生成されている場合は確認を求める
    if (previewImage && !isGenerating) {
      const shouldRegenerate = window.confirm(
        "画像が既に生成されています。再生成しますか？"
      );
      if (!shouldRegenerate) {
        return;
      }
    }

    setIsGenerating(true);
    setError(null);
    setPreviewImage(null);
    setTextDescription(null);

    try {
      const prompt = generateImagePrompt(
        segment,
        visualAudio,
        spatialLayout,
        title,
        synopsis
      );

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          apiKey: apiKey || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.imageData) {
        setPreviewImage(data.imageData);
      } else if (data.textDescription) {
        setTextDescription(data.textDescription);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate preview"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearPreview = () => {
    setPreviewImage(null);
    setTextDescription(null);
    setError(null);
  };

  return (
    <div className="preview-container">
      <div className="preview-controls">
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className="preview-button"
          title="Generate preview image with Gemini"
        >
          {isGenerating
            ? "Generating..."
            : previewImage
            ? "Regenerate"
            : "Preview"}
        </button>
        {previewImage && (
          <button
            onClick={handleClearPreview}
            disabled={isGenerating}
            className="clear-button"
            title="Clear preview image"
          >
            Clear
          </button>
        )}
      </div>

      {error && <div className="preview-error">{error}</div>}

      {previewImage && (
        <div className="preview-image-container">
          <img
            src={previewImage}
            alt={`Preview for ${segment.action}`}
            className="preview-image"
          />
        </div>
      )}

      {textDescription && (
        <div className="preview-description-container">
          <div className="preview-description">{textDescription}</div>
        </div>
      )}

      <style jsx>{`
        .preview-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preview-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .preview-button {
          padding: 8px 16px;
          font-size: 14px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .preview-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .preview-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .preview-error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 4px;
        }

        .preview-image-container {
          margin-top: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          max-width: 400px;
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .preview-description-container {
          margin-top: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          background: #f8f9fa;
        }

        .preview-description {
          font-size: 14px;
          line-height: 1.4;
          color: #333;
          word-wrap: break-word;
        }

        .clear-button {
          padding: 8px 16px;
          font-size: 14px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .clear-button:hover:not(:disabled) {
          background: #5a6268;
        }

        .clear-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
