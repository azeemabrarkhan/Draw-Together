import { useRef, useEffect, useCallback } from "react";
import { drawOnCanvas, getCanvasMouseCoords } from "../utils/canvas";
import { ToolNames } from "../enums/toolNames";
import type { Coordinates } from "../models/coordinates";
import type { StrokeData, StrokeHistory } from "../models/strokes";

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  zoom: number,
  color: string,
  strokeSize: number,
  selectedTool: ToolNames
) => {
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const zoomRef = useRef(zoom);
  const colorRef = useRef<string>(color);
  const strokeSizeRef = useRef<number>(strokeSize);
  const selectedToolRef = useRef<ToolNames>(selectedTool);

  const panCoords = useRef({ x: 0, y: 0 });
  const lastMouseCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const lastPanCoords = useRef<Coordinates>({ x: 0, y: 0 });

  const strokesData = useRef<StrokeData[]>([]);
  const history = useRef<StrokeHistory[]>([]);

  const drawHistory = useCallback(
    (canvasContext: CanvasRenderingContext2D | null) => {
      if (canvasContext) {
        history.current.forEach((stroke) =>
          stroke.data.forEach((data) =>
            drawOnCanvas(
              data.from,
              data.to,
              canvasContext,
              stroke.toolType,
              data.color,
              data.strokeSize
            )
          )
        );
      }
    },
    []
  );

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.translate(panCoords.current.x, panCoords.current.y);
    canvasContext.scale(zoomRef.current, zoomRef.current);

    drawHistory(canvasContext);
  }, [canvasRef, drawHistory]);

  // Zoom effect — toward canvas center
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const center = {
      x: rect.width / 2,
      y: rect.height / 2,
    };

    const preZoomX = (center.x - panCoords.current.x) / zoomRef.current;
    const preZoomY = (center.y - panCoords.current.y) / zoomRef.current;

    zoomRef.current = zoom;

    panCoords.current.x = center.x - preZoomX * zoom;
    panCoords.current.y = center.y - preZoomY * zoom;

    panCoords.current.x = Math.round(panCoords.current.x * 1000) / 1000;
    panCoords.current.y = Math.round(panCoords.current.y * 1000) / 1000;

    setupCanvas();
  }, [zoom, setupCanvas]);

  // Update refs
  useEffect(() => {
    colorRef.current = color;
    strokeSizeRef.current = strokeSize;
    selectedToolRef.current = selectedTool;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor =
        selectedToolRef.current === ToolNames.PAN ? "grab" : "crosshair";
    }
  }, [color, strokeSize, selectedTool]);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (selectedToolRef.current === ToolNames.PAN) {
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
          zoomRef.current
        );
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && !isDrawing.current) return;

      if (selectedToolRef.current === ToolNames.PAN && isDragging.current) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - lastMouseCoords.current.x;
        const dy = y - lastMouseCoords.current.y;

        panCoords.current = {
          x: lastPanCoords.current.x + dx,
          y: lastPanCoords.current.y + dy,
        };

        setupCanvas();
      } else {
        const currentMouseCoords = getCanvasMouseCoords(
          e,
          canvas,
          panCoords.current,
          zoomRef.current
        );

        switch (selectedToolRef.current) {
          case ToolNames.DRAW:
            drawOnCanvas(
              lastMouseCoords.current,
              currentMouseCoords,
              canvasContext,
              selectedToolRef.current,
              colorRef.current,
              strokeSizeRef.current
            );

            strokesData.current.push({
              from: { ...lastMouseCoords.current },
              to: { ...currentMouseCoords },
              color: colorRef.current,
              strokeSize: strokeSizeRef.current,
            });

            lastMouseCoords.current = currentMouseCoords;
            break;
          default:
            setupCanvas();

            drawOnCanvas(
              lastMouseCoords.current,
              currentMouseCoords,
              canvasContext,
              selectedToolRef.current,
              colorRef.current,
              strokeSizeRef.current
            );
            break;
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (selectedToolRef.current !== ToolNames.PAN) {
        const currentMouseCoords = getCanvasMouseCoords(
          e,
          canvas,
          panCoords.current,
          zoomRef.current
        );

        const data =
          selectedToolRef.current === ToolNames.DRAW
            ? [...strokesData.current]
            : [
                {
                  from: { ...lastMouseCoords.current },
                  to: { ...currentMouseCoords },
                  color: colorRef.current,
                  strokeSize: strokeSizeRef.current,
                },
              ];

        history.current.push({
          toolType: selectedToolRef.current,
          data,
        });
      }

      isDragging.current = false;
      isDrawing.current = false;
      lastMouseCoords.current = { x: 0, y: 0 };
      strokesData.current = [];
    };

    window.addEventListener("resize", setupCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", setupCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef, setupCanvas]);

  const clearCanvas = useCallback(() => {
    history.current = [];
    setupCanvas();
  }, [setupCanvas]);

  return {
    clearCanvas,
    pan: panCoords.current,
    zoom: zoomRef.current,
    isDrawing: isDrawing.current,
    isDragging: isDragging.current,
  };
};
