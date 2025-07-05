import { ToolTypes } from "../enums";
import type { Coordinates, StrokeData, StrokeHistory } from "../models";

const validToolTypes = Object.values(ToolTypes);

export function isCoordinates(obj: any): obj is Coordinates {
  return obj && typeof obj.x === "number" && typeof obj.y === "number";
}

export function isStrokeData(obj: any): obj is StrokeData {
  return (
    obj &&
    isCoordinates(obj.from) &&
    isCoordinates(obj.to) &&
    typeof obj.color === "string" &&
    typeof obj.strokeSize === "number"
  );
}

export function isStrokeHistory(obj: any): obj is StrokeHistory {
  return (
    obj &&
    validToolTypes.includes(obj.toolType as ToolTypes) &&
    Array.isArray(obj.data) &&
    obj.data.every(isStrokeData)
  );
}

export function isStrokeHistoryArray(arr: any[]): arr is StrokeHistory[] {
  return Array.isArray(arr) && arr.every(isStrokeHistory);
}
