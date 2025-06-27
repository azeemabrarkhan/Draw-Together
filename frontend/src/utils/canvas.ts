import { ToolNames } from "../enums/toolNames";

export const getCanvasMouseCoords = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  pan: { x: number; y: number },
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
  startCursorLocation: { x: number; y: number },
  currentCursorLocation: { x: number; y: number },
  canvasContext: CanvasRenderingContext2D | null,
  toolType: ToolNames,
  strokeStyle: string,
  strokeWidth: number
) => {
  if (!canvasContext) return;

  canvasContext.strokeStyle = strokeStyle;
  canvasContext.lineWidth = strokeWidth;
  canvasContext.beginPath();

  switch (toolType) {
    case ToolNames.DRAW:
      canvasContext.moveTo(startCursorLocation.x, startCursorLocation.y);
      canvasContext.lineTo(currentCursorLocation.x, currentCursorLocation.y);
      break;

    case ToolNames.CIRCLE:
      const width = currentCursorLocation.x - startCursorLocation.x;
      const height = currentCursorLocation.y - startCursorLocation.y;
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      canvasContext.beginPath();
      canvasContext.arc(
        startCursorLocation.x + width / 2,
        startCursorLocation.y + height / 2,
        radius,
        0,
        Math.PI * 2
      );
      break;

    default:
      break;
  }

  canvasContext.stroke();
};
