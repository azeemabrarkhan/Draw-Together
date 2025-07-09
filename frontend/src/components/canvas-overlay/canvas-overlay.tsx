import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { ERASER_SCALE } from "../../utils";
import { ToolTypes } from "../../enums";

const CURSOR_OR_ICON_SIZE = 24;

type CanvasOverlayProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokeSize: number;
  zoom: number;
  selectedTool: ToolTypes;
};

const defaultState = {
  coordinates: { x: 0, y: 0 },
  cursorSize: 0,
};

export const CanvasOverlay = ({
  canvasRef,
  strokeSize,
  zoom,
  selectedTool,
}: CanvasOverlayProps) => {
  const [cursorConfig, setCustomCursorCoords] = useState(defaultState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (
      selectedTool !== ToolTypes.ERASER &&
      selectedTool !== ToolTypes.FILL_COLOR
    )
      return;

    const cursorSize =
      selectedTool === ToolTypes.ERASER
        ? strokeSize * ERASER_SCALE * zoom
        : CURSOR_OR_ICON_SIZE;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - cursorSize / 2;
      const y = e.clientY - cursorSize / 2;

      setCustomCursorCoords(() => ({
        coordinates: { x, y },
        cursorSize,
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
  }, [canvasRef.current, strokeSize, zoom, selectedTool]);

  return (
    <div
      className={
        selectedTool === ToolTypes.ERASER
          ? styles.eraser_cursor
          : styles.fill_color_cursor
      }
      style={{
        top: cursorConfig.coordinates.y,
        left: cursorConfig.coordinates.x,
        width: cursorConfig.cursorSize,
        height: cursorConfig.cursorSize,
      }}
    ></div>
  );
};
