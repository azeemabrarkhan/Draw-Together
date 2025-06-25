import { useRef } from "react";
import { useCanvas } from "../../hooks/useCanvas";

import styles from "./styles.module.css";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvas(canvasRef);

  return <canvas className={styles.canvas} ref={canvasRef} />;
};

export default CanvasBoard;
