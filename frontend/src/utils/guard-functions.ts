import { ToolTypes } from "../enums";
import type { Coordinates, CoordinatesData, StrokeHistory } from "../models";

const validToolTypes = Object.values(ToolTypes);

export function isCoordinates(obj: any): obj is Coordinates {
  return obj && typeof obj.x === "number" && typeof obj.y === "number";
}

export function isCoordinatesData(obj: any): obj is CoordinatesData {
  return obj && isCoordinates(obj.from) && isCoordinates(obj.to);
}

export function isStrokeHistory(obj: any): obj is StrokeHistory {
  return (
    obj &&
    validToolTypes.includes(obj.toolType as ToolTypes) &&
    Array.isArray(obj.data) &&
    obj.data.every(isCoordinatesData) &&
    typeof obj.strokeColor === "string" &&
    typeof obj.fillColor === "string" &&
    typeof obj.strokeSize === "number" &&
    typeof obj.id === "string" &&
    typeof obj.zIndex === "number" &&
    typeof obj.isDisabled === "boolean"
  );
}

export function isStrokeHistoryArray(arr: any[]): arr is StrokeHistory[] {
  return Array.isArray(arr) && arr.every(isStrokeHistory);
}
