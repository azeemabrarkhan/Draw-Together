import { useReducer, useRef } from "react";
import { CanvasBoard, ToolBar } from "../../components";
import type { Coordinates, StrokeHistory } from "../../models";
import { ToolTypes, HomeStateActionTypes } from "../../enums";

import styles from "./styles.module.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.5;

type HomeStateType = {
  color: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
};

export type HomeStateAction = {
  type: HomeStateActionTypes;
  payload: string | StrokeHistory | ToolTypes | number;
};

const homeStateReducer = (state: HomeStateType, action: HomeStateAction) => {
  // console.log(action);
  // console.log((action.payload as number) < MIN_ZOOM);
  switch (action.type) {
    case HomeStateActionTypes.COLOR:
      return { ...state, color: action.payload as string };
    case HomeStateActionTypes.HISTORY:
      return {
        ...state,
        history: state.history.concat(action.payload as StrokeHistory),
      };
    case HomeStateActionTypes.REDO_HISTORY:
      return {
        ...state,
        redoHistory: state.redoHistory.concat(action.payload as StrokeHistory),
      };
    case HomeStateActionTypes.SELECTED_TOOL:
      return { ...state, selectedTool: action.payload as ToolTypes };
    case HomeStateActionTypes.STROKE_SIZE:
      return { ...state, strokeSize: action.payload as number };
    case HomeStateActionTypes.ZOOM:
      if (
        (action.payload as number) < MIN_ZOOM ||
        (action.payload as number) > MAX_ZOOM
      )
        return state;
      else
        return {
          ...state,
          zoom: { current: action.payload as number, last: state.zoom.current },
        };
  }
};

export const Home = () => {
  const [canvasConfig, setCanvasConfig] = useReducer(homeStateReducer, {
    color: "#000000",
    history: [],
    redoHistory: [],
    selectedTool: ToolTypes.DRAW,
    strokeSize: 2,
    zoom: { current: MIN_ZOOM, last: MIN_ZOOM },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panCoords = useRef<Coordinates>({ x: 0, y: 0 });

  const props = { ...canvasConfig, setCanvasConfig, canvasRef, panCoords };

  return (
    <div className={styles.home}>
      <ToolBar {...props} />
      <CanvasBoard {...props} />
    </div>
  );
};
