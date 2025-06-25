import { useRef, useEffect, useCallback, useContext } from "react";
import { ToolBarContext } from "../contexts/toolbar-context";
import { getCanvasMouseCoords } from "../utils/canvas";

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  zoom: number = 1,
  mousePos: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const isDrawing = useRef(false);
  const pan = useRef({ ...mousePos });
  const zoomRef = useRef(zoom);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<
    Array<{
      moveTo: { x: number; y: number };
      lineTo: { x: number; y: number };
      color: string;
      strokeSize: number;
    }>
  >([]);

  const { color, strokeSize } = useContext(ToolBarContext);

  const drawHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    history.current.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeSize;
      ctx.beginPath();
      ctx.moveTo(stroke.moveTo.x, stroke.moveTo.y);
      ctx.lineTo(stroke.lineTo.x, stroke.lineTo.y);
      ctx.stroke();
    });
  }, [canvasRef]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(pan.current.x, pan.current.y);
    ctx.scale(zoomRef.current * dpr, zoomRef.current * dpr);

    drawHistory();
  }, [canvasRef, drawHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const scale = zoomRef.current * dpr;
    const newScale = zoom * dpr;

    const preZoomX = (mousePos.x - pan.current.x) / scale;
    const preZoomY = (mousePos.y - pan.current.y) / scale;

    zoomRef.current = zoom;

    pan.current.x = mousePos.x - preZoomX * newScale;
    pan.current.y = mousePos.y - preZoomY * newScale;

    setupCanvas();

    console.log({
      dpr,
    });
  }, [zoom, mousePos, setupCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      lastPos.current = getCanvasMouseCoords(
        e,
        canvas,
        pan.current,
        zoomRef.current,
        dpr
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;

      const currentPos = getCanvasMouseCoords(
        e,
        canvas,
        pan.current,
        zoomRef.current,
        dpr
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      history.current.push({
        moveTo: { ...lastPos.current },
        lineTo: { ...currentPos },
        color,
        strokeSize,
      });

      lastPos.current = currentPos;
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    const dpiQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
    dpiQuery.addEventListener("change", setupCanvas);
    window.addEventListener("resize", setupCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      dpiQuery.removeEventListener("change", setupCanvas);
      window.removeEventListener("resize", setupCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef, color, strokeSize, setupCanvas]);

  // Optional public API
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
  };
};
