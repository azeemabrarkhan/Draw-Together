import { Colors } from "../enums";
import { ToolTypes } from "../enums/tool-types";
import type { Coordinates } from "../models/coordinates";
import type { StrokeHistory } from "../models/strokes";

export const ERASER_SIZE = 50;
const SELECTABLE_SHAPES = [
  ToolTypes.CIRCLE,
  ToolTypes.SQUARE,
  ToolTypes.RECTANGLE,
  ToolTypes.UP_TRIANGLE,
  ToolTypes.DOWN_TRIANGLE,
  ToolTypes.RIGHT_TRIANGLE,
  ToolTypes.LEFT_TRIANGLE,
];

export const setupCanvas = (
  canvas: HTMLCanvasElement | null,
  panCoords: Coordinates,
  zoom: number,
  history: StrokeHistory[]
) => {
  if (!canvas) return;
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) return;

  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = width;
  canvas.height = height;

  canvasContext.setTransform(1, 0, 0, 1, 0, 0);
  canvasContext.clearRect(0, 0, width, height);
  canvasContext.fillStyle = Colors.WHITE;
  canvasContext.fillRect(0, 0, width, height);

  canvasContext.translate(panCoords.x, panCoords.y);
  canvasContext.scale(zoom, zoom);

  drawHistory(canvas, history);
};

export const drawHistory = (
  canvas: HTMLCanvasElement | null,
  history: StrokeHistory[]
) => {
  if (!canvas) return;

  history.forEach((stroke) =>
    stroke.data.forEach((data) =>
      drawOnCanvas(
        data.from,
        data.to,
        canvas,
        stroke.toolType,
        data.strokeColor,
        data.fillColor,
        data.strokeSize
      )
    )
  );
};

export const getCanvasMouseCoords = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  pan: Coordinates,
  zoom: number
) => {
  const rect = canvas?.getBoundingClientRect();

  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  return {
    x: (rawX - pan.x) / zoom,
    y: (rawY - pan.y) / zoom,
  };
};

export const getClickedShape = (
  clickCoords: Coordinates,
  history: StrokeHistory[]
) => {
  return history.find(
    (element) =>
      SELECTABLE_SHAPES.includes(element.toolType) &&
      element.data[0].from.x < clickCoords.x &&
      clickCoords.x < element.data[0].to.x &&
      element.data[0].from.y < clickCoords.y &&
      clickCoords.y < element.data[0].to.y
  );
};

export const drawOnCanvas = (
  from: Coordinates,
  to: Coordinates,
  canvas: HTMLCanvasElement | null,
  toolType: ToolTypes,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number
) => {
  if (!canvas) return;
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) return;

  const width = to.x - from.x;
  const height = to.y - from.y;

  canvasContext.strokeStyle = strokeColor;
  canvasContext.fillStyle = fillColor;
  canvasContext.lineWidth = strokeWidth;
  canvasContext.beginPath();

  switch (toolType) {
    case ToolTypes.DRAW:
      canvasContext.moveTo(from.x, from.y);
      canvasContext.lineTo(to.x, to.y);
      break;

    case ToolTypes.ERASER:
      canvasContext.fillRect(
        from.x - ERASER_SIZE / 2,
        to.y - ERASER_SIZE / 2,
        ERASER_SIZE,
        ERASER_SIZE
      );

      break;

    case ToolTypes.LINE:
      canvasContext.moveTo(from.x, from.y);
      canvasContext.lineTo(to.x, to.y);
      break;

    case ToolTypes.CIRCLE:
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
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

    case ToolTypes.UP_TRIANGLE:
      canvasContext.moveTo(from.x + width / 2, from.y);
      canvasContext.lineTo(from.x, from.y + height);
      canvasContext.lineTo(from.x + width, from.y + height);
      canvasContext.closePath();
      break;

    case ToolTypes.RIGHT_TRIANGLE:
      canvasContext.moveTo(from.x + width, from.y + height / 2);
      canvasContext.lineTo(from.x, from.y);
      canvasContext.lineTo(from.x, from.y + height);
      canvasContext.closePath();
      break;

    case ToolTypes.DOWN_TRIANGLE:
      canvasContext.moveTo(from.x + width / 2, from.y + height);
      canvasContext.lineTo(from.x, from.y);
      canvasContext.lineTo(from.x + width, from.y);
      canvasContext.closePath();
      break;

    case ToolTypes.LEFT_TRIANGLE:
      canvasContext.moveTo(from.x, from.y + height / 2);
      canvasContext.lineTo(from.x + width, from.y);
      canvasContext.lineTo(from.x + width, from.y + height);
      canvasContext.closePath();
      break;

    default:
      break;
  }
  if (fillColor !== Colors.WHITE) canvasContext.fill();
  canvasContext.stroke();
};
