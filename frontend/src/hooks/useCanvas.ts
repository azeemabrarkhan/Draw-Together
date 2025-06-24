import { useEffect, useRef } from "react";

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    // Set the internal drawing buffer dimensions to match the CSS display dimensions
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      // Calculate scaled position by subtracting the left and top space from the canvas
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      return { x, y };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      lastPos.current = getPos(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;
      const currentPos = getPos(e);

      // Draw locally
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      // Emit stroke for the backend
      // socket.emit('draw', {
      //   boardId,
      //   from: lastPos.current,
      //   to: currentPos,
      //   color: 'black',
      //   width: 2,
      // });

      lastPos.current = currentPos;
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [canvasRef]);
};
