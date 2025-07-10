import type { Coordinates } from "./coordinates";
import { ToolTypes } from "../enums/tool-types";

export type StrokeData = {
  from: Coordinates;
  to: Coordinates;
  strokeColor: string;
  fillColor: string;
  strokeSize: number;
};

export type StrokeHistory = {
  toolType: ToolTypes;
  data: StrokeData[];
};
