import type { Coordinates } from "./coordinates";
import { ToolTypes } from "../enums/toolTypes";

export type StrokeData = {
  from: Coordinates;
  to: Coordinates;
  color: string;
  strokeSize: number;
};

export type StrokeHistory = {
  toolType: ToolTypes;
  data: StrokeData[];
};
