import { useEffect, useRef, useState } from "react";
import { CanvasButtons } from "../";
import type { HomeStateType } from "../../pages";
import type { Coordinates, StrokeData, StrokeHistory } from "../../models";
import { ToolTypes } from "../../enums";

import styles from "./styles.module.css";

import {
  drawOnCanvas,
  getCanvasMouseCoords,
  setupCanvas,
} from "../../utils/canvas";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

type CanvasBoardPropsType = HomeStateType;

export const CanvasBoard = ({
  color,
  strokeSize,
  selectedTool,
}: CanvasBoardPropsType) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isDragging = useRef(false);

  const panCoords = useRef({ x: 0, y: 0 });
  const lastPanCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const lastMouseCoords = useRef<Coordinates>({ x: 0, y: 0 });

  const strokesData = useRef<StrokeData[]>([]);
  const history = useRef<StrokeHistory[]>([]);
  const redoHistory = useRef<StrokeHistory[]>([]);

  const [zoom, setZoom] = useState({ current: MIN_ZOOM, last: MIN_ZOOM });

  useEffect(() => {
    const handleResize = () => {
      setupCanvas(
        canvasRef.current,
        panCoords.current,
        zoom.current,
        history.current
      );
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

    setupCanvas(
      canvasRef.current,
      panCoords.current,
      zoom.current,
      history.current
    );
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

      setupCanvas(
        canvasRef.current,
        panCoords.current,
        zoom.current,
        history.current
      );
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
            history.current
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

      history.current.push({
        toolType: selectedTool,
        data,
      });
    }

    isDragging.current = false;
    isDrawing.current = false;
    lastMouseCoords.current = { x: 0, y: 0 };
    strokesData.current = [];
  };

  const handleZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const direction = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    const newZoom = Math.min(
      Math.max(zoom.current + direction, MIN_ZOOM),
      MAX_ZOOM
    );
    if (newZoom !== zoom.current) {
      setZoom((zoom) => ({ last: zoom.current, current: newZoom }));
    }
  };

  console.log("rendering");

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
