import { useContext, useEffect, useRef, useCallback } from "react";
import { ToolBarContext } from "../contexts/toolbar-context";

let history: Array<{
  moveTo: {
    x: number;
    y: number;
  };
  lineTo: {
    x: number;
    y: number;
  };
  color: string;
  strokeSize: number;
}> = [];

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  zoom: number = 1
) => {
  const isDrawing = useRef(false);
  const zoomRef = useRef(zoom);
  // zoomRef.current = zoom;
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const { color, strokeSize } = useContext(ToolBarContext);

  const drawHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    history.forEach((stroke) => {
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

    ctx.setTransform(dpr * zoomRef.current, 0, 0, dpr * zoomRef.current, 0, 0);

    drawHistory();
  }, [canvasRef]);

  useEffect(() => {
    zoomRef.current = zoom;
    setupCanvas();
  }, [zoom, setupCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getPos = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoomRef.current * dpr);
      const y = (e.clientY - rect.top) / (zoomRef.current * dpr);
      return { x, y };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      lastPos.current = getPos(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;
      const currentPos = getPos(e);

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      history.push({
        moveTo: {
          x: lastPos.current.x,
          y: lastPos.current.y,
        },
        lineTo: {
          x: currentPos.x,
          y: currentPos.y,
        },
        color,
        strokeSize,
      });

      lastPos.current = currentPos;
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    window.addEventListener("resize", setupCanvas);

    const dpiQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    dpiQuery.addEventListener("change", setupCanvas);

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", setupCanvas);
      dpiQuery.removeEventListener("change", setupCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef, color, strokeSize, setupCanvas]);
};
