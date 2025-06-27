import { ToolTypes } from "../enums/toolTypes";
import type { Coordinates } from "../models/coordinates";

export const getCanvasMouseCoords = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  pan: Coordinates,
  zoom: number
) => {
  const rect = canvas.getBoundingClientRect();

  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  return {
    x: (rawX - pan.x) / zoom,
    y: (rawY - pan.y) / zoom,
  };
};

export const drawOnCanvas = (
  from: Coordinates,
  to: Coordinates,
  canvasContext: CanvasRenderingContext2D | null,
  toolType: ToolTypes,
  color: string,
  strokeWidth: number
) => {
  if (!canvasContext) return;

  const width = to.x - from.x;
  const height = to.y - from.y;

  canvasContext.strokeStyle = color;
  canvasContext.lineWidth = strokeWidth;
  canvasContext.beginPath();

  switch (toolType) {
    case ToolTypes.DRAW:
      canvasContext.moveTo(from.x, from.y);
      canvasContext.lineTo(to.x, to.y);
      break;

    case ToolTypes.CIRCLE:
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      canvasContext.beginPath();
      canvasContext.arc(
        from.x + width / 2,
        from.y + height / 2,
        radius,
        0,
        Math.PI * 2
      );
      break;

    case ToolTypes.SQUARE:
      const size = Math.min(Math.abs(width), Math.abs(height));
      canvasContext.rect(
        from.x,
        from.y,
        width < 0 ? -size : size,
        height < 0 ? -size : size
      );
      break;

    case ToolTypes.RECTANGLE:
      canvasContext.rect(from.x, from.y, width, height);
      break;

    default:
      break;
  }

  canvasContext.stroke();
};
