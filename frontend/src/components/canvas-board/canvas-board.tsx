import { useRef, useState } from "react";
import { useCanvas } from "../../hooks/useCanvas";

import styles from "./styles.module.css";
import type { HomeStateType } from "../../pages/home/home";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

type CanvasBoardPropsType = HomeStateType;

const CanvasBoard = (props: CanvasBoardPropsType) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const { color, strokeSize, selectedTool } = props;

  useCanvas(canvasRef, zoom, color, strokeSize, selectedTool);

  const handleZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const direction = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    const newZoom = Math.min(Math.max(zoom + direction, MIN_ZOOM), MAX_ZOOM);

    setZoom(newZoom);
  };

  return (
    <canvas ref={canvasRef} className={styles.canvas} onWheel={handleZoom} />
  );
};

export default CanvasBoard;
