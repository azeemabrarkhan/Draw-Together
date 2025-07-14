import type { Coordinates } from "./coordinates";
import { ToolTypes } from "../enums/tool-types";

export type CoordinatesData = {
  from: Coordinates;
  to: Coordinates;
};

export type StrokeHistory = {
  toolType: ToolTypes;
  strokeColor: string;
  fillColor: string;
  strokeSize: number;
  data: CoordinatesData[];
};
