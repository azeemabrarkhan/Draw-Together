import { useRef, useEffect, useCallback } from "react";
import { getCanvasMouseCoords } from "../utils/canvas";
import { ToolNames } from "../enums/toolNames";

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  zoom: number,
  color: string,
  strokeSize: number,
  selectedTool: ToolNames
) => {
  const isDrawing = useRef(false);
  const pan = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const strokeSizeRef = useRef<number>(strokeSize);
  const colorRef = useRef<string>(color);
  const history = useRef<
    Array<{
      moveTo: { x: number; y: number };
      lineTo: { x: number; y: number };
      color: string;
      strokeSize: number;
    }>
  >([]);

  const drawHistory = useCallback(
    (ctx: CanvasRenderingContext2D | null) => {
      if (ctx !== null) {
        history.current.forEach((stroke) => {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.strokeSize;
          ctx.beginPath();
          ctx.moveTo(stroke.moveTo.x, stroke.moveTo.y);
          ctx.lineTo(stroke.lineTo.x, stroke.lineTo.y);
          ctx.stroke();
        });
      }
    },
    [canvasRef]
  );

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(pan.current.x, pan.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    drawHistory(ctx);
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

    const preZoomX = (center.x - pan.current.x) / zoomRef.current;
    const preZoomY = (center.y - pan.current.y) / zoomRef.current;

    zoomRef.current = zoom;

    pan.current.x = center.x - preZoomX * zoom;
    pan.current.y = center.y - preZoomY * zoom;

    pan.current.x = Math.round(pan.current.x * 1000) / 1000;
    pan.current.y = Math.round(pan.current.y * 1000) / 1000;

    setupCanvas();
  }, [zoom, setupCanvas]);

  useEffect(() => {
    colorRef.current = color;
    strokeSizeRef.current = strokeSize;
  }, [color, strokeSize]);

  // Drawing logic
  useEffect(() => {
    console.log("drawing logic");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (selectedTool === ToolNames.PAN) {
      canvas.style.cursor = "grab";
    } else {
      canvas.style.cursor = "crosshair";
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (selectedTool === ToolNames.PAN) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        isDragging.current = true;
        dragStart.current = { x: mouseX, y: mouseY };
        panStart.current = { ...pan.current };
      } else if (selectedTool === ToolNames.DRAW) {
        isDrawing.current = true;
        lastPos.current = getCanvasMouseCoords(
          e,
          canvas,
          pan.current,
          zoomRef.current
        );
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedTool === ToolNames.PAN && isDragging.current) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const dx = mouseX - dragStart.current.x;
        const dy = mouseY - dragStart.current.y;

        pan.current = {
          x: panStart.current.x + dx,
          y: panStart.current.y + dy,
        };

        setupCanvas(); // redraw at new pan position
      } else if (
        selectedTool === ToolNames.DRAW &&
        isDrawing.current &&
        lastPos.current
      ) {
        const currentPos = getCanvasMouseCoords(
          e,
          canvas,
          pan.current,
          zoomRef.current
        );
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth = strokeSizeRef.current;
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        history.current.push({
          moveTo: { ...lastPos.current },
          lineTo: { ...currentPos },
          color: colorRef.current,
          strokeSize: strokeSizeRef.current,
        });

        lastPos.current = currentPos;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isDrawing.current = false;
      lastPos.current = null;
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
  }, [canvasRef, selectedTool, setupCanvas]);

  // Public API
  const clearCanvas = useCallback(() => {
    history.current = [];
    setupCanvas();
  }, [setupCanvas]);

  const redrawCanvas = useCallback(() => {
    setupCanvas();
  }, [setupCanvas]);

  return {
    clearCanvas,
    redrawCanvas,
    pan: pan.current,
    zoom: zoomRef.current,
    isDrawing: isDrawing.current,
    isDragging: isDragging.current,
  };
};
