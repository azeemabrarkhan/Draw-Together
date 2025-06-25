import { useRef, useState } from "react";
import { useCanvas } from "../../hooks/useCanvas";

import styles from "./styles.module.css";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.5);

  useCanvas(canvasRef, zoom);

  const handleZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    setZoom((prev) => {
      let newZoom = prev + (e.deltaY < 0 ? 0.5 : -0.5);
      newZoom = Math.min(Math.max(newZoom, 0.5), 5); // Clamp between 0.5 and 5
      return newZoom;
    });
  };

  console.log(zoom);

  return (
    <canvas className={styles.canvas} ref={canvasRef} onWheel={handleZoom} />
  );
};

export default CanvasBoard;
