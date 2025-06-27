import type { Coordinates } from "./coordinates";
import { ToolNames } from "../enums/toolNames";

export type StrokeData = {
  from: Coordinates;
  to: Coordinates;
  color: string;
  strokeSize: number;
};

export type StrokeHistory = {
  toolType: ToolNames;
  data: StrokeData[];
};
