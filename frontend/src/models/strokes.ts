import type { Coordinates } from "./coordinates";
import { ToolTypes } from "../enums/tool-types";

export type CoordinatesData = {
  from: Coordinates;
  to: Coordinates;
};

export type StrokeHistory = {
  id: string;
  toolType: ToolTypes;
  strokeColor: string;
  fillColor: string;
  strokeSize: number;
  zIndex: number;
  data: CoordinatesData[];
};
