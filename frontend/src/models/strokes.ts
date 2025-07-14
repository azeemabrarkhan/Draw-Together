import type { Coordinates } from "./coordinates";
import { ToolTypes } from "../enums/tool-types";

export type CoordinatesData = {
  from: Coordinates;
  to: Coordinates;
};

export type StrokeHistory = {
  toolType: ToolTypes;
  data: CoordinatesData[];
  strokeColor: string;
  fillColor: string;
  strokeSize: number;
};
