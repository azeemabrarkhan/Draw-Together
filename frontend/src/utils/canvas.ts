import { Colors } from "../enums";
import { ToolTypes } from "../enums/tool-types";
import type { Coordinates } from "../models/coordinates";
import type { StrokeHistory } from "../models/strokes";

export const ERASER_SIZE = 50;
const INTERACTABLE_SHAPES = [
  ToolTypes.CIRCLE,
  ToolTypes.SQUARE,
  ToolTypes.RECTANGLE,
  ToolTypes.UP_TRIANGLE,
  ToolTypes.DOWN_TRIANGLE,
  ToolTypes.RIGHT_TRIANGLE,
  ToolTypes.LEFT_TRIANGLE,
  ToolTypes.LINE,
];

export const getMinX = (shape: StrokeHistory) =>
  Math.min(shape.data[0].from.x, shape.data[0].to.x);

export const getMinY = (shape: StrokeHistory) =>
  Math.min(shape.data[0].from.y, shape.data[0].to.y);

export const getWidth = (shape: StrokeHistory) =>
  Math.abs(shape.data[0].to.x - shape.data[0].from.x);

export const getHeight = (shape: StrokeHistory) =>
  Math.abs(shape.data[0].to.y - shape.data[0].from.y);

export const getNormalizedEndPointForSymmetricalShapes = (
  from: Coordinates,
  to: Coordinates
) => {
  const width = to.x - from.x;
  const height = to.y - from.y;
  const size = Math.min(Math.abs(width), Math.abs(height));

  return {
    x: to.x < from.x ? from.x - size : from.x + size,
    y: to.y < from.y ? from.y - size : from.y + size,
  };
};

export const getCoordsFromTouchEvent = (
  e: React.TouchEvent<HTMLCanvasElement>
): Coordinates | null => {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  } else {
    return null;
  }
};

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

  const shapesToRender = getShapesToRender(history);
  drawHistory(canvas, shapesToRender);
};

export const getShapesToRender = (
  history: StrokeHistory[]
): StrokeHistory[] => {
  const shapesMap = new Map<string, StrokeHistory>();
  const historyCopy = [...history];

  historyCopy.reverse().forEach((shape) => {
    if (!shapesMap.has(shape.id)) {
      shapesMap.set(shape.id, shape);
    }
  });

  return Array.from(shapesMap.values())
    .filter((shape) => !shape.isDisabled)
    .sort((a, b) => a.zIndex - b.zIndex);
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
        stroke.strokeColor,
        stroke.fillColor,
        stroke.strokeSize
      )
    )
  );
};

export const getCanvasMouseCoords = (
  screenCoords: Coordinates,
  canvas: HTMLCanvasElement,
  pan: Coordinates,
  zoom: number
) => {
  const rect = canvas?.getBoundingClientRect();

  const rawX = screenCoords.x - rect.left;
  const rawY = screenCoords.y - rect.top;

  return {
    x: (rawX - pan.x) / zoom,
    y: (rawY - pan.y) / zoom,
  };
};

export const isCoordOnShape = (coords: Coordinates, shape: StrokeHistory) => {
  if (!INTERACTABLE_SHAPES.includes(shape.toolType)) return false;

  const { from, to } = shape.data[0];

  return (
    (from.x < coords.x &&
      coords.x < to.x &&
      from.y < coords.y &&
      coords.y < to.y) ||
    (from.x < coords.x &&
      coords.x < to.x &&
      from.y > coords.y &&
      coords.y > to.y) ||
    (from.x > coords.x &&
      coords.x > to.x &&
      from.y < coords.y &&
      coords.y < to.y) ||
    (from.x > coords.x &&
      coords.x > to.x &&
      from.y > coords.y &&
      coords.y > to.y)
  );
};

export const getShapeAtPosition = (
  coords: Coordinates,
  history: StrokeHistory[]
) => {
  const shapesToRender = getShapesToRender(history);

  const clickedElements = shapesToRender
    .filter((shape) => isCoordOnShape(coords, shape))
    .sort((a, b) => b.zIndex - a.zIndex);

  return clickedElements[0];
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
    case ToolTypes.LINE:
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

    case ToolTypes.CIRCLE:
      const diameter = Math.min(Math.abs(width), Math.abs(height));
      const radius = diameter / 2;

      canvasContext.arc(
        to.x < from.x ? from.x - radius : from.x + radius,
        to.y < from.y ? from.y - radius : from.y + radius,
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
  canvasContext.fill();
  canvasContext.stroke();
};
