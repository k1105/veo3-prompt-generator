"use client";

import {useState, useRef, useEffect} from "react";
import styles from "./Timeline.module.css";
import {TimeSegment} from "../types";

type TimelineProps = {
  totalDuration: number;
  segments: TimeSegment[];
  onSegmentChange: (segments: TimeSegment[]) => void;
  onSegmentSelect: (segment: TimeSegment | null) => void;
  selectedSegmentId: string | null;
};

export default function Timeline({
  totalDuration,
  segments,
  onSegmentChange,
  onSegmentSelect,
  selectedSegmentId,
}: TimelineProps) {
  const [isDraggingCutPoint, setIsDraggingCutPoint] = useState(false);
  const [draggedCutPointIndex, setDraggedCutPointIndex] = useState<number>(-1);
  const timelineRef = useRef<HTMLDivElement>(null);

  const roundToNearestTenth = (time: number) => {
    return Math.round(time * 10) / 10;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  const getTimeFromPosition = (x: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const position = (x - rect.left) / rect.width;
    const time = Math.max(0, Math.min(totalDuration, position * totalDuration));
    return roundToNearestTenth(time);
  };

  // Get cut points (times where segments change)
  const getCutPoints = () => {
    const points = [0]; // Start at 0
    segments.forEach((segment) => {
      points.push(segment.endTime);
    });
    return points;
  };

  const handleSegmentClick = (e: React.MouseEvent, segment: TimeSegment) => {
    e.stopPropagation();
    onSegmentSelect(segment);
  };

  const handleCutPointMouseDown = (
    e: React.MouseEvent,
    cutPointIndex: number
  ) => {
    e.stopPropagation();
    setIsDraggingCutPoint(true);
    setDraggedCutPointIndex(cutPointIndex);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCutPoint || draggedCutPointIndex === -1) return;

    const newTime = getTimeFromPosition(e.clientX);
    const cutPoints = getCutPoints();

    // Ensure cut point stays within bounds and doesn't overlap with adjacent points
    const minTime =
      draggedCutPointIndex > 0 ? cutPoints[draggedCutPointIndex - 1] + 0.1 : 0;
    const maxTime =
      draggedCutPointIndex < cutPoints.length - 1
        ? cutPoints[draggedCutPointIndex + 1] - 0.1
        : totalDuration;

    const constrainedTime = Math.max(minTime, Math.min(maxTime, newTime));

    // Update segments based on the new cut point position
    const updatedSegments = segments.map((segment, index) => {
      if (index === draggedCutPointIndex - 1) {
        // Update end time of previous segment
        return {
          ...segment,
          endTime: roundToNearestTenth(constrainedTime),
        };
      } else if (index === draggedCutPointIndex) {
        // Update start time of current segment
        return {
          ...segment,
          startTime: roundToNearestTenth(constrainedTime),
        };
      }
      return segment;
    });

    onSegmentChange(updatedSegments);
  };

  const handleMouseUp = () => {
    setIsDraggingCutPoint(false);
    setDraggedCutPointIndex(-1);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    const clickTime = getTimeFromPosition(e.clientX);

    // Find the segment that was clicked
    const clickedSegmentIndex = segments.findIndex(
      (segment) => clickTime >= segment.startTime && clickTime < segment.endTime
    );

    if (clickedSegmentIndex !== -1) {
      onSegmentSelect(segments[clickedSegmentIndex]);
    } else {
      onSegmentSelect(null);
    }
  };

  const handleAddCutPoint = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clickTime = getTimeFromPosition(e.clientX);
    const cutPoints = getCutPoints();

    // Find where to insert the new cut point
    let insertIndex = 0;
    for (let i = 0; i < cutPoints.length; i++) {
      if (clickTime > cutPoints[i]) {
        insertIndex = i + 1;
      }
    }

    // Ensure minimum spacing
    const minSpacing = 0.1;
    const prevTime = insertIndex > 0 ? cutPoints[insertIndex - 1] : 0;
    const nextTime =
      insertIndex < cutPoints.length ? cutPoints[insertIndex] : totalDuration;

    if (
      clickTime - prevTime < minSpacing ||
      nextTime - clickTime < minSpacing
    ) {
      return; // Too close to existing cut points
    }

    // Create new segment
    const newSegmentId = `segment-${Date.now()}`;
    const newSegment: TimeSegment = {
      id: newSegmentId,
      startTime: roundToNearestTenth(clickTime),
      endTime: roundToNearestTenth(nextTime),
      action: "New scene",
    };

    // Update existing segment
    const updatedSegments = segments.map((segment, index) => {
      if (index === insertIndex - 1) {
        return {
          ...segment,
          endTime: roundToNearestTenth(clickTime),
        };
      }
      return segment;
    });

    // Insert new segment
    updatedSegments.splice(insertIndex, 0, newSegment);
    onSegmentChange(updatedSegments);
    onSegmentSelect(newSegment);
  };

  const handleRemoveSegment = (segmentId: string) => {
    const segmentIndex = segments.findIndex((s) => s.id === segmentId);
    if (segmentIndex === -1 || segments.length <= 1) return;

    const updatedSegments = [...segments];
    const removedSegment = updatedSegments[segmentIndex];

    // Remove the segment
    updatedSegments.splice(segmentIndex, 1);

    // Handle the time gap created by removing the segment
    if (segmentIndex === 0) {
      // If removing the first segment, set the new first segment to start at 0
      updatedSegments[0].startTime = 0;
    } else if (segmentIndex === segments.length - 1) {
      // If removing the last segment, extend the previous segment to the end
      updatedSegments[segmentIndex - 1].endTime = totalDuration;
    } else {
      // If removing a middle segment, extend the previous segment to cover the removed segment's time
      updatedSegments[segmentIndex - 1].endTime = removedSegment.endTime;
    }

    onSegmentChange(updatedSegments);
    onSegmentSelect(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const cutPoints = getCutPoints();

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineControls}>
        <button
          className={styles.addButton}
          onClick={handleAddCutPoint}
          title="Add cut point (click on timeline)"
        >
          + Add Cut Point
        </button>
      </div>
      <div className={styles.timeMarkers}>
        {Array.from({length: Math.floor(totalDuration * 10) + 1}).map(
          (_, i) => {
            const time = i * 0.1;
            if (time > totalDuration) return null;
            return (
              <div key={i} className={styles.timeMarker}>
                {i % 10 === 0 && (
                  <span className={styles.timeLabel}>{formatTime(time)}</span>
                )}
              </div>
            );
          }
        )}
      </div>
      <div
        ref={timelineRef}
        className={styles.timeline}
        onMouseMove={handleMouseMove}
        onClick={handleTimelineClick}
      >
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={`${styles.segment} ${
              selectedSegmentId === segment.id ? styles.selected : ""
            }`}
            style={{
              left: `${(segment.startTime / totalDuration) * 100}%`,
              width: `${
                ((segment.endTime - segment.startTime) / totalDuration) * 100
              }%`,
            }}
            onClick={(e) => handleSegmentClick(e, segment)}
          >
            <div className={styles.segmentContent}>
              <span className={styles.segmentTime}>
                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
              </span>
              <span className={styles.segmentAction}>{segment.action}</span>
            </div>
            {segments.length > 1 && (
              <button
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSegment(segment.id);
                }}
                title="Remove segment"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Cut points */}
        {cutPoints.slice(1, -1).map((cutPoint, index) => (
          <div
            key={`cut-${index}`}
            className={`${styles.cutPoint} ${
              draggedCutPointIndex === index + 1 ? styles.dragging : ""
            }`}
            style={{
              left: `${(cutPoint / totalDuration) * 100}%`,
            }}
            onMouseDown={(e) => handleCutPointMouseDown(e, index + 1)}
          >
            <div className={styles.cutPointHandle} />
          </div>
        ))}
      </div>
    </div>
  );
}
