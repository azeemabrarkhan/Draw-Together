import { useRef, useState, useCallback } from "react";
import { useCanvas } from "../../hooks/useCanvas";

import styles from "./styles.module.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useCanvas(canvasRef, zoom, mousePos);

  const handleZoom = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;

      const newZoom = Math.min(
        Math.max(Math.round((zoom + delta) * 10) / 10, MIN_ZOOM),
        MAX_ZOOM
      );

      if (newZoom !== zoom) {
        setZoom(newZoom);
        setMousePos(mouse);
      }
    },
    [zoom]
  );

  // console.log(zoom);

  return (
    <canvas ref={canvasRef} className={styles.canvas} onWheel={handleZoom} />
  );
};

export default CanvasBoard;
