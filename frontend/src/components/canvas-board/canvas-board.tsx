import { useEffect, useRef } from "react";
import { ZOOM_STEP, type HomeStateAction } from "../../pages";
import type { Coordinates, StrokeData, StrokeHistory } from "../../models";
import { HomeStateActionTypes, ToolTypes } from "../../enums";

import styles from "./styles.module.css";

import {
  drawOnCanvas,
  getCanvasMouseCoords,
  setupCanvas,
} from "../../utils/canvas";

type CanvasBoardPropsType = {
  color: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
  setCanvasConfig: React.ActionDispatch<[action: HomeStateAction]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  panCoords: React.RefObject<Coordinates>;
};

export const CanvasBoard = ({
  color,
  history,
  redoHistory,
  selectedTool,
  strokeSize,
  zoom,
  setCanvasConfig,
  canvasRef,
  panCoords,
}: CanvasBoardPropsType) => {
  const isDrawing = useRef(false);
  const isDragging = useRef(false);

  const lastPanCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const lastMouseCoords = useRef<Coordinates>({ x: 0, y: 0 });

  const strokesData = useRef<StrokeData[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor =
        selectedTool === ToolTypes.PAN ? "grab" : "crosshair";
    }
  }, [selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const center = {
      x: rect.width / 2,
      y: rect.height / 2,
    };

    const preZoomX = (center.x - panCoords.current.x) / zoom.last;
    const preZoomY = (center.y - panCoords.current.y) / zoom.last;

    panCoords.current.x = center.x - preZoomX * zoom.current;
    panCoords.current.y = center.y - preZoomY * zoom.current;

    panCoords.current.x = Math.round(panCoords.current.x * 1000) / 1000;
    panCoords.current.y = Math.round(panCoords.current.y * 1000) / 1000;

    setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
  }, [zoom.current]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (selectedTool === ToolTypes.PAN) {
      isDragging.current = true;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      lastMouseCoords.current = { x, y };
      lastPanCoords.current = { ...panCoords.current };
    } else {
      isDrawing.current = true;
      lastMouseCoords.current = getCanvasMouseCoords(
        e,
        canvas,
        panCoords.current,
        zoom.current
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isDragging.current && !isDrawing.current) return;

    if (selectedTool === ToolTypes.PAN && isDragging.current) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - lastMouseCoords.current.x;
      const dy = y - lastMouseCoords.current.y;

      panCoords.current = {
        x: lastPanCoords.current.x + dx,
        y: lastPanCoords.current.y + dy,
      };

      setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
    } else {
      const currentMouseCoords = getCanvasMouseCoords(
        e,
        canvas,
        panCoords.current,
        zoom.current
      );

      switch (selectedTool) {
        case ToolTypes.DRAW:
          drawOnCanvas(
            lastMouseCoords.current,
            currentMouseCoords,
            canvas,
            selectedTool,
            color,
            strokeSize
          );

          strokesData.current.push({
            from: { ...lastMouseCoords.current },
            to: { ...currentMouseCoords },
            color: color,
            strokeSize: strokeSize,
          });

          lastMouseCoords.current = currentMouseCoords;
          break;
        default:
          setupCanvas(
            canvasRef.current,
            panCoords.current,
            zoom.current,
            history
          );

          drawOnCanvas(
            lastMouseCoords.current,
            currentMouseCoords,
            canvas,
            selectedTool,
            color,
            strokeSize
          );
          break;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (selectedTool !== ToolTypes.PAN) {
      const currentMouseCoords = getCanvasMouseCoords(
        e,
        canvas,
        panCoords.current,
        zoom.current
      );

      const data =
        selectedTool === ToolTypes.DRAW
          ? [...strokesData.current]
          : [
              {
                from: { ...lastMouseCoords.current },
                to: { ...currentMouseCoords },
                color: color,
                strokeSize: strokeSize,
              },
            ];

      setCanvasConfig({
        type: HomeStateActionTypes.HISTORY,
        payload: {
          toolType: selectedTool,
          data,
        },
      });
    }

    isDragging.current = false;
    isDrawing.current = false;
    lastMouseCoords.current = { x: 0, y: 0 };
    lastPanCoords.current = { x: 0, y: 0 };
    strokesData.current = [];
  };

  const handleZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const direction = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;

    setCanvasConfig({
      type: HomeStateActionTypes.ZOOM,
      payload: zoom.current + direction,
    });
  };

  console.log("rendering", zoom.current);

  return (
    <canvas
      className={styles.canvas}
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleZoom}
    />
  );
};
