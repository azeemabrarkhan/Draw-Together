import { useEffect, useRef } from "react";
import { ZOOM_STEP, type HomeStateAction } from "../../pages";
import type { Coordinates, StrokeData, StrokeHistory } from "../../models";
import { Colors, HomeStateActionTypes, ToolTypes } from "../../enums";

import styles from "./styles.module.css";

import {
  drawOnCanvas,
  getCanvasMouseCoords,
  setupCanvas,
} from "../../utils/canvas";
import { CanvasOverlay } from "..";

type CanvasBoardPropsType = {
  isImporting: boolean;
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
    setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
  }, [history, redoHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor =
        selectedTool === ToolTypes.PAN
          ? "move"
          : selectedTool === ToolTypes.ERASER ||
            selectedTool === ToolTypes.FILL_COLOR
          ? "none"
          : "crosshair";
    }
  }, [selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;

    const scaleRatio = zoom.current / zoom.last;

    panCoords.current.x =
      Math.round(
        (centerX - (centerX - panCoords.current.x) * scaleRatio) * 1000
      ) / 1000;
    panCoords.current.y =
      Math.round(
        (centerY - (centerY - panCoords.current.y) * scaleRatio) * 1000
      ) / 1000;

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
        case ToolTypes.ERASER:
          const strokeColor =
            selectedTool === ToolTypes.ERASER ? Colors.WHITE : color;

          drawOnCanvas(
            lastMouseCoords.current,
            currentMouseCoords,
            canvas,
            selectedTool,
            strokeColor,
            strokeSize
          );

          strokesData.current.push({
            from: { ...lastMouseCoords.current },
            to: { ...currentMouseCoords },
            color: strokeColor,
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
        selectedTool === ToolTypes.DRAW || selectedTool === ToolTypes.ERASER
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
        type: HomeStateActionTypes.ADD_HISTORY,
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
      type: HomeStateActionTypes.SET_ZOOM,
      payload: zoom.current + direction,
    });
  };

  return (
    <>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleZoom}
      />
      <CanvasOverlay
        canvasRef={canvasRef}
        strokeSize={strokeSize}
        zoom={zoom.current}
        selectedTool={selectedTool}
      />
    </>
  );
};
