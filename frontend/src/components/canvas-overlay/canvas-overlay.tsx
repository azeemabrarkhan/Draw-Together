import { useCallback, useEffect, useState } from "react";
import styles from "./styles.module.css";
import type { Coordinates } from "../../models";
import { ERASER_SCALE } from "../../utils";

type CanvasOverlayProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokeSize: number;
  zoom: number;
};

const defaultState = {
  customCursorCoords: { x: 0, y: 0 },
  eraserSize: 0,
};

export const CanvasOverlay = ({
  canvasRef,
  strokeSize,
  zoom,
}: CanvasOverlayProps) => {
  const [customCursorCoords, setCustomCursorCoords] = useState(defaultState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const eraserSize = strokeSize * ERASER_SCALE * zoom;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - eraserSize / 2;
      const y = e.clientY - eraserSize / 2;

      setCustomCursorCoords(() => ({
        customCursorCoords: { x, y },
        eraserSize,
      }));
    };

    const handleMouseLeave = () => {
      setCustomCursorCoords(defaultState);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvasRef.current, strokeSize, zoom]);

  return (
    <div
      className={styles.custom_cursor}
      style={{
        top: customCursorCoords.customCursorCoords.y,
        left: customCursorCoords.customCursorCoords.x,
        width: customCursorCoords.eraserSize,
        height: customCursorCoords.eraserSize,
      }}
    ></div>
  );
};
