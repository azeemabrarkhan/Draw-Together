import { useEffect, useReducer, useRef } from "react";
import { CanvasBoard, ToolBar } from "../../components";
import type { Coordinates, StrokeHistory } from "../../models";
import { ToolTypes, HomeStateActionTypes } from "../../enums";

import styles from "./styles.module.css";
import { uploadFile, isStrokeHistoryArray } from "../../utils";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.5;

type HomeStateType = {
  isImporting: boolean;
  color: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
};

export type HomeStateAction = {
  type: HomeStateActionTypes;
  payload?:
    | number
    | boolean
    | string
    | ToolTypes
    | StrokeHistory
    | StrokeHistory[];
};

const homeStateReducer = (state: HomeStateType, action: HomeStateAction) => {
  switch (action.type) {
    case HomeStateActionTypes.SET_IS_IMPORTING:
      return { ...state, isImporting: action.payload as boolean };
    case HomeStateActionTypes.SET_COLOR:
      return { ...state, color: action.payload as string };
    case HomeStateActionTypes.SET_HISTORY:
      return {
        ...state,
        redoHistory: [],
        history: action.payload as StrokeHistory[],
      };
    case HomeStateActionTypes.ADD_HISTORY:
      return {
        ...state,
        history: state.history.concat(action.payload as StrokeHistory),
      };
    case HomeStateActionTypes.NEW_CANVAS:
      return {
        ...state,
        history: [],
        redoHistory: [],
      };
    case HomeStateActionTypes.UNDO: {
      const historyCopy = [...state.history];
      const lastHistoryItem = historyCopy.pop();
      const redoHistoryCopy = lastHistoryItem
        ? [...state.redoHistory, lastHistoryItem]
        : [...state.redoHistory];

      return {
        ...state,
        history: historyCopy,
        redoHistory: redoHistoryCopy,
      };
    }
    case HomeStateActionTypes.REDO: {
      const redoHistoryCopy = [...state.redoHistory];
      const lastRedoHistoryItem = redoHistoryCopy.pop();
      const historyCopy = lastRedoHistoryItem
        ? [...state.history, lastRedoHistoryItem]
        : [...state.history];
      return {
        ...state,
        history: historyCopy,
        redoHistory: redoHistoryCopy,
      };
    }
    case HomeStateActionTypes.SET_TOOL:
      return { ...state, selectedTool: action.payload as ToolTypes };
    case HomeStateActionTypes.SET_STROKE_SIZE:
      return { ...state, strokeSize: action.payload as number };
    case HomeStateActionTypes.SET_ZOOM:
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
    isImporting: false,
    color: "#000000",
    history: [],
    redoHistory: [],
    selectedTool: ToolTypes.DRAW,
    strokeSize: 2,
    zoom: { current: MIN_ZOOM, last: MIN_ZOOM },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panCoords = useRef<Coordinates>({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasConfig.isImporting) return;

    uploadFile("application/json")
      .then((data) => {
        if (isStrokeHistoryArray(data)) {
          setCanvasConfig({
            type: HomeStateActionTypes.SET_HISTORY,
            payload: data,
          });
        } else {
          console.log("Unsupported json file");
        }
      })
      .catch((e) => console.log(e))
      .finally(() =>
        setCanvasConfig({
          type: HomeStateActionTypes.SET_IS_IMPORTING,
          payload: false,
        })
      );
  }, [canvasConfig.isImporting]);

  const props = { ...canvasConfig, setCanvasConfig, canvasRef, panCoords };

  return (
    <div className={styles.home}>
      <ToolBar {...props} />
      <CanvasBoard {...props} />
      <span
        className={styles.zoom_indicator}
      >{`Zoom: ${canvasConfig.zoom.current}`}</span>
    </div>
  );
};
