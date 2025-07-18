import { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { ZOOM_STEP, type HomeStateAction } from "../../pages";
import type { Coordinates, CoordinatesData, StrokeHistory } from "../../models";
import { Colors, HomeStateActionTypes, ToolTypes } from "../../enums";

import styles from "./styles.module.css";

import {
  drawOnCanvas,
  getCanvasMouseCoords,
  setupCanvas,
  getClickedShapes,
} from "../../utils/canvas";
import { CanvasOverlay } from "..";
import { toast } from "react-toastify";

type CanvasBoardPropsType = {
  isImporting: boolean;
  strokeColor: string;
  fillColor: string;
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
  strokeColor,
  fillColor,
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
  const zIndex = useRef(0);
  const lastPanCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const lastMouseCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const shapeTo = useRef<Coordinates>({ x: 0, y: 0 });
  const strokesData = useRef<CoordinatesData[]>([]);

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
          : selectedTool === ToolTypes.ERASER || selectedTool === ToolTypes.FILL
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
          const drawColor =
            selectedTool === ToolTypes.ERASER ? Colors.WHITE : strokeColor;
          const colorFill =
            selectedTool === ToolTypes.ERASER ? Colors.WHITE : fillColor;

          drawOnCanvas(
            lastMouseCoords.current,
            currentMouseCoords,
            canvas,
            selectedTool,
            drawColor,
            colorFill,
            strokeSize
          );

          strokesData.current.push({
            from: { ...lastMouseCoords.current },
            to: { ...currentMouseCoords },
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

          const shapeEndPoint = drawOnCanvas(
            lastMouseCoords.current,
            currentMouseCoords,
            canvas,
            selectedTool,
            strokeColor,
            fillColor,
            strokeSize
          );

          if (shapeEndPoint) {
            shapeTo.current = shapeEndPoint;
          }
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

      const strokeHistorySlice: StrokeHistory = {
        id: nanoid(),
        toolType: selectedTool,
        strokeColor,
        fillColor,
        strokeSize,
        zIndex: zIndex.current,
        data: [],
      };

      switch (selectedTool) {
        case ToolTypes.FILL:
          const clickedElement = getClickedShapes(currentMouseCoords, history);
          if (!clickedElement) {
            toast.warn(
              "Please click on a drawn shape to apply the fill color."
            );
          } else if (clickedElement.fillColor !== fillColor) {
            strokeHistorySlice.id = clickedElement.id;
            strokeHistorySlice.toolType = clickedElement.toolType;
            strokeHistorySlice.strokeColor = clickedElement.strokeColor;
            strokeHistorySlice.strokeSize = clickedElement.strokeSize;
            strokeHistorySlice.zIndex = clickedElement.zIndex;
            strokeHistorySlice.data = JSON.parse(
              JSON.stringify(clickedElement.data)
            );
          }
          break;

        case ToolTypes.DRAW:
          strokeHistorySlice.data = strokesData.current;
          break;

        case ToolTypes.ERASER:
          strokeHistorySlice.data = strokesData.current;
          strokeHistorySlice.strokeColor = Colors.WHITE;
          strokeHistorySlice.fillColor = Colors.WHITE;
          break;

        default:
          strokeHistorySlice.data = [
            {
              from: { ...lastMouseCoords.current },
              to: { ...shapeTo.current },
            },
          ];
      }

      if (strokeHistorySlice.data.length > 0) {
        setCanvasConfig({
          type: HomeStateActionTypes.ADD_HISTORY,
          payload: strokeHistorySlice,
        });

        if (selectedTool !== ToolTypes.FILL) {
          zIndex.current += 1;
        }
      }
    }

    isDragging.current = false;
    isDrawing.current = false;
    lastMouseCoords.current = { x: 0, y: 0 };
    lastPanCoords.current = { x: 0, y: 0 };
    shapeTo.current = { x: 0, y: 0 };
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
        zoom={zoom.current}
        selectedTool={selectedTool}
      />
    </>
  );
};
